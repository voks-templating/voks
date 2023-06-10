import { assertEquals } from "asserts";
import { TemplateAttribute } from "./template_attribute.ts";
import { unescapeHTML } from "./escape_html.ts";

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

Deno.test("template json attributes", async (t) => {
  await t.step("object literals", () => {
    const attribute = new TemplateAttribute("data-content", {
      msg: "hello",
      list: [1, 2, "a", "b", true],
    });

    assertEquals(attribute.isObjectLiteral, true);

    const attributeAsString = attribute.toString();
    assertEquals(
      attributeAsString,
      'data-content="{&quot;msg&quot;:&quot;hello&quot;,&quot;list&quot;:[1,2,&quot;a&quot;,&quot;b&quot;,true]}" ',
    );

    const attributeValue = attributeAsString.match(/data-content=\"(.*?)\"/);
    assertEquals(
      attributeValue && unescapeHTML(attributeValue[1]),
      '{"msg":"hello","list":[1,2,"a","b",true]}',
    );
  });

  await t.step("arrays", () => {
    const attribute = new TemplateAttribute("data-content", [
      1,
      2,
      "a",
      "b",
      true,
      {
        a: 1,
        b: 2,
      },
    ]);

    const attributeAsString = attribute.toString();

    assertEquals(attribute.isArray, true);

    assertEquals(
      attributeAsString,
      'data-content="[1,2,&quot;a&quot;,&quot;b&quot;,true,{&quot;a&quot;:1,&quot;b&quot;:2}]" ',
    );

    const attributeValue = attributeAsString.match(/data-content=\"(.*?)\"/);
    assertEquals(
      attributeValue && unescapeHTML(attributeValue[1]),
      '[1,2,"a","b",true,{"a":1,"b":2}]',
    );
  });
});
