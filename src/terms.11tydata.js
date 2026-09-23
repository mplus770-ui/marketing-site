export default { eleventyComputed: {
  strings: (data) => data.i18n[data.loc.code],
  metaTitle: (data) => data.i18n[data.loc.code].termsPage.metaTitle,
  metaDescription: (data) => data.i18n[data.loc.code].termsPage.metaDescription,
} };
