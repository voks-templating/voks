export class RawContent {
  #content: unknown;
  #isRaw: boolean;
  constructor(content: unknown) {
    this.#isRaw = true;
    this.#content = content;
  }

  get isRaw() {
    return this.#isRaw;
  }

  get content() {
    return this.#content;
  }
}
