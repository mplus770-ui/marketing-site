export default { eleventyComputed: {
  strings: (data) => data.i18n[data.loc.code],
  metaTitle: (data) => data.i18n[data.loc.code].privacyPage.metaTitle,
  metaDescription: (data) => data.i18n[data.loc.code].privacyPage.metaDescription,
} };
