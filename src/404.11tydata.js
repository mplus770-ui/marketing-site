export default { eleventyComputed: {
  loc: (data) => data.locales.find((locale) => locale.code === "en"),
  strings: (data) => data.i18n.en,
  metaTitle: () => "Page not found — ZOHAR",
  metaDescription: () => "The requested page could not be found.",
} };
