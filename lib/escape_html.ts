// benched the replace(//) method against replaceAll (it was faster for a simple string in about 60ns)
export const escapeHTML = (htmlText = ""): string => {
  return htmlText.toString()
    .replace(/&/g, "&amp;") // has to be first, because of ampersands in the replacements
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

// inverse function of escapeHTML, not touching any other HTML characters.
// Mainly provided for testing purposes.
export const unescapeHTML = (escapedHTMLText = ""): string => {
  return escapedHTMLText.toString()
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&") // has to be last, because of ampersands in the replacements
  ;
};
