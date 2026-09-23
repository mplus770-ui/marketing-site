import locales from "./locales.js";

// Legal and accessibility information is published only in languages whose
// full public copy has passed review. Held locales remain placeholders.
export default locales.filter((locale) => locale.ready);
