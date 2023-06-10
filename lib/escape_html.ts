export const escapeHTML = (htmlText = ""): string => {
  return htmlText.toString()
    .replaceAll("&", "&amp;") // has to be first, because of ampersands in the replacements
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
};
