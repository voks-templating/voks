import { escapeHTML } from "./escape_html.ts";

export type AttributeValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string | number | symbol, unknown>
  | unknown[];

export class TemplateAttribute {
  key: string;
  value: AttributeValue;

  constructor(key: string, value: AttributeValue) {
    this.key = kebabize(key);
    this.value = value;
  }

  get isBoolean() {
    return typeof this.value === "boolean";
  }

  get isObjectLiteral() {
    return this.value && Object.getPrototypeOf(this.value) === Object.prototype;
  }

  get isArray() {
    return Array.isArray(this.value);
  }

  toString() {
    if (this.isBoolean) {
      return this.value ? `${this.key} ` : "";
    } else if (this.isObjectLiteral || this.isArray) {
      return `${this.key}="${escapeHTML(JSON.stringify(this.value))}" `;
    }

    return this.value !== undefined && this.value !== null
      ? `${this.key}="${escapeHTML(this.value as string)}" `
      : "";
  }
}

const kebabize = (str: string) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};
