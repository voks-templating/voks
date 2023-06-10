import { assertEquals } from "asserts";
import { TemplateString } from "./template_string.ts";

Deno.test("escapeHTML", () => {
  const templateString = new TemplateString("fubar");
  assertEquals(templateString.content, "fubar");
  assertEquals(templateString.isTemplateString, true);
});
