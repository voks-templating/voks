import { escapeHTML } from "./escape_html.ts";

const htmlString = '<h1>Fubar</h1><script>alert("hello")</script>';

Deno.bench("html escaping", () => {
  escapeHTML(htmlString);
});
