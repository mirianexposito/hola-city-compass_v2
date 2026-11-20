export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} · Hola Zaragoza` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} · Hola Zaragoza` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
