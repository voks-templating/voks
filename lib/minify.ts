export function minify(text: string) {
  return text?.toString()
    .replace(/\t/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s>/g, ">")
    .replace(/>\s*</g, "><")
    .replace(/>\s*/g, ">");
}
