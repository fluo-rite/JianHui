import sanitizeHtml from "sanitize-html";

export function sanitizeRichTextHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "span",
      "strong",
      "em",
      "u",
      "s",
      "blockquote",
      "pre",
      "code",
      "h1",
      "h2",
      "h3",
      "h4",
      "ol",
      "ul",
      "li",
    ],
    allowedAttributes: {
      "*": ["style"],
    },
    allowedStyles: {
      "*": {
        color: [/^.*$/],
        "background-color": [/^.*$/],
        "text-align": [/^(left|right|center|justify)$/],
        "font-family": [/^.*$/],
      },
    },
  });
}
