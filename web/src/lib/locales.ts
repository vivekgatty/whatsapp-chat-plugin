export type Locale = {
  /** BCP-47 tag, including script when it matters */
  code: string;
  /** English display name */
  name: string;
  /** Native autonym */
  nativeName: string;
  /** Writing direction */
  dir: "ltr" | "rtl";
  /** Script hint (Deva, Guru, Arab, Hans, Hant, Olck, Mtei…) */
  script?: string;
  /** Grouping to help UIs segment options */
  group: "IN_CORE_22" | "GLOBAL_MUST";
};

export const SUPPORTED_LOCALES: Locale[] = [
  // ---------- India’s 22 (Eighth-Schedule) ----------
  { code: "as",        name: "Assamese",       nativeName: "অসমীয়া",           dir: "ltr", script: "Beng", group: "IN_CORE_22" },
  { code: "bn",        name: "Bengali",        nativeName: "বাংলা",             dir: "ltr", script: "Beng", group: "IN_CORE_22" },
  { code: "brx",       name: "Bodo",           nativeName: "बड़ो",              dir: "ltr", script: "Deva", group: "IN_CORE_22" },
  { code: "doi",       name: "Dogri",          nativeName: "डोगरी",             dir: "ltr", script: "Deva", group: "IN_CORE_22" },
  { code: "gu",        name: "Gujarati",       nativeName: "ગુજરાતી",           dir: "ltr", script: "Gujr", group: "IN_CORE_22" },
  { code: "hi",        name: "Hindi",          nativeName: "हिन्दी",            dir: "ltr", script: "Deva", group: "IN_CORE_22" },
  { code: "kn",        name: "Kannada",        nativeName: "ಕನ್ನಡ",             dir: "ltr", script: "Knda", group: "IN_CORE_22" },
  { code: "ks-Arab",   name: "Kashmiri (Arabic script)", nativeName: "کٲشُر",   dir: "rtl", script: "Arab", group: "IN_CORE_22" },
  { code: "kok",       name: "Konkani",        nativeName: "कोंकणी",            dir: "ltr", script: "Deva", group: "IN_CORE_22" },
  { code: "mai",       name: "Maithili",       nativeName: "मैथिली",            dir: "ltr", script: "Deva", group: "IN_CORE_22" },
  { code: "ml",        name: "Malayalam",      nativeName: "മലയാളം",           dir: "ltr", script: "Mlym", group: "IN_CORE_22" },
  { code: "mni-Mtei",  name: "Manipuri (Meitei)", nativeName: "ꯃꯩꯇꯩ ꯂꯣꯟ",  dir: "ltr", script: "Mtei", group: "IN_CORE_22" },
  { code: "mr",        name: "Marathi",        nativeName: "मराठी",             dir: "ltr", script: "Deva", group: "IN_CORE_22" },
  { code: "ne",        name: "Nepali",         nativeName: "नेपाली",            dir: "ltr", script: "Deva", group: "IN_CORE_22" },
  { code: "or",        name: "Odia",           nativeName: "ଓଡ଼ିଆ",            dir: "ltr", script: "Orya", group: "IN_CORE_22" },
  { code: "pa-Guru",   name: "Punjabi (Gurmukhi)", nativeName: "ਪੰਜਾਬੀ",        dir: "ltr", script: "Guru", group: "IN_CORE_22" },
  { code: "sa",        name: "Sanskrit",       nativeName: "संस्कृतम्",         dir: "ltr", script: "Deva", group: "IN_CORE_22" },
  { code: "sat-Olck",  name: "Santali (Ol Chiki)", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ",     dir: "ltr", script: "Olck", group: "IN_CORE_22" },
  { code: "sd-Arab",   name: "Sindhi (Arabic script)", nativeName: "سنڌي",      dir: "rtl", script: "Arab", group: "IN_CORE_22" },
  { code: "ta",        name: "Tamil",          nativeName: "தமிழ்",             dir: "ltr", script: "Taml", group: "IN_CORE_22" },
  { code: "te",        name: "Telugu",         nativeName: "తెలుగు",            dir: "ltr", script: "Telu", group: "IN_CORE_22" },
  { code: "ur",        name: "Urdu",           nativeName: "اُردُو",            dir: "rtl", script: "Arab", group: "IN_CORE_22" },

  // ---------- Global must-haves ----------
  { code: "en",        name: "English",        nativeName: "English",           dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "es",        name: "Spanish",        nativeName: "Español",           dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "zh-Hans",   name: "Chinese (Simplified)", nativeName: "简体中文",     dir: "ltr", script: "Hans", group: "GLOBAL_MUST" },
  { code: "yue-Hant",  name: "Cantonese (Traditional)", nativeName: "粵語",      dir: "ltr", script: "Hant", group: "GLOBAL_MUST" },
  { code: "ar",        name: "Arabic",         nativeName: "العربية",           dir: "rtl", script: "Arab", group: "GLOBAL_MUST" },
  { code: "fr",        name: "French",         nativeName: "Français",          dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "pt-BR",     name: "Portuguese (Brazil)", nativeName: "Português (Brasil)", dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "pt-PT",     name: "Portuguese (Portugal)", nativeName: "Português (Portugal)", dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "ru",        name: "Russian",        nativeName: "Русский",           dir: "ltr", script: "Cyrl", group: "GLOBAL_MUST" },
  { code: "de",        name: "German",         nativeName: "Deutsch",           dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "ja",        name: "Japanese",       nativeName: "日本語",             dir: "ltr", script: "Jpan", group: "GLOBAL_MUST" },
  { code: "ko",        name: "Korean",         nativeName: "한국어",             dir: "ltr", script: "Kore", group: "GLOBAL_MUST" },
  { code: "tr",        name: "Turkish",        nativeName: "Türkçe",            dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "vi",        name: "Vietnamese",     nativeName: "Tiếng Việt",        dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "it",        name: "Italian",        nativeName: "Italiano",          dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "fa",        name: "Persian (Farsi)",nativeName: "فارسی",             dir: "rtl", script: "Arab", group: "GLOBAL_MUST" },
  { code: "id",        name: "Indonesian",     nativeName: "Bahasa Indonesia",  dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "ms",        name: "Malay",          nativeName: "Bahasa Melayu",     dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
  { code: "th",        name: "Thai",           nativeName: "ไทย",               dir: "ltr", script: "Thai", group: "GLOBAL_MUST" },
  { code: "fil",       name: "Filipino",       nativeName: "Filipino",          dir: "ltr", script: "Latn", group: "GLOBAL_MUST" },
];

// Handy subsets
export const IN_CORE_22 = SUPPORTED_LOCALES.filter(l => l.group === "IN_CORE_22");
export const GLOBAL_MUSTS = SUPPORTED_LOCALES.filter(l => l.group === "GLOBAL_MUST");

// Simple UI options helper (value/label pairs)
export const LOCALE_OPTIONS = SUPPORTED_LOCALES.map(l => ({
  value: l.code,
  label: `${l.name} — ${l.nativeName}`,
  dir: l.dir,
}));
