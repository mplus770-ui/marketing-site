export default { eleventyComputed: {
  strings: (data) => data.i18n[data.loc.code],
  metaTitle: (data) => data.i18n[data.loc.code].accessibilityPage.metaTitle,
  metaDescription: (data) => data.i18n[data.loc.code].accessibilityPage.metaDescription,
} };
