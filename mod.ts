import { escapeHTML } from "./lib/escape_html.ts";
import { TemplateString } from "./lib/template_string.ts";
import {
  type AttributeValue,
  TemplateAttribute,
} from "./lib/template_attribute.ts";
import { RawContent } from "./lib/raw_content.ts";

type TemplateStringKeyList = unknown[];

export type HTMLTemplateGenerator = AsyncGenerator;
export type HTMLTemplate =
  | HTMLTemplateGenerator
  | Promise<HTMLTemplateGenerator>;

export interface ResponseStream {
  write(chunk: Uint8Array | string): unknown;
  // deno-lint-ignore no-explicit-any
  close?(...args: any): void;
  // deno-lint-ignore no-explicit-any
  end?(...args: any): void;
}

const isAsyncIterator = (thing: unknown) =>
  typeof (thing as AsyncGenerator<unknown>)[Symbol.asyncIterator] ===
    "function";

async function* resolver(
  parts: unknown[] = [],
): HTMLTemplateGenerator {
  let i = 0;
  for (const part of parts) {
    if (part === undefined || part === null || part === false) {
      yield "";
    } else if (typeof part === "number") {
      yield (part).toString();
    } else if ((part as TemplateString).isTemplateString) { // just return the static string parts of template literals
      yield part;
    } else if (Array.isArray(part)) { // key is a list of more sub templates, that have to be rendered sequentially
      yield* resolver(part);
    } else if (part instanceof TemplateAttribute) { // key is a list of more sub templates, that have to be rendered sequentially
      const nextPart = parts[i + 1];

      yield (nextPart instanceof TemplateAttribute)
        ? part.toString()
        : part.toString().trimEnd();
    } else if (
      typeof (part as AsyncGenerator<unknown>)[Symbol.asyncIterator] ===
        "function"
    ) { // key is itself an iterator
      yield* (part as HTMLTemplateGenerator);
    } else if (Object.getPrototypeOf(part) === Object.prototype) {
      const attributes = Object.entries(
        part as Record<string, AttributeValue>,
      )
        .map(([k, v]) => new TemplateAttribute(k, v));
      yield* resolver(attributes);
    } else {
      // part is now a key provided to a template, that should be something like a string
      // Itself might be a new `html` generator, so that we pass yield then to it.
      const resolved = await part;

      // sometimes an asynchronous call results also in an `html` tagged template.
      // Such should not be escaped but handed to yield. (E.g. when a canceled promise results in alternative html`...` content.)
      if (isAsyncIterator(resolved)) {
        yield* (resolved as HTMLTemplateGenerator);
      } else {
        // anything else should be treated as a string and therefore be escaped for control signs
        // yield escapeHtml(resolved as string);
        yield escapeHTML(resolved || "" as string);
      }
    }
    i++;
  }
}

// tagged template literals come with an array for the static strings,
// and a second property with dynamic keys. Because we want to run over
// the given parts sequentially we mix them alternatingly to a single array.
export const mixUp = (
  a1: TemplateStringsArray,
  a2: TemplateStringKeyList = [],
) => {
  return a1.map((el, i) => [new TemplateString(el), a2[i]]).reduce(
    (res, curr) => {
      return res.concat(curr);
    },
    [],
  ).filter((x) => x !== null && x !== undefined);
};

// Tagged template literal function
//
// Usage: html`<some-snippet /><other-snippet />`
export const html = (
  strings: TemplateStringsArray,
  ...keys: TemplateStringKeyList
): HTMLTemplateGenerator => resolver(mixUp(strings, keys));

// Attribute function for dynamically added attributes,
// that can be rendered conditionally, depending on the attribute value.
//
// Usage: html`<some-snippet ${attr("foo", "bar")} />`
export const attr = (key: string, value: AttributeValue): TemplateAttribute =>
  new TemplateAttribute(key, value);

// Attribute function for dynamically added attributes,
// that can be rendered conditionally, depending on the attribute value.
//
// Usage: html`<some-snippet ${attr("foo", raw("bar"))} />`
// Usage: html`<some-snippet ${raw('<script>alert('hello')</script>')} />`
export const raw = (content: unknown): RawContent => new RawContent(content);

// renderer to a fixed output string, resolving all async values provided to the template keys
export const renderToString = async (
  templateOrList: HTMLTemplate | HTMLTemplate[],
): Promise<string> => {
  const result = [];
  const template = Array.isArray(templateOrList)
    ? html`${templateOrList}`
    : templateOrList;

  while (true) {
    const part = await (await template).next();

    result.push(part.value);

    if (part.done) {
      break;
    }
  }

  return result.join("");
};

export type StreamRenderingOptions = {
  closeStream?: boolean;
};

export const renderToStream = async (
  stream: ResponseStream,
  templateOrList: HTMLTemplate,
  { closeStream }: StreamRenderingOptions = { closeStream: false },
) => {
  const encoder = new TextEncoder();
  const template = Array.isArray(templateOrList)
    ? html`${templateOrList}`
    : templateOrList;

  while (true) {
    try {
      const part = await (await template).next();

      stream.write(encoder.encode(part.value));

      if (part.done) {
        if (closeStream) {
          stream.close?.();
          stream.end?.();
        }
        break;
      }
    } catch (e) {
      const error = new Error("Failed to stream the response!", { cause: e });
      console.log(error);
      break;
    }
  }
};

export {
  type AttributeValue,
  TemplateAttribute,
} from "./lib/template_attribute.ts";

export { TemplateString } from "./lib/template_string.ts";
