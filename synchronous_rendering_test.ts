import { assertEquals } from "asserts";
import { attr, html, mixUp, raw, renderToString } from "./mod.ts";
import { minify } from "./lib/minify.ts";
import { TemplateString } from "./lib/template_string.ts";

const sayHelloSync = (text: string): string => text;
const sayHelloAsync = (text: string): Promise<string> =>
  new Promise((resolve, _reject) => setTimeout(() => resolve(text), 100));

Deno.test("simple tag rendering", async () => {
  const template = html`<div></div>`;
  const result = await renderToString(template);
  assertEquals(result, "<div></div>");
});

Deno.test("render simple doc with doctype", async () => {
  const templateLiteral = `
    <!DOCTYPE html>
    <html lang="en">
    <head><title>Document</title></head>
    <body></body>
    </html>
  `;
  const template = html`
    <!DOCTYPE html>
    <html lang="en">
    <head><title>Document</title></head>
    <body></body>
    </html>
  `;
  const result = await renderToString(template);

  assertEquals(result, templateLiteral);
});

Deno.test("render snippet with simple key property", async () => {
  const template = html`<div>${"hello, world!"}</div>`;
  const result = await renderToString(template);
  assertEquals(result, "<div>hello, world!</div>");
});

Deno.test("render snippet with number as property", async () => {
  const template = html`<div>${4711}</div>`;
  const result = await renderToString(template);
  assertEquals(result, "<div>4711</div>");
});

Deno.test("render snippet with zero as property", async () => {
  const template = html`<div>${0}</div>`;
  const result = await renderToString(template);
  assertEquals(result, "<div>0</div>");
});

Deno.test("render snippet with html tag collection key property", async () => {
  const subTemplates = [
    html`<p>hello,</p>`,
    html`<p>world!</p>`,
  ] as Array<AsyncGenerator>;
  const template = html`<div>${subTemplates}</div>`;
  const result = await renderToString(template);

  assertEquals(result, "<div><p>hello,</p><p>world!</p></div>");
});

Deno.test("render snippet with  collection containing nullish, falsish or undefined values", async () => {
  const subTemplates = [
    null,
    false,
    undefined,
  ];
  const template = html`<div>${subTemplates}</div>`;
  const result = await renderToString(template);

  assertEquals(result, "<div></div>");
});

Deno.test("render snippet with async key property", async () => {
  const template = html`<div>${sayHelloAsync("wait for it! Hello,")} ${
    sayHelloSync("you sync world!")
  }</div>`;
  const result = await renderToString(template);

  assertEquals(result, "<div>wait for it! Hello, you sync world!</div>");
});

Deno.test("render snippet with async sub template", async () => {
  const subTemplates = [
    html`<p>${sayHelloAsync("wait for it! Hello,")}</p>`,
    html`<p>${sayHelloSync("you sync world!")}</p>`,
  ];

  const template = html`<div>${subTemplates}</div>`;
  const result = await renderToString(template);

  assertEquals(
    result,
    "<div><p>wait for it! Hello,</p><p>you sync world!</p></div>",
  );
});

Deno.test("render snippet with async sub-sub templates", async () => {
  const subTemplates = [
    html`<p>${sayHelloAsync("wait for it! Hello,")}</p>`,
    html`<p>${html`<em>${
      sayHelloAsync("you async emphasized world!")
    }</em>`}</p>`,
  ];

  const template = html`<div>${subTemplates}</div>`;
  const result = await renderToString(template);

  assertEquals(
    result,
    "<div><p>wait for it! Hello,</p><p><em>you async emphasized world!</em></p></div>",
  );
});

Deno.test("escape input keys that are not `html` tagged templates itself by default", async () => {
  const message = '<script>console.log("hello, world!")</script>';
  const template = html`<div>${message}</div>`;

  const result = await renderToString(template);

  assertEquals(
    result,
    "<div>&lt;script&gt;console.log(&quot;hello, world!&quot;)&lt;/script&gt;</div>",
  );
});

Deno.test("do not escape input keys that are `html` tagged templates itself", async () => {
  const message = html`<script>console.log("hello, world!")</script>`;
  const template = html`<div>${message}</div>`;

  const result = await renderToString(template);

  assertEquals(
    result,
    '<div><script>console.log("hello, world!")</script></div>',
  );
});

Deno.test("escape simple attributes properly", async () => {
  const placeholder = "this is a placeholder& text";
  const template = html`<input type="text" placeholder="${placeholder}" />`;

  const result = await renderToString(template);

  assertEquals(
    result,
    '<input type="text" placeholder="this is a placeholder&amp; text" />',
  );
});

Deno.test("escape attributes properly with conditional props", async () => {
  const placeholder = "this is a placeholder text";
  const template = html`<input type="text"
    ${attr("placeholder", placeholder)}
    ${attr("fake-false-attribute", "false")}
    ${attr("falsi-attribute", false)}
    ${attr("nullish-attribute", null)}
  />`;

  const result = minify(await renderToString(template));

  assertEquals(
    result,
    '<input type="text" placeholder="this is a placeholder text" fake-false-attribute="false" />',
  );
});

Deno.test("render multiple attributes properly encoded", async () => {
  const attributes = {
    placeholder: "this is a placeholder& text",
    required: "required",
  };
  const template = html`<input type="text" ${
    Object.entries(attributes).map(([prop, val]) => attr(prop, val))
  } />`;

  const result = await renderToString(template);

  assertEquals(
    result,
    '<input type="text" placeholder="this is a placeholder&amp; text" required="required" />',
  );
});

Deno.test("mixing up to arrays, should result in an alternating array", () => {
  // deno-lint-ignore no-explicit-any
  const a = ["a", "b", "c", "d"] as any;
  a.raw = ["a", "b", "c", "d"];

  const b = ["val", 0, null, undefined];
  const mixed = mixUp(a as TemplateStringsArray, b);

  assertEquals(
    mixed.length,
    6,
  );

  // deno-lint-ignore no-explicit-any
  const resolved = mixed.map((el: TemplateString | any) =>
    el.isTemplateString ? el.content : el
  );

  assertEquals(
    resolved,
    ["a", "val", "b", 0, "c", "d"],
  );
});

Deno.test("minifying", async (t) => {
  await t.step("minify multiline tag with attributes", async () => {
    const placeholder = "this is a placeholder text";
    const template = html`<input type="text"
      ${attr("placeholder", placeholder)}
      ${attr("fake-false-attribute", "false")}
      ${attr("falsi-attribute", false)}
      ${attr("truey-attribute", true)}
      ${attr("nullish-attribute", null)}
      ${attr("data-test", 5)}
    />`;

    const result = minify(await renderToString(template));

    assertEquals(
      result,
      '<input type="text" placeholder="this is a placeholder text" fake-false-attribute="false" truey-attribute data-test="5" />',
    );
  });

  await t.step(
    "pending spaces before (not self closing) tag endings",
    async () => {
      const template = html`<button ${null}>label</button>`;

      const result = minify(await renderToString(template));

      assertEquals(
        result,
        "<button>label</button>",
      );
    },
  );
});

Deno.test("camelCased attribute names should be rendered in kebap-case", async () => {
  const dataAttribute = `some-data`;
  const template = html`<input type="text" ${
    attr("dataFubar", dataAttribute)
  } />`;

  const result = minify(await renderToString(template));

  assertEquals(
    result,
    '<input type="text" data-fubar="some-data" />',
  );
});

Deno.test("minification test", async () => {
  const template = html`<html ${null}>
    <head>
      <title> test</title>

    </head>
  </html>`;

  const result = minify(await renderToString(template));

  assertEquals(
    result,
    "<html><head><title>test</title></head></html>",
  );
});

Deno.test("object literal attributes", async (t) => {
  await t.step("single data attribute", async () => {
    const template = html`<div ${{ dataFubar: "fubar" }}></div>`;

    const result = minify(await renderToString(template));

    assertEquals(result, '<div data-fubar="fubar"></div>');
  });

  await t.step("multiple attributes", async () => {
    const template = html`<div ${{
      class: "hello",
      dataFubar: "fubar",
      "data-fabula": true,
      falsy: false,
      nully: null,
      undef: undefined,
    }}></div>`;

    const result = minify(await renderToString(template));

    assertEquals(
      result,
      '<div class="hello" data-fubar="fubar" data-fabula></div>',
    );
  });
});

Deno.test("raw content", async (t) => {
  await t.step("raw template content part", async () => {
    const template = html`<div ${
      raw('><script>alert("hello")</script><div')
    }></div>`;

    const result = minify(await renderToString(template));

    assertEquals(
      result,
      '<div><script>alert("hello")</script><div></div>',
    );
  });

  await t.step("raw attribute value", async () => {
    const template = html`<div ${{
      dataFubar: raw('<script>alert("hello")</script>'),
    }}></div>`;

    const result = minify(await renderToString(template));

    assertEquals(
      result,
      '<div data-fubar="<script>alert("hello")</script>"></div>',
    );
  });
});

Deno.test("voks allow collections as root rendering element", async () => {
  const result = await renderToString([
    html`<p>hello</p>`,
    html` `,
    html`<p>world!</p>`,
  ]);

  assertEquals(result, "<p>hello</p> <p>world!</p>");
});
