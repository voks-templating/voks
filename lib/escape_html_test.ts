import { assertEquals } from "asserts";
import { escapeHTML } from "./escape_html.ts";

Deno.test("escapeHTML", () => {
  const htmlString = '<h1>Fubar</h1><script>alert("hello")</script>';
  const result = escapeHTML(htmlString);
  assertEquals(
    result,
    "&lt;h1&gt;Fubar&lt;/h1&gt;&lt;script&gt;alert(&quot;hello&quot;)&lt;/script&gt;",
  );
});
