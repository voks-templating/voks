import { assertEquals } from "asserts";
import { TemplateAttribute } from "./template_attribute.ts";

Deno.test("template attribute", async (t) => {
  await t.step("boolean attribute", () => {
    const attribute = new TemplateAttribute("data-fubar", true);
    assertEquals(attribute.isBoolean, true);
    assertEquals(attribute.toString(), "data-fubar ");
  });

  await t.step("string attribute", () => {
    const attribute = new TemplateAttribute("data-fubar", "hello, world!");
    assertEquals(attribute.isBoolean, false);
    assertEquals(attribute.toString(), 'data-fubar="hello, world!" ');
  });

  await t.step("number attribute", () => {
    const attribute = new TemplateAttribute("data-fubar", 7);
    assertEquals(attribute.isBoolean, false);
    assertEquals(attribute.toString(), 'data-fubar="7" ');
  });

  await t.step("null attribute", () => {
    const attribute = new TemplateAttribute("data-fubar", null);
    assertEquals(attribute.isBoolean, false);
    assertEquals(attribute.toString(), "");
  });

  await t.step("undefined attribute", () => {
    const attribute = new TemplateAttribute("data-fubar", undefined);
    assertEquals(attribute.isBoolean, false);
    assertEquals(attribute.toString(), "");
  });
});
