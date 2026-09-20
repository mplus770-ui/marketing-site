// Bind the active locale's strings into the page data cascade so every include
// resolves them without a global. A locale with no strings file fails the build.
export default {
  eleventyComputed: {
    strings: (data) => {
      const s = data.i18n?.[data.loc?.code];
      if (!s) throw new Error(`i18n: no strings for locale "${data.loc?.code}"`);
      return s;
    },
  },
};
