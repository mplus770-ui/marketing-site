# ZOHAR AI — Gate 2 Proposal
## Flagship Marketing Site Rebuild — Architecture, Design Direction & Implementation Plan

**Status:** Planning only. No implementation. No production change.
**Branch:** `redesign/zohar-flagship-marketing-site`
**Baseline:** `e2bad8bacea44944e56361a52040caf4c01978d3`
**Repository:** `mplus770-ui/marketing-site`
**Vercel project:** `marketing-site` (`prj_wIDoc2v07xLUtK57JEkjsRuhikBj`)

---

## 0. Audit of the current production site

The proposal below is shaped by what is actually in the baseline commit. Findings are
evidence-based, with file and line references.

### 0.1 Current inventory

| File | Size | Role |
|---|---|---|
| `public/index.html` | 64K | Hebrew homepage (root) |
| `public/{en,fr,es,pt,ru,zh,ar,de}/index.html` | 60–72K each | 8 translated homepages |
| `public/style.css` | 44K | Entire stylesheet |
| `public/script.js` | 8K | Entire client script |
| `public/logo.svg` | 4K | Logo |

Total: 12 files, 676K. No build step. No `vercel.json`, `robots.txt`, `sitemap.xml`,
`package.json`, or tests. Vercel project `framework: null`, zero-config static serving of `public/`.

### 0.2 Blocking findings (must be resolved by the rebuild)

**B1 — Third-party websites are presented as ZOHAR's own work.**
`public/index.html:725–838` and the same block in all 8 translations. Under the heading
"תיק עבודות" / Portfolio — *"דוגמא לאתרים שנבנו … כל אתר נבנה בקוד נקי על תשתית AWS"*
("examples of sites that were built … each site built in clean code on AWS") — the grid lists
**Tability, Typedream, Typedesk, Arc Studio Pro, Superlist, Cal.com, Supernotes, Height, Cron**,
plus `lemondesepharade.co.il` and `ecot.co.il`. These are independent products owned by other
companies. This is live, in nine languages, and is a legal and reputational exposure
(false attribution / misleading commercial claim). It is the single highest-priority item.

**B2 — Testimonials appear fabricated.**
`public/index.html:930–1056`. Named individuals ("דוד לוי", "ד״ר מיכל כהן", "יוסי אברהם") with
quantified outcome claims (+112% leads in 30 days, +38% conversion, −60% bounce, page 1 of Google
in 3 weeks) under the heading *"תוצאות אמיתיות מעסקים אמיתיים"* ("real results from real
businesses"). No attribution, consent, or substantiation exists in the repository.

**B3 — The primary hero CTA is a 404.**
`public/script.js` `go()` → `window.location.href = "/builder.html"`. `public/builder.html`
does not exist. The hero's main conversion button, the Enter key on the hero input, and the
"Self-Service" promise all lead nowhere.

**B4 — Google Tag Manager is syntactically broken on all nine pages.**
`public/index.html:14–17`. The snippet begins mid-expression:
`new Date().getTime(),event:'gtm.js'});var f=…` — the opening
`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':` line is missing. This is a hard
`SyntaxError`; `d`, `s`, `l`, `i` are undefined. GTM never loads. Present in all 9 files.

**B5 — Every analytics ID is a placeholder.**
GA4 `G-XXXXXXXXXX`, Meta Pixel `XXXXXXXXXXXXXXXXX`, TikTok `XXXXXXXXXXXXXXXXX`,
Hotjar `hjid:XXXXXXX` (an invalid numeric literal), GTM noscript `GTM-XXXXXXX`.
Four tracking vendors are loaded on every page and none of them can record anything.

**B6 — SEO foundation is absent.**
Zero `rel="canonical"`, zero `hreflang`, no `sitemap.xml`, no `robots.txt`, no JSON-LD,
no `og:image`, no `og:url`, no Twitter card. The Hebrew homepage has **no `<h1>` at all**
(hero uses `<h2 class="hero-subtitle">`). Nine near-identical pages with no canonical or
hreflang signals is an active duplicate-content and wrong-language-in-SERP risk.

**B7 — Content is duplicated nine times with no single source of truth.**
Every price, sentence and link exists in nine separate HTML files. The commit history shows the
cost directly: five consecutive commits (`929a830`, `da77b1b`, `51797b9`, `a5275c1`, `eaeb82b`)
were needed to push one €13→€15 / €27→€30 price change through all languages, and a sixth
(`e2bad8b`) to fix inverted Spanish question marks.

**B8 — Performance and privacy: 99 third-party screenshot requests.**
`https://api.microlink.io/?url=…&screenshot=true` is hotlinked 11× per page × 9 pages = 99 calls.
Each is a live, uncached, third-party render of someone else's site, in the critical path of the
portfolio section, leaking visitor IPs to a third party with no consent gate.

**B9 — Motion ignores `prefers-reduced-motion` where it matters most.**
`style.css:787` disables CSS animations only. The heaviest animation is the
`requestAnimationFrame` starfield in `script.js` (320 particles desktop / 180 mobile, full-screen
canvas, trail rendering, non-passive `mousemove` handler). It runs forever, is never paused on
`visibilitychange`, and is unaffected by the reduced-motion query. Constant battery drain.

**B10 — Typography is below accessible minimums.**
`style.css` contains `font-size:9px`, `9.5px`, `10px`, `10.5px`, and 11 separate declarations at
`13px`. Hero feature bullets are `13.5px`; trust line is `12.5px`. Body copy should not go below
16px. Fourteen ad-hoc breakpoints exist (`400/440/480/500/600/640/680/720/768/769/1024`).

**B11 — The logo is off-brand and technically fragile.**
`public/logo.svg` is a purple→pink (`#6c63ff` → `#ff6584`) angular "Z" plus a `<text>` element set
in `'Heebo'`. SVG `<text>` does not embed fonts, so the wordmark renders in a fallback face on any
machine without Heebo. The palette matches nothing else on the site (which is Vercel-blue
`#0070f3` + gold `#D4AF37`). The `rx="2"` on a `<polygon>` is invalid and does nothing.

**B12 — Localisation is only partially wired.**
`script.js` typewriter branches on `lang === "he"` and falls through to **English** for French,
Spanish, Portuguese, Russian, Chinese, Arabic and German. Seven locales display English strings
in the hero.

**B13 — The four real ZOHAR projects appear nowhere.**
`SADAFRONIA`, `YAYIN`, `Better World` and `ZOHAR AI` are not mentioned in any file in the
repository. The verified work is entirely absent while unverified work is prominent.

**B14 — Contact identity is inconsistent.**
Public contact email is `m.plus770@gmail.com` (a personal Gmail address) while the footer
"Privacy" link points to `mailto:support@zoharai.com`. There is no privacy page, no terms page,
and no legal entity named anywhere.

### 0.3 What is worth keeping

- The static, zero-runtime delivery model. It is the right call and must survive the rebuild.
- The nine-language commitment and the existing URL shape (`/`, `/en/`, `/fr/` …).
- The two-track commercial model (Done-For-You / Self-Service) as a *positioning* idea.
- The WhatsApp-first contact path — it is correct for the Israeli SMB market.
- The AWS / clean-code / full-ownership proposition. It is differentiated and true.

---

## 1. Recommended architecture

### 1.1 Static or build layer — recommendation

**Introduce a minimal, build-time-only layer. Keep the output 100% static.**

Nine hand-maintained copies of one page is the root cause of B4, B5, B6, B7, B10 and B12: a
correct fix applied in one file silently stays broken in eight. No amount of discipline fixes
this; only a single source of truth does.

**Recommended tool: Eleventy (11ty) v3.**

- Build-time only. Ships **zero** JavaScript runtime — the output is plain HTML/CSS/JS.
- Native first-class support for data cascade, pagination over locales, and permalinks, which is
  exactly the shape of this site.
- Natively supported by Vercel with no dashboard changes required (configured via `vercel.json`).
- One dependency tree, no React/Next/Vue, no hydration, no client router, no bundler required.

**Explicitly rejected:** Next.js, Astro with islands, Nuxt, Gatsby, any headless CMS, any
database, any API route, any serverless function. None are needed and all add weight, cost and
failure modes to what is a brochure site.

**Fallback if 11ty is declined:** a ~200-line dependency-free Node build script
(`build.mjs`) that reads locale JSON, substitutes into template partials, and writes `dist/`.
Slightly less ergonomic, zero npm supply chain. Either is acceptable; 11ty is recommended
because a future developer will recognise it.

### 1.2 Proposed folder structure

```
/
├── .eleventy.js                    # build config: input src/, output dist/
├── package.json                    # 11ty + 2 build-time plugins only
├── vercel.json                     # buildCommand, outputDirectory, headers, redirects
├── docs/
│   ├── gate-2-proposal.md          # this document
│   └── content-guide.md            # how to edit copy without touching templates
├── src/
│   ├── _data/
│   │   ├── site.json               # domain, brand, legal entity, contact, social
│   │   ├── analytics.json          # GTM/GA4/Meta/TikTok IDs — null-safe (see §13)
│   │   ├── locales.json            # the 9 locales: code, dir, hreflang, label, font set
│   │   ├── pricing.json            # SINGLE source of truth for every price
│   │   ├── projects.json           # the 4 verified projects only
│   │   └── i18n/
│   │       ├── he.json  en.json  fr.json  es.json  pt.json
│   │       └── ru.json  zh.json  ar.json  de.json
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk            # <html dir lang>, head, analytics, footer
│   │   │   └── page.njk
│   │   ├── partials/
│   │   │   ├── head-meta.njk       # title, description, canonical, hreflang, OG, Twitter
│   │   │   ├── schema.njk          # JSON-LD graph
│   │   │   ├── analytics.njk       # renders NOTHING when IDs are null
│   │   │   └── critical-css.njk
│   │   └── components/
│   │       ├── nav.njk  lang-switcher.njk  hero.njk  proof-strip.njk
│   │       ├── pillars.njk  process.njk  showcase.njk  pricing.njk
│   │       ├── roadmap.njk  trust.njk  faq.njk  cta-band.njk  footer.njk
│   │       └── brief-form.njk
│   ├── styles/
│   │   ├── tokens.css              # THE design tokens — colour, type, space, motion
│   │   ├── reset.css  base.css  typography.css  rtl.css
│   │   └── components/*.css        # one file per component above
│   ├── scripts/
│   │   ├── main.js                 # nav, faq, showcase, lang menu, brief  (~8KB)
│   │   └── hero-motion.js          # lazy, conditional, self-terminating   (~4KB)
│   ├── assets/
│   │   ├── fonts/                  # self-hosted woff2 subsets
│   │   ├── logo/                   # mark, lockups, favicon set
│   │   ├── work/                   # real screenshots of the 4 projects
│   │   └── og/                     # 1200×630 social cards, per locale
│   └── pages/
│       ├── home.njk                # paginated over locales → / and /{lang}/
│       ├── work.njk  work-case.njk
│       ├── services.njk  pricing.njk  roadmap.njk
│       ├── about.njk  contact.njk
│       └── legal/privacy.njk  legal/terms.njk
└── dist/                           # build output — this is what Vercel serves
```

### 1.3 Centralised design tokens

`src/styles/tokens.css` is the **only** file permitted to declare a raw colour, font size, space
value, radius, shadow or duration. Every component file consumes `var(--…)` exclusively. A CI
check (§16, Phase 0) greps component CSS for literal hex values and fails the build on a hit.
This is the structural fix for the current situation, where `#0070f3` is hard-coded 16 times in
CSS and inline in hundreds of `style=""` attributes across nine HTML files.

### 1.4 Shared components

Each component in `_includes/components/` receives a locale-scoped data object and renders for
both `dir=ltr` and `dir=rtl` from the same template — no mirrored duplicates. Inline `style=""`
attributes are forbidden in templates (the current hero alone contains ~30).

### 1.5 Centralised multilingual content

All copy lives in `src/_data/i18n/{locale}.json`, keyed by a dotted path
(`hero.headline`, `pillars.build.title`). Templates never contain a literal user-facing string.
`en.json` is the reference key set; the build fails on key drift (§11.5).

### 1.6 Static-output strategy

`npm run build` → 11ty → `dist/`. `dist/` contains only `.html`, `.css`, `.js`, `.woff2`,
`.avif`/`.webp`, `.svg`, `sitemap.xml`, `robots.txt`, `llms.txt`. No server, no runtime, no edge
function. Vercel serves it from CDN. Hosting cost and attack surface stay at today's level.

### 1.7 Why this stays lightweight

- Runtime dependencies shipped to the browser: **zero**.
- Client JS budget: **30KB gzipped total** (today: 8KB uncompressed, but four broken third-party
  tag loaders plus 99 third-party image requests).
- Build dependencies: 11ty plus two build-time plugins. No bundler, no transpiler, no PostCSS
  chain required (native CSS nesting and custom properties are sufficient for all target
  browsers).
- Editing a price becomes a one-line change in `pricing.json` instead of the five-commit
  sequence the history records.

### 1.8 Migration approach preserving all current public URLs

Current public URLs, all of which must continue to resolve **200**:

```
/                      /index.html
/en/   /en/index.html        /fr/   /fr/index.html
/es/   /es/index.html        /pt/   /pt/index.html
/ru/   /ru/index.html        /zh/   /zh/index.html
/ar/   /ar/index.html        /de/   /de/index.html
/style.css             /script.js            /logo.svg
```

Note that `public/index.html:148–158` hard-links the language menu to the **explicit
`/{lang}/index.html` form**, so those paths are in circulation and may be linked externally.

Rules:
1. 11ty `permalink` is set so every locale home emits at its existing path. `/` and `/{lang}/`
   are the canonical forms.
2. `/index.html` and `/{lang}/index.html` are preserved as **301 redirects** to the canonical
   directory form in `vercel.json`. Redirect, not 404 — the current pages are reachable at both.
3. `cleanUrls` is **not** enabled, to avoid Vercel rewriting these paths unpredictably.
4. `/style.css`, `/script.js`, `/logo.svg` → 301 to their hashed replacements, so any external
   hotlink or cached reference degrades gracefully rather than breaking.
5. New pages are added **under** the locale prefix (`/en/work/`), never at the root, so the
   existing namespace is untouched.
6. A pre-merge script (`scripts/verify-urls.mjs`) asserts a 200 or intended 301 for all 21 legacy
   URLs against the preview deployment. This is an approval gate, not a manual check.

**Important:** `vercel.json` will set `buildCommand` and `outputDirectory: "dist"` **in the
repository**, so no Vercel dashboard setting is changed. This keeps the deployment configuration
under code review and inside the Gate rules.

---

## 2. Sitemap and information architecture

### 2.1 Page map (× 9 locales)

| Path | Purpose | Priority |
|---|---|---|
| `/` · `/{lang}/` | Home — the full argument | 1.0 |
| `/{lang}/work/` | Showcase index — 4 verified projects | 0.9 |
| `/{lang}/work/sadafronia/` | Case study | 0.8 |
| `/{lang}/work/yayin/` | Case study | 0.8 |
| `/{lang}/work/better-world/` | Case study | 0.8 |
| `/{lang}/work/zohar-ai/` | Case study (own platform) | 0.8 |
| `/{lang}/services/` | BUILD · GROW · PROVE · MEMORY in depth | 0.9 |
| `/{lang}/pricing/` | Full commercial detail | 0.9 |
| `/{lang}/roadmap/` | **In development + long-term vision** | 0.6 |
| `/{lang}/about/` | Who ZOHAR is, entity, location | 0.6 |
| `/{lang}/contact/` | Brief form + WhatsApp + consultation | 0.8 |
| `/{lang}/privacy/` · `/{lang}/terms/` | Legal | 0.3 |

Phase 1 ships Home, Work index, Contact and Legal. Case studies and Services/Pricing/Roadmap
follow in Phase 2 (§16), so the honesty fix lands as early as possible.

### 2.2 Home-page section order

1. **Nav** — logo, 5 links, language switcher, one CTA.
2. **Hero** — headline, supporting line, primary + secondary CTA, intent→presence motion.
3. **Proof strip** — the 4 real project names/marks. Immediate, quiet credibility.
4. **The four pillars** — BUILD → GROW → PROVE → MEMORY.
5. **What we do now** — the services actually purchasable today.
6. **How it works** — 4 steps, 3–7 day timeline.
7. **Selected work** — the showcase carousel (4 verified projects).
8. **Pricing preview** — two tracks, headline figures, link to `/pricing/`.
9. **In development** — the honest Self-Service block. Early-access capture.
10. **Trust** — code ownership, AWS, no lock-in, nine languages, preview-before-pay.
11. **FAQ** — 8 question-shaped entries (also the AEO surface).
12. **Contact band** — brief form entry + WhatsApp + consultation.
13. **Footer** — nav, legal, entity, language list.

Rationale: proof is moved from position 6 (current) to position 3. The current site asks for the
conversion (hero prompt box) before showing a single piece of evidence.

### 2.3 Mandatory separation of tenses

This separation is a structural requirement of the IA, not a copy preference. Each block carries
a visually distinct status chip, and the three never share a section.

**A. What ZOHAR sells now** — chip: solid emerald, label "Available now"
- Done-For-You website build (brochure / marketing site)
- Done-For-You online store
- Done-For-You system or application (CRM, dashboard, portal)
- WordPress → owned-code migration
- Multilingual build (up to 9 languages)
- Hosting + care plan ("Peace of Mind")

**B. What is in development** — chip: outlined emerald, label "In development"
- Self-Service AI site builder (the `/builder` experience)
- In-product AI edit actions / quota model
- Client dashboard

**C. Long-term vision** — chip: muted, label "Where we're going"
- Persistent business memory across every asset a client owns
- Growth agent that proposes and measures changes autonomously
- Cross-project intelligence for agencies

No item may move left (vision → development → now) without a code change to `projects.json` /
`services.json`, making the claim reviewable in a diff.

---

## 3. Messaging hierarchy

All copy below is **controlling copy** — Hebrew and English are both authoritative and are the
source for the other seven locales.

### 3.1 Hero

| Element | English | Hebrew |
|---|---|---|
| Eyebrow | Websites that are actually yours | אתרים שבאמת שלכם |
| **Headline** | **From business intent to business presence.** | **מכוונה עסקית לנוכחות עסקית.** |
| Supporting | ZOHAR builds real websites in code you own — designed to be found, built to convert, and measured so you know they work. | זוהר בונה אתרים אמיתיים, בקוד שבבעלותכם — שנבנו כדי להימצא, כדי להמיר, ונמדדים כדי שתדעו שהם עובדים. |
| **Primary CTA** | **Start a project brief** | **התחילו בריף לפרויקט** |
| Secondary CTA | Talk on WhatsApp | דברו איתנו בוואטסאפ |
| Reassurance | Free first consultation · See it before you pay · You keep the code | ייעוץ ראשון ללא עלות · רואים לפני שמשלמים · הקוד נשאר שלכם |

The headline is the brand's whole argument in five words, and it is what the hero motion
literally animates (§9). Note that the primary CTA now points at a page that will exist.

### 3.2 Key service proposition

> **EN:** We build the site. You own the code. Nine languages, AWS-grade speed, and a system that
> remembers your business — so the next change builds on the last one instead of starting over.

> **HE:** אנחנו בונים את האתר. הקוד נשאר שלכם. תשע שפות, מהירות ברמת AWS, ומערכת שזוכרת את העסק
> שלכם — כך שכל שינוי נבנה על הקודם במקום להתחיל מהתחלה.

### 3.3 BUILD → GROW → PROVE → MEMORY

| | English | Hebrew |
|---|---|---|
| **BUILD** | **Build** — We turn what you say about your business into a real, coded presence. Not a template, not a page builder. Clean HTML, CSS and JavaScript you own outright. | **בונים** — אנחנו הופכים את מה שאתם אומרים על העסק לנוכחות אמיתית בקוד. לא תבנית, לא בונה עמודים. קוד נקי שבבעלותכם המלאה. |
| **GROW** | **Grow** — The site is built to be found and to convert: structured for search and for AI answers, fast on a phone, and shaped around the action you want. | **מצמיחים** — האתר נבנה כדי להימצא וכדי להמיר: מובנה לחיפוש ולמענה של מנועי AI, מהיר בנייד, ובנוי סביב הפעולה שאתם רוצים. |
| **PROVE** | **Prove** — Every meaningful action is measured. You see which message brings enquiries and which does not, in numbers, not opinions. | **מוכיחים** — כל פעולה משמעותית נמדדת. אתם רואים איזה מסר מביא פניות ואיזה לא — במספרים, לא בדעות. |
| **MEMORY** | **Memory** — The system keeps your brand, your content and your decisions. Every change starts from what you already are, not from a blank page. | **זוכרים** — המערכת שומרת את המותג, התוכן וההחלטות שלכם. כל שינוי מתחיל ממה שאתם כבר, לא מדף ריק. |

One-line summary:
**EN:** Build it properly. Grow what works. Prove it in numbers. Remember all of it.
**HE:** לבנות נכון. להצמיח את מה שעובד. להוכיח במספרים. ולזכור הכול.

### 3.4 Honest Self-Service wording

This replaces every current claim that the builder exists ("נוצר לבד תוך דקות", "בנה אתר עם AI —
תוך דקות", "ה-AI מייצר עבורך אתר … תוך דקות", and the Self-Service pricing tier).

> **EN — section label:** In development
> **Heading:** Self-Service is being built. It is not open yet.
> **Body:** Today, every ZOHAR site is built by our team. The self-service builder — describe your
> business, get a real coded site — is in active development. We are not taking payment for it and
> we are not promising a date. Join the early-access list and you will be among the first in.
> **CTA:** Join early access

> **HE — תווית:** בפיתוח
> **כותרת:** השירות העצמי בפיתוח. הוא עדיין לא פתוח.
> **גוף:** נכון להיום, כל אתר של זוהר נבנה על ידי הצוות שלנו. בונה האתרים בשירות עצמי — מתארים את
> העסק, מקבלים אתר אמיתי בקוד — נמצא בפיתוח פעיל. אנחנו לא גובים עליו תשלום ולא מבטיחים תאריך.
> הצטרפו לרשימת הגישה המוקדמת ותהיו מהראשונים שייכנסו.
> **CTA:** הצטרפו לגישה מוקדמת

The Self-Service **pricing tier is removed from `/pricing/` entirely** until the product exists.
Listing a price for an unavailable product is the same category of problem as B1 and B2.

### 3.5 Trust and proof messages

Each claim below is either already verifiable or is gated on the user confirming it (§17).

| Claim (EN) | Claim (HE) | Substantiation required |
|---|---|---|
| You own the code. Outright, from day one. | הקוד שלכם. במלואו, מהיום הראשון. | Contract clause — confirm |
| No page builder, no theme, no vendor lock-in. | בלי בונה עמודים, בלי תבנית, בלי נעילה לספק. | Self-evident from delivery |
| Built on AWS infrastructure. | בנוי על תשתית AWS. | Confirm current hosting |
| See the site before you pay. | רואים את האתר לפני שמשלמים. | Confirm this is the policy |
| Nine languages, right-to-left included. | תשע שפות, כולל ימין-לשמאל. | True of this site itself |
| Delivery in 3–7 days for a marketing site. | אספקה תוך 3–7 ימים לאתר תדמית. | Confirm as a commitment |
| Four projects shipped. Named, linked, real. | ארבעה פרויקטים באוויר. בשמם, עם קישור, אמיתיים. | SADAFRONIA, YAYIN, Better World, ZOHAR AI |

**Removed:** all numeric performance claims that cannot be evidenced — "+112% leads",
"+38% conversion", "−60% bounce", "page 1 of Google in 3 weeks", "100 Google speed score",
"99.9% uptime", and the five-star testimonial cards. If the user can supply a real, consented
client quote, it returns with a name, a business, and a link. Otherwise the proof is the work.

---

## 4. Green visual system

Green is the defining brand colour. The system is built to read as **botanical, warm and
editorial** — a cultivated, living green — and explicitly not as terminal-green, neon, crypto,
gaming or Matrix. Three rules enforce that:

1. **The luminous green never carries body text and is never a background for long text.** It
   appears as fills behind dark text, as 1–2px strokes, and as focus rings.
2. **Warm off-white, not pure white or grey-blue, is the text colour.** This single choice is what
   separates "botanical" from "terminal".
3. **No monospace outside code samples. No grid overlays, no circuitry, no scanlines, no glitch.**
   (The current site has literal floating code snippets in `.side-deco` — these are removed.)

### 4.1 Tokens

```css
:root {
  /* ── Dark backgrounds ── */
  --z-canvas:        #04150F;  /* page base — near-black, green-biased */
  --z-surface-1:     #07201A;  /* cards, nav on scroll */
  --z-surface-2:     #0A2B22;  /* raised / hovered surfaces */
  --z-surface-3:     #0F3A2E;  /* wells, code blocks, inactive tabs */
  --z-glass:         rgba(10,43,34,0.72);   /* + backdrop-filter: blur(12px) */

  /* ── Primary emerald (brand) ── */
  --z-emerald-700:   #0B5C43;
  --z-emerald-600:   #10795A;  /* PRIMARY EMERALD */
  --z-emerald-500:   #16A37B;

  /* ── Luminous action green (CTA / focus / accent) ── */
  --z-action-400:    #34E39B;  /* LUMINOUS ACTION GREEN */
  --z-action-300:    #6FF3BC;  /* hover / glow only */

  /* ── Warm-white typography ── */
  --z-text-hi:       #F4F1EA;  /* headings */
  --z-text:          #E6E2D8;  /* body */
  --z-text-mute:     #A9B5AC;  /* captions, meta */
  --z-text-faint:    #6E7F76;  /* disabled, fine print */
  --z-text-on-light: #04150F;  /* text on action-green fills */

  /* ── Secondary proof / data colour ── */
  --z-brass-400:     #E4B363;  /* metrics, data, "available now" emphasis */
  --z-brass-600:     #A97B36;  /* borders on brass surfaces */

  /* ── Borders ── */
  --z-border:        rgba(244,241,234,0.10);  /* default hairline */
  --z-border-strong: rgba(52,227,155,0.28);   /* focused / active */
  --z-border-brass:  rgba(228,179,99,0.24);   /* data surfaces */

  /* ── Gradients (only these two exist) ── */
  --z-grad-action: linear-gradient(135deg, #16A37B 0%, #34E39B 100%);
  --z-grad-dawn:   radial-gradient(ellipse 70% 50% at 50% -10%,
                     rgba(52,227,155,0.10) 0%, transparent 70%);

  /* ── Elevation ── */
  --z-shadow-1: 0 1px 2px rgba(0,0,0,0.4);
  --z-shadow-2: 0 8px 28px rgba(0,0,0,0.45);
  --z-shadow-glow: 0 0 0 1px rgba(52,227,155,0.22), 0 8px 32px rgba(52,227,155,0.12);
}
```

A light theme is **out of scope** for Phase 1–2 and is listed as decision D9.

### 4.2 Surfaces and gradient discipline

- Page is `--z-canvas`. Sections do not alternate background colour; separation comes from space
  and hairline rules, not from banding.
- Cards are `--z-surface-1` with `--z-border`; on hover they lift to `--z-surface-2` with
  `--z-border-strong`. No coloured card backgrounds.
- `--z-grad-dawn` may appear **once per page**, behind the hero only. It is the single atmospheric
  element, replacing the current nebula + earth-glow + starfield + shooting-star stack.
- `--z-grad-action` is reserved for the primary button. No gradient text anywhere — the current
  gold gradient-clipped wordmark is removed.

### 4.3 Contrast rules (enforced, not aspirational)

| Pair | Ratio | Rule |
|---|---|---|
| `--z-text` on `--z-canvas` | ≈ 15.1:1 | Body default |
| `--z-text-hi` on `--z-canvas` | ≈ 16.4:1 | Headings |
| `--z-text-mute` on `--z-canvas` | ≈ 8.9:1 | Captions — still passes AAA |
| `--z-action-400` on `--z-canvas` | ≈ 11.2:1 | Links, accents, icons |
| `--z-text-on-light` on `--z-action-400` | ≈ 11.2:1 | **Primary button: dark text on light green** |
| `--z-brass-400` on `--z-canvas` | ≈ 9.6:1 | Data and metrics only |
| `--z-text-faint` on `--z-canvas` | ≈ 4.6:1 | Fine print only, never below 14px |

Hard rules:
- Minimum **4.5:1** for all text; **7:1** targeted for body. Minimum **3:1** for borders,
  icons and focus indicators.
- **Never** place `--z-action-400` text on `--z-emerald-600` (≈ 2.4:1). This is the most likely
  mistake and is checked in CI.
- Focus ring is always `2px solid var(--z-action-400)` with `outline-offset: 2px`, never removed.
- All state is signalled by **two** channels (colour + icon/weight/underline), never colour alone.
- Minimum body size **16px**; minimum any text **14px**.

### 4.4 Colours to remove from the current site

| Remove | Where it lives today | Why |
|---|---|---|
| `#0070f3`, `#0058d0` | 16 CSS uses + hundreds of inline styles | Vercel blue — the current primary. Replaced by emerald. |
| `#00c8ff`, `#7ab8ff` | `--cyan`, hero label | Cyan is the fastest route to "generic AI/SaaS". |
| `#D4AF37`, `#F2D06B`, `#F5D060`, `#FFF8DC`, `#A07C20`, `#7A5800` | gold tokens, DFY prices, footer wordmark | Gold-gradient "luxury" is the template cliché the brief rejects. Replaced by flat brass, used only for data. |
| `rgba(80,0,160,…)`, `#e040fb`, `#a060d0`, `#c060a0` | nebula, portfolio placeholders | Purple/magenta — no role in a green system. |
| `#6c63ff`, `#ff6584`, `#a78bfa` | `logo.svg` gradients | Off-brand logo palette. |
| `#f04060`, `#e08040`, `#5060e0`, `#f87171` | portfolio placeholder gradients | Disappear with the third-party portfolio (B1). |
| `#4ade80` | `--green` | Tailwind's default green. Too recognisable as a framework default; replaced by `#34E39B`. |
| `#25d366` | WhatsApp buttons | Retained **only** inside the WhatsApp glyph. Never a surface or brand colour. |
| Emoji as UI (🤖 👑 🚀 ⚡ 🏆 📱 ✨ 📈 🥇 🛒) | badges, CTAs, stats, testimonials | Replaced by a single drawn icon set. Emoji render differently per OS and read as template. |

---

## 5. Typography

### 5.1 Typeface recommendation

**Hebrew display: Frank Ruhl Libre** (OFL, variable 300–900).
A Hebrew serif with genuine typographic lineage — it is the face of Hebrew book setting. For a
brand named זוהר, after a classical text, this is a meaningful rather than decorative choice, and
it is the single strongest signal that this is not a SaaS template.

**Hebrew/Latin body: Assistant** (OFL, variable 200–800).
Clean, warm humanist sans with excellent Hebrew and matching Latin. Replaces Heebo, which is
correct but ubiquitous in Israeli web work.

**Latin display: Fraunces** (OFL, variable; `opsz`, `wght`, `SOFT`, `WONK` axes).
A warm, high-personality serif that pairs conceptually with Frank Ruhl Libre — both are
"editorial with character" rather than "tech". The optical-size axis keeps it elegant at 64px and
readable at 24px.

**Per-script body faces** (loaded only on the locale that needs them):

| Locale | Display | Body |
|---|---|---|
| `he` | Frank Ruhl Libre | Assistant |
| `en` `fr` `es` `pt` `de` | Fraunces | Assistant |
| `ru` | Fraunces (Cyrillic subset) | **Inter** (Assistant lacks Cyrillic) |
| `ar` | Noto Naskh Arabic | IBM Plex Sans Arabic |
| `zh` | Noto Serif SC | Noto Sans SC |

Because each locale is its own HTML document, a visitor downloads only their own script's fonts.
This is a direct performance win over the current single Google Fonts request that loads Heebo
(7 weights) + Montserrat (3 weights) for every visitor in every language.

### 5.2 Display hierarchy

| Token | Desktop | Mobile | Line-height (LTR) | Line-height (HE/AR) | Tracking |
|---|---|---|---|---|---|
| `--fs-d1` hero | `clamp(2.75rem, 5.5vw, 4.5rem)` | 2.25rem min | 1.05 | **1.18** | −0.02em / **0** |
| `--fs-d2` section | `clamp(1.875rem, 3.5vw, 2.75rem)` | 1.75rem | 1.12 | 1.25 | −0.015em / 0 |
| `--fs-d3` card | `clamp(1.25rem, 2vw, 1.5rem)` | 1.25rem | 1.25 | 1.35 | −0.01em / 0 |

**Hebrew and Arabic are never negatively tracked and never set in uppercase.** Hebrew has no
case; Arabic is cursive and breaks when letter-spaced. The current site letter-spaces Hebrew
headings at `-0.02em`, which tightens counters and hurts legibility.

### 5.3 Body hierarchy

| Token | Size | Line-height (LTR) | Line-height (HE/AR) | Use |
|---|---|---|---|---|
| `--fs-lead` | 1.25rem (20px) | 1.6 | 1.75 | Hero supporting, section intros |
| `--fs-body` | 1.0625rem (17px) | 1.65 | 1.8 | Default body |
| `--fs-sm` | 0.9375rem (15px) | 1.6 | 1.7 | Card body, captions |
| `--fs-xs` | 0.875rem (14px) | 1.5 | 1.6 | Fine print — **hard floor** |
| `--fs-label` | 0.8125rem (13px) | 1.4 | 1.5 | Uppercase labels, **Latin only**, +0.09em |

Measure: **62–72 characters** for Latin, **55–65** for Hebrew (denser glyphs), enforced via
`max-inline-size: 38rem` on prose blocks.

### 5.4 Mobile sizing and rhythm

- Hero D1 floor: **36px**. Body floor: **16px**. Nothing renders below **14px** anywhere.
  (Current site: 9px exists in the stylesheet, and hero bullets are 13.5px.)
- Vertical rhythm on an 8px base: section padding `clamp(4rem, 9vw, 7.5rem)` block.
- Touch targets ≥ **44×44px** with ≥ 8px separation.
- `text-wrap: balance` on headings, `text-wrap: pretty` on lead paragraphs.

### 5.5 Font-loading strategy

1. **Self-host.** Drop `fonts.googleapis.com` entirely — removes two `preconnect`s, one
   render-blocking stylesheet, a third-party dependency and a GDPR exposure.
2. Variable WOFF2, subset per script with `unicode-range`. Target ≤ 110KB total per locale.
3. `font-display: swap`.
4. `<link rel="preload" as="font" type="font/woff2" crossorigin>` for **exactly two** files: the
   locale's display face and its body regular. Nothing else is preloaded.
5. Metric-matched fallback to eliminate CLS:

```css
@font-face {
  font-family: "Assistant Fallback";
  src: local("Arial");
  size-adjust: 103%; ascent-override: 92%;
  descent-override: 24%; line-gap-override: 0%;
}
```

6. Cache: `Cache-Control: public, max-age=31536000, immutable` on hashed font filenames.

### 5.6 Fallback stacks

```css
--font-body-latin:  "Assistant", "Assistant Fallback", "Segoe UI", Roboto,
                    "Helvetica Neue", Arial, sans-serif;
--font-body-he:     "Assistant", "Assistant Fallback", "Noto Sans Hebrew",
                    "Segoe UI", Arial, sans-serif;
--font-body-ar:     "IBM Plex Sans Arabic", "Noto Sans Arabic", "Segoe UI",
                    Tahoma, Arial, sans-serif;
--font-body-zh:     "Noto Sans SC", "PingFang SC", "Microsoft YaHei",
                    "Hiragino Sans GB", sans-serif;
--font-body-ru:     "Inter", "Inter Fallback", "Segoe UI", Roboto, Arial, sans-serif;
--font-display-he:  "Frank Ruhl Libre", "Noto Serif Hebrew", Georgia, serif;
--font-display-lat: "Fraunces", "Iowan Old Style", Georgia, "Times New Roman", serif;
--font-mono:        ui-monospace, "SF Mono", "Cascadia Mono", Menlo, monospace;
```

---

## 6. Logo directions

Three focused concepts. All three avoid a robot, a brain, circuitry, sparkles and a decorative
"Z". All three are drawn on a 24-unit grid, work in a single colour, and survive at 16px.

The current mark (`public/logo.svg`) is retired: it is a purple→pink angular Z with an SVG
`<text>` wordmark that renders in a fallback face on most machines.

---

### Concept A — "The Aperture"

**Visual idea.** Four arcs of equal stroke weight describe a circle that does not close. The gap
sits at the upper-inline-end. From that gap, a narrow wedge of light opens outward and fades. At
small sizes the arcs read as one luminous ring; at large sizes the four segments and the gap are
clearly deliberate.

**Meaning.** Zohar is radiance. An aperture is the opening that lets light through and the
instrument that controls it. The gap is where the client's intent enters; the wedge is the
presence that goes out. The four arcs are BUILD, GROW, PROVE, MEMORY — a closed system with one
deliberate opening.

**Relationship to the five brand ideas.** *Light:* the wedge, literally. *Growth:* the arcs are
drawn as an expanding spiral, each slightly larger than the last. *Intelligence:* the precision
of the construction, not an icon of a brain. *Connection:* the arcs share a single implied
centre. *Memory:* the ring persists; only the wedge changes state.

**Symbol behaviour.** Stroke weight is fixed at 2/24 units and does not scale optically below
32px, where the wedge is dropped. The gap widens from 14° at favicon size to 22° at hero size.
Single-colour version: `--z-action-400` on dark; `--z-emerald-600` on light.

**Wordmark behaviour.** `ZOHAR` set in Fraunces / Frank Ruhl Libre caps at +0.12em tracking,
optically centred on the ring. `זוהר` uses the identical cap-height and stroke weight so the two
lockups are interchangeable. The horizontal lockup places the mark at the inline-start in LTR and
inline-end in RTL. Recommend dropping "AI" from the mark itself (decision D5).

**Favicon behaviour.** Two arcs plus the wedge, cropped square, no wordmark. Legible at 16px.

**Motion-logo potential.** The four arcs sweep into position sequentially (4 × 90ms), then the
wedge ignites and settles (180ms). Total 540ms. Reversible for a loading state.

**Strengths.** Highly ownable silhouette; excellent at small sizes; reads as an instrument rather
than a decoration; the single-opening idea is genuinely explainable to a client.
**Risks.** Rings and arcs are common in AI branding. The asymmetric gap and the wedge are what
prevent genericness — if either is softened in execution, the mark collapses into a generic
loading spinner. Requires disciplined drawing.

---

### Concept B — "Seed of Light" (הנבטה) — **RECOMMENDED**

**Visual idea.** A single vertical stroke rises from a flat base and, at roughly two-thirds
height, opens into two asymmetric forms that lean apart — the left shorter and rounder, the right
taller and tapering. It reads simultaneously as a sprout, a flame, and the upper stroke of a
Hebrew letter. Entirely geometric: arcs and straight segments, no botanical illustration, no
leaf veins.

**Meaning.** Growth from a single intent. The stem is the business's continuous identity; the two
opening forms are what it becomes in the world. Light is not depicted as rays but as the reason
the growth is possible — the forms are lit from within via a single-stop tonal shift from
`--z-emerald-600` at the base to `--z-action-400` at the tips.

**Relationship to the five brand ideas.** *Light:* the tonal rise from deep to luminous.
*Growth:* the core gesture. *Intelligence:* the asymmetry is calculated, not organic — the two
forms are in a 3:5 ratio. *Connection:* one unbroken stem joins both forms; they never detach.
*Memory:* the stem is the part that persists through every state change.

**Symbol behaviour.** The two upper forms can separate and rejoin along the stem axis for motion
and for loading states. Below 24px the tonal shift flattens to a single colour and the tip taper
is squared off. Monochrome version uses a 1/24-unit gap between stem and forms to keep the joint
readable.

**Wordmark behaviour.** `zohar` in lowercase Fraunces, warm and unhurried, with the stem of the
mark optically aligned to the `h` ascender so the mark reads as part of the word rather than
beside it. `זוהר` in Frank Ruhl Libre, with the mark's stem aligned to the ז descender in RTL.
Stacked lockup places the mark above the wordmark, centred.

**Favicon behaviour.** The sprout alone, filled rather than stroked, on `--z-canvas`. The filled
form holds at 16px where a stroked version would break up.

**Motion-logo potential.** The stem draws upward from the base (400ms, `cubic-bezier(.22,1,.36,1)`),
then the two forms open outward and settle (300ms), then a single soft luminance pass travels
stem→tips (200ms). Total 900ms, once per session. This is the same gesture as the hero motion
(§9) at a different scale — the logo and the hero tell one story.

**Strengths.** The strongest conceptual fit with a green brand and with GROW; it earns the colour
rather than merely being coloured. Animates into the brand's exact narrative. Distinct from
every mark in the competitive set. Works filled or stroked.
**Risks.** Sprout marks are common in eco, wellness and sustainability branding. The defences
are: strict geometry (no organic curves), the asymmetric 3:5 ratio, the internal luminance rather
than flat fill, and never pairing the mark with a circle or a leaf. If execution drifts toward
botanical illustration, it becomes an eco-brand and loses the intelligence dimension.

---

### Concept C — "Zohar Glyph" (bilingual monogram)

**Visual idea.** The Hebrew letter **ז** reduced to its two essential strokes: a horizontal bar
above, a descending stroke below. The bar is drawn as a light source — squared at the
inline-start, tapering to a luminous point at the inline-end. Mirrored, the same construction
reads as a Latin **Z** without being a literal Z: the descending stroke becomes the diagonal.

**Meaning.** זוהר as a name with a textual lineage. The bar is the light source; the stroke is its
reach into the world. A single unbroken path from source to destination.

**Relationship to the five brand ideas.** *Light:* the bar is the source, drawn as one.
*Growth:* the taper implies direction and extension. *Intelligence:* letterform reduction is an
intellectual act, legible as such. *Connection:* one continuous path. *Memory:* it is a letter —
the oldest memory technology there is.

**Symbol behaviour.** Flips horizontally between RTL and LTR without changing identity — the same
mark serves both markets, which no competitor's mark does. Stroke weight 2.5/24 units.

**Wordmark behaviour.** `זוהר` and `ZOHAR` lockups share cap-height, stroke weight and optical
weight, so the Hebrew and English sites are visually identical in the nav.

**Favicon behaviour.** Bar plus stroke, square-cropped, the taper squared off below 24px.

**Motion-logo potential.** The bar illuminates from the inline-start to the inline-end (direction
follows `dir`), then the stroke draws downward. 500ms.

**Strengths.** Uniquely bilingual — it solves the HE/EN lockup problem in a single mark, which is
a real and recurring practical problem for this business. Culturally rooted without being
decorative. Extremely simple to reproduce.
**Risks.** This is the concept closest to the "meaningless Z" the brief rejects, and the risk is
real. It only works if the ז reading is unmistakably primary and the light-bar taper is
pronounced. If drawn timidly it becomes exactly the generic Z we are avoiding. It is also the
least distinctive of the three at thumbnail size.

---

**Recommendation:** **Concept B — Seed of Light** as the primary direction, with
**Concept A — The Aperture** developed as the alternate at the same fidelity so the choice is
made against two real options. Concept C is documented but not recommended for development
unless the bilingual-lockup problem proves to be the dominant constraint.

---

## 7. Desktop wireframe

Grid: 12 columns, 1200px max content width, 1440px max for full-bleed sections, 32px gutters,
80px page margin at ≥1440px. All directional values use logical properties so the layout mirrors
for RTL without a second stylesheet.

**Screen 0 — Nav (sticky, 72px, `--z-glass` + blur after 40px scroll)**
Inline-start: logo lockup (mark + wordmark, 32px tall). Centre: Work · Services · Pricing ·
Roadmap · About. Inline-end: language switcher (globe + 2-letter code) then one primary button,
"Start a brief". Hairline `--z-border` on the block-end edge, appearing only on scroll.

**Screen 1 — Hero (100vh−72px, min 640px, max 860px)**
Asymmetric 7/5 split. **Inline-start column (7):** eyebrow label; D1 headline on three lines with
`text-wrap: balance`; lead supporting paragraph at 38rem measure; a CTA row — primary solid
`--z-grad-action` with dark text, secondary ghost with `--z-border-strong`; below, a single
reassurance line at `--fs-xs`. **Inline-end column (5):** the intent→presence motion canvas
(§9), a 4:5 portrait frame on `--z-surface-1` with a 1px `--z-border`. `--z-grad-dawn` sits
behind the whole section. Scroll cue at the block-end: a 1px 40px rule that draws downward on
loop. *Conversion role: state the promise, give the action, show the transformation.*

**Screen 2 — Proof strip (160px)**
Full-bleed band on `--z-surface-1`. A single centred line: "Built by ZOHAR" at `--fs-label`, then
four project wordmarks in `--z-text-mute`, evenly spaced, each a link to its case study, each
lifting to `--z-text-hi` on hover. No logos-we-don't-own, no vanity metrics.
*Conversion role: earn the right to keep talking, in under two seconds.*

**Screen 3 — The four pillars (auto height, ~720px)**
D2 heading + one-line intro, centred, 48rem. Below, a 4-column row of pillars. Each pillar: a
numbered label (01–04) in `--z-brass-400`, the pillar name in D3, a 3-line description, and a
thin `--z-emerald-600` rule at the block-start that animates to `--z-action-400` width on scroll
entry. A continuous hairline connects all four at the rule line — reading as one system, not four
features. *Conversion role: convert a service list into a method.*

**Screen 4 — What we do now (~640px)**
Two-column 5/7. Inline-start: sticky D2 heading "What we build today" plus the "Available now"
chip. Inline-end: a stacked list of six service rows, each a full-width row with title, one-line
description, an indicative price in `--z-brass-400`, and a disclosure chevron. Rows expand in
place. No cards — a list reads as an honest inventory; cards read as a menu.
*Conversion role: make the purchasable thing unambiguous.*

**Screen 5 — How it works (~520px)**
Four steps on a horizontal rail: Brief → Direction → Build → Launch. Each step is a 3/12 column
with a step number, title, one line, and a duration chip ("Day 1", "Days 2–3", "Days 3–6",
"Day 7"). A single hairline runs through all four; a luminous dot travels it on scroll.
*Conversion role: remove process anxiety, make 3–7 days concrete.*

**Screen 6 — Selected work (~800px, full-bleed)**
D2 heading inline-start, carousel controls inline-end (prev/next + a 4-segment progress rail).
Carousel shows 2.2 cards at 1440px, 1.6 at 1200px. Each card: a 16:10 project image with a 1px
border, project name in D3, one-line sector label, a 2-line outcome sentence, and a "View case
study →" link. Full behaviour in §10. *Conversion role: the actual proof.*

**Screen 7 — Pricing preview (~560px)**
Two panels side by side, equal weight, no "most popular" badge. **Panel A — Done For You**
(available now): three price points, four bullets each, primary CTA. **Panel B — Self-Service**
(in development): the same visual frame but at 70% opacity with a diagonal `--z-border` hatch, an
"In development" chip, the honest copy from §3.4, and an "early access" CTA. The visual
asymmetry is the message. *Conversion role: price transparency without overselling.*

**Screen 8 — In development / Roadmap teaser (~400px)**
Three columns: Available now · In development · Where we're going. Each a short list with its
status chip. Link to `/roadmap/`. *Conversion role: turn honesty into a credibility asset.*

**Screen 9 — Trust (~440px)**
Centred D2, then a 3×2 grid of short trust statements from §3.5, each with a drawn icon at 24px
in `--z-action-400`. No badges, no fake certifications. *Conversion role: dismantle the final
objections — ownership, lock-in, speed.*

**Screen 10 — FAQ (~720px)**
Two columns 5/7. Inline-start: sticky D2 plus a "Still unsure? Talk to us" WhatsApp link.
Inline-end: 8 accordion items, question-shaped, first one open by default.
*Conversion role: AEO surface plus objection handling.*

**Screen 11 — Contact band (~520px, full-bleed `--z-surface-1`)**
Centred. D2: "Tell us what your business does." Lead line. Then the brief entry: a single large
text field with the placeholder "We're a family winery in the Galilee…" and a primary
"Start the brief" button — this opens the multi-step brief, it does not 404. Beneath it, two
secondary paths: WhatsApp and "Book a 20-minute consultation". `--z-grad-dawn` inverted at the
block-end. *Conversion role: three routes at three commitment levels.*

**Screen 12 — Footer (~360px)**
Four columns: brand lockup + one-line descriptor + legal entity; Sitemap; Legal (Privacy, Terms,
Accessibility statement); Languages (all nine, as real links). Block-end bar: copyright, a real
business email, and the WhatsApp number.

**Persistent:** a WhatsApp floating action button at the inline-end block-end, 56px, appearing
after Screen 1 and hiding over Screen 11 to avoid competing with the primary CTA. (The current
site shows it permanently, overlapping the contact CTA.)

**The conversion journey:** promise → proof → method → offer → process → evidence → price →
honesty → trust → objections → three-tier action. Evidence precedes the ask at every step.

---

## 8. Mobile wireframe

Designed independently, not stacked. Base width 390px; supported from 320px.

**Navigation.** 56px sticky bar. Inline-start: the mark only (no wordmark — saves 90px). Inline-end:
a 44×44 language button showing the 2-letter code, and a 44×44 menu button. Tapping menu opens a
**full-screen sheet** (not a dropdown): large 24px links at 64px row height, the language list as
a second section, and a full-width WhatsApp button pinned at the sheet's block-end. Closes on
link tap, backdrop tap, Escape, and swipe-down. Focus is trapped while open; `body` scroll locks.
The current hamburger opens an in-flow list that pushes content and has no focus trap.

**Hero proportions.** Deliberately **not** full-height — 78vh, so the block-start of Screen 2 is
visible and the page reads as having depth. Order: eyebrow (13px) → D1 at 36–40px on 3 lines →
lead at 17px, max 4 lines → **primary CTA full-width, 52px tall** → secondary as a text link
beneath, not a second button → reassurance line at 14px → the motion frame at 16:10, reduced
height. The motion frame moves **below** the CTA on mobile: the action must be reachable without
scrolling on a 667px-tall screen.

**Video / motion treatment.** No video on mobile by default. The hero motion is the lightweight
SVG/CSS sequence only, capped at 2.0s, autoplay once, then static. If the user approves a video
(D6), it is desktop-only and gated on `navigator.connection.effectiveType === '4g'` and
`!saveData`. A static AVIF poster is the mobile equivalent.

**Typography.** D1 36px/1.18 (Hebrew) or 38px/1.08 (Latin). D2 26px. Body 17px/1.8 for Hebrew and
Arabic, 17px/1.65 for Latin. Nothing below 14px. Measure capped at 34rem so lines do not run
edge to edge. Side gutter fixed at **20px**, never less.

**Project showcase.** Not a grid and not the desktop carousel. A **native scroll-snap horizontal
rail**: `scroll-snap-type: x mandatory`, one card per viewport at 86% width so the next card
peeks by 14% — the affordance that tells a thumb there is more. `overscroll-behavior-inline:
contain` so a swipe never navigates the browser back. A 4-dot indicator below, which is a status
display and also a tappable control at 44×44 each. Cards are 16:10 image + name + one line; the
full outcome text moves to the case-study page.

**CTA placement.** Three tiers: (1) the in-hero full-width primary; (2) a section-level CTA after
the showcase and after pricing; (3) a **sticky block-end bar** that appears after 60% scroll —
55px tall, two buttons split 60/40, "Start a brief" and a WhatsApp icon button. It hides when the
contact band enters the viewport. This replaces the current always-on floating WhatsApp bubble,
which overlaps content and offers only one path.

**Touch interaction.** All targets ≥44×44 with ≥8px gaps. `touch-action: manipulation` to remove
the 300ms delay. No hover-only affordance anywhere. Accordions and carousels respond to tap and
swipe; nothing requires a long-press. Active states use a 120ms scale-to-0.98, not a colour
flash. `-webkit-tap-highlight-color: transparent` with a real `:active` style replacing it.

**Safe areas.** `viewport-fit=cover` plus `padding-inline: max(20px, env(safe-area-inset-left))`
and the same for the inline-end. The sticky block-end CTA bar adds
`padding-block-end: env(safe-area-inset-bottom)` so it clears the iPhone home indicator. The
sticky nav adds `env(safe-area-inset-top)`.

**Small-iPhone behaviour (SE 2/3, 375×667; iPhone 12 mini, 360×780; and 320px floor).**
At ≤375px: D1 drops to 32px; the hero motion frame is hidden entirely (not merely shrunk) and
replaced by a static 16:10 still; the eyebrow is removed; the reassurance line wraps to two lines
at 14px; the four-pillar row becomes a single column. At 320px the nav shows the mark only and
the language button collapses to a globe glyph. Target: the primary CTA is visible without
scrolling on a 667px viewport.

**Landscape-phone behaviour (e.g. 844×390).** The hero switches to a two-column 6/6 split with
`max-block-size: 100vh` and the motion frame at 16:9 inline-end; D1 drops to 30px; the sticky nav
shrinks to 48px; `env(safe-area-inset-left/right)` becomes significant on notched devices in
landscape and is respected on both inline edges. The full-screen menu sheet switches to a
two-column link list so it does not require scrolling at 390px block-size.

---

## 9. Hero and motion concept

### 9.1 What it must demonstrate

One idea, literally: **a sentence about a business becomes a working business presence.** This is
the headline animated. It is not decoration, and it replaces the current starfield/nebula/
shooting-star stack, which says "space" and has no relationship to the product.

### 9.2 Desktop visual sequence (2.8s total, plays once)

| t | Stage | What happens |
|---|---|---|
| 0.0–0.7s | **Intent** | A line of text types into a bare field: "A family winery in the Galilee." Cursor blinks once. |
| 0.7–1.2s | **Dissolve** | The words break into short horizontal rules that fall into place as a grey wireframe: header bar, hero block, three cards, footer. |
| 1.2–2.0s | **Build** | The wireframe fills: the header gains a mark, the hero block gains a real headline and a green button, the cards gain images. Colour arrives with a luminance pass travelling block-start → block-end. |
| 2.0–2.5s | **Prove** | A small `--z-brass-400` data chip slides in at the inline-end: "Enquiries ▲". A second chip: "0.8s load". |
| 2.5–2.8s | **Memory** | A thin `--z-action-400` outline traces the whole frame once and settles as a persistent 1px border. The frame holds this final state indefinitely. |

Each stage maps to one pillar: BUILD (dissolve+build), GROW (colour/luminance), PROVE (chips),
MEMORY (the persisting outline).

### 9.3 Mobile visual sequence (2.0s, plays once)

Compressed to three stages: Intent (0–0.6s, shorter string) → Build (0.6–1.5s, wireframe straight
to filled, no intermediate) → Prove (1.5–2.0s, one chip only). The Memory trace is omitted; the
border is simply present. At ≤375px the sequence is skipped entirely and the final frame renders
statically.

### 9.4 Recommendation: video, code, or hybrid

**Recommended: code-based motion as the default; video as an optional, deferred desktop
enhancement.** Reasons:

- The sequence is geometric — rules, rectangles, text, a border trace. Inline SVG plus CSS
  `transform`/`opacity` renders it at ~6KB gzipped against 800KB–2MB for equivalent video.
- Code-based motion is crisp at every DPR, recolours from tokens, and localises: the typed
  intent string comes from `i18n/{locale}.json`, so the Hebrew hero types Hebrew. A video would
  need nine encodes.
- It is fully controllable for reduced-motion, which a video is not.

If video is approved (D6), it is: desktop ≥1024px only, ≤6s, ≤1.2MB, AV1 with H.264 fallback,
`muted playsinline preload="none"`, loaded after `load` via IntersectionObserver, with the static
final frame as its `poster`. It never blocks LCP and never appears on mobile.

### 9.5 Duration, poster and fallback

Total 2.8s desktop / 2.0s mobile, **once per page view**, never looping. Because the sequence
ends on the final composed frame, that frame *is* the poster — it is rendered in the initial HTML
as inline SVG and the animation plays over it. Consequence: with JavaScript disabled, CSS
unloaded, or the animation blocked, the visitor still sees the complete, correct hero visual.
There is no empty state and no layout shift. LCP is the H1 text, not the motion frame.

### 9.6 Reduced-motion behaviour

`@media (prefers-reduced-motion: reduce)`: the animation never starts; the final frame renders
immediately; the typed string appears complete and static. This is enforced in **JavaScript as
well as CSS** — `matchMedia('(prefers-reduced-motion: reduce)').matches` short-circuits before a
single `requestAnimationFrame` is scheduled. This is the specific failure in the current build
(B9), where the CSS rule exists but the canvas loop ignores it.

Additionally: the animation pauses on `document.visibilitychange` and does not start until the
frame is ≥50% in view.

### 9.7 Performance limits

- Animated properties: `transform` and `opacity` only. No `width`, `height`, `top`, `filter`, or
  `box-shadow` animation.
- `will-change` applied at most to 2 elements, removed on completion.
- The rAF loop **self-terminates** at 2.8s and releases all handles. Nothing animates afterwards.
  (Current site: an infinite 320-particle loop that never stops.)
- Main-thread cost ≤ 4ms per frame on a mid-range Android; total blocking contribution ≤ 50ms.
- Motion JS ≤ 6KB gzipped, loaded as a separate module, `type="module"`, after the main bundle.
- Zero layout shift: the frame has explicit `aspect-ratio` and reserved dimensions.

---

## 10. Real-project showcase

**Only these four. No exceptions, no "inspiration" entries, no third-party sites.**

| Project | Slug | Card content needed |
|---|---|---|
| SADAFRONIA | `sadafronia` | sector, one-line outcome, live URL, screenshot, date |
| YAYIN | `yayin` | as above |
| Better World | `better-world` | as above |
| ZOHAR AI | `zohar-ai` | as above — presented explicitly as ZOHAR's own platform |

The data lives in `src/_data/projects.json`. That file is the only place a project can be
declared, and every entry requires a `verified: true` flag plus an `owner` field. A project
without `verified: true` fails the build. This makes B1 structurally impossible to repeat.

Screenshots are **captured once and committed as AVIF/WebP** at 1600×1000, never hotlinked. This
removes all 99 `api.microlink.io` requests (B8) and the third-party data leak.

Case-study page structure (per project): hero image, the brief in one paragraph, what was built
(bulleted), the stack, the outcome (only if evidenced), a live link, and next/previous project
navigation.

### 10.1 Carousel behaviour

**Desktop (≥1024px).** A horizontal rail showing 2.2 cards (1440px) or 1.6 (1200px). Prev/next
buttons at the inline-end of the heading row, 44×44, disabled states at the ends (no wrap-around —
with four items, looping disorients). A 4-segment progress rail beneath indicates position and is
clickable. Scrolling uses `scroll-behavior: smooth` on a `scroll-snap-type: x mandatory`
container — the native scroller, not a JS transform, so momentum and accessibility come free.
No autoplay.

**Mobile (<1024px).** As described in §8: one card at 86% viewport width with a 14% peek, native
scroll-snap, dot indicators. Buttons are removed; the swipe and the dots are the controls.

**Keyboard.** The rail is `tabindex="0"` with `role="group"` and
`aria-roledescription="carousel"`. Left/Right arrows move one card (semantics follow `dir` — see
RTL below); Home/End jump to first/last; Tab moves into a card and through its links. Each card
is `role="group"` with `aria-label="Project 2 of 4: YAYIN"`. Focus is never trapped. A visible
`2px --z-action-400` focus ring is mandatory on the rail, the buttons and the dots. Scrolling
triggered by focus uses `scroll-behavior: auto` under reduced-motion.

**Touch.** Native horizontal scroll with `overscroll-behavior-inline: contain` so a swipe past the
last card never triggers browser back-navigation (a common and infuriating failure on iOS).
`-webkit-overflow-scrolling: touch`. No JS drag handler — native scrolling is smoother and
respects platform physics.

**RTL (he, ar).** The rail uses logical properties and `direction: rtl` inherited from `<html>`;
cards flow right-to-left naturally. Prev/next buttons **swap position and glyph direction** so
"next" always means "further into the list" and always points inline-end. Arrow-key mapping is
inverted relative to LTR: in RTL, Left arrow advances. `scroll-snap` and
`scrollLeft` behave with negative or inverted values across engines, so the implementation uses
`element.scrollBy({ inline: 'start' })` and `scroll-snap-align: start` exclusively, never raw
`scrollLeft` arithmetic. This is an explicit QA item (§15).

**LTR.** Standard: left-to-right flow, Right arrow advances, next button at the inline-end.

**Reduced motion.** `scroll-behavior: auto` — cards jump rather than glide. Progress rail
transitions are removed.

---

## 11. Multilingual architecture

### 11.1 The nine locales

| Locale | `lang` | `dir` | `hreflang` | Path | Fonts |
|---|---|---|---|---|---|
| Hebrew | `he` | `rtl` | `he-IL` | `/` | Frank Ruhl Libre + Assistant |
| English | `en` | `ltr` | `en` | `/en/` | Fraunces + Assistant |
| French | `fr` | `ltr` | `fr` | `/fr/` | Fraunces + Assistant |
| Spanish | `es` | `ltr` | `es` | `/es/` | Fraunces + Assistant |
| Portuguese | `pt` | `ltr` | `pt-BR` | `/pt/` | Fraunces + Assistant |
| Russian | `ru` | `ltr` | `ru` | `/ru/` | Fraunces + Inter |
| Chinese | `zh` | `ltr` | `zh-Hans` | `/zh/` | Noto Serif SC + Noto Sans SC |
| Arabic | `ar` | `rtl` | `ar` | `/ar/` | Noto Naskh Arabic + IBM Plex Sans Arabic |
| German | `de` | `ltr` | `de` | `/de/` | Fraunces + Assistant |

Hebrew stays at the root: it is the primary market and the existing production URL. `x-default`
points to `/en/` as the widest-reach fallback. Note the two refinements to current practice:
`/pt/` is declared `pt-BR` (the site's own flag and copy are Brazilian) and `/zh/` is declared
`zh-Hans` (the copy is Simplified).

### 11.2 Centralised content

`src/_data/i18n/{locale}.json`, one flat-ish keyed object:

```json
{
  "hero": {
    "eyebrow": "אתרים שבאמת שלכם",
    "headline": "מכוונה עסקית לנוכחות עסקית.",
    "support": "זוהר בונה אתרים אמיתיים…",
    "cta_primary": "התחילו בריף לפרויקט",
    "cta_secondary": "דברו איתנו בוואטסאפ",
    "motion_intent": "יקב משפחתי בגליל."
  },
  "pillars": { "build": { "title": "בונים", "body": "…" } }
}
```

Templates reference `{{ i18n.hero.headline }}` and contain **no literal user-facing string**.
Numbers, prices and dates come from `pricing.json` and are formatted per locale with
`Intl.NumberFormat` at build time — which is also the fix for the Spanish punctuation bug
(`e2bad8b`) and the five-commit price-change pattern.

### 11.3 RTL / LTR behaviour

- `dir` and `lang` set on `<html>` from `locales.json`. No per-locale stylesheet.
- **All** directional CSS uses logical properties: `margin-inline-start`, `padding-block-end`,
  `inset-inline-start`, `border-inline-end`, `text-align: start`. A CI rule rejects
  `margin-left`, `padding-right`, `left:`, `right:` and `text-align: left|right` in component CSS.
- Icons that encode direction (arrows, chevrons) are flipped via
  `[dir="rtl"] .icon-directional { transform: scaleX(-1) }`. Icons that do not (the WhatsApp
  glyph, the logo mark) are explicitly exempted by class.
- Numbers, Latin brand names and code samples inside RTL text are wrapped in
  `<bdi>` to prevent bidirectional reordering artefacts.
- Hebrew and Arabic get the increased line-heights from §5.
- Arabic additionally: no letter-spacing, no `text-transform`, no synthetic bold — only real
  weights from the variable font.

### 11.4 Metadata, URLs and fallback

- Every page carries a self-referencing absolute `canonical` and the **full 9-entry `hreflang`
  set plus `x-default`** (§12).
- URL preservation per §1.8. New locales, if ever added, follow the same `/{code}/` pattern.
- **Fallback rule:** if a key is missing in a locale, the build substitutes the `en` value **and
  emits a build warning naming the key and locale**. It does not fail the build (that would block
  a legitimate partial translation) but the warning is surfaced in the PR check. A key missing in
  `en` is a hard build failure.
- The language switcher links to the *equivalent page* in the target locale, not to that locale's
  homepage — currently every switch returns the visitor to the homepage, losing their place.
- No IP or `Accept-Language` auto-redirect. It breaks crawlers, breaks sharing, and is a common
  cause of wrong-language indexing. The switcher is explicit and remembered in `localStorage`
  only as a *suggestion banner*, never as a forced redirect.

### 11.5 Translation validation

A build-time script (`scripts/validate-i18n.mjs`) enforces:

1. **Key parity** — every locale has exactly the key set of `en`; extras and missing keys are
   reported per locale.
2. **No untranslated leakage** — a value identical to the `en` value in a non-English locale is
   flagged (allow-listed for legitimate cases: brand names, "AWS", "WhatsApp").
3. **No placeholder residue** — `XXXX`, `TODO`, `Lorem`, and empty strings fail the build. This
   alone would have caught B5.
4. **Interpolation safety** — placeholders (`{count}`, `{price}`) present in `en` must be present
   in every locale.
5. **Direction sanity** — Hebrew and Arabic values must contain characters in their script range;
   Latin-only content in `he.json` is flagged. This would have caught B12.
6. **Length guard** — a value exceeding 160% of the `en` length in a constrained slot (buttons,
   nav, chips) warns, because German and Russian overflow buttons. The current site's workaround
   was to *hide the desktop CTA for AR/RU/PT* (`22564fd`); the length guard replaces that.

---

## 12. SEO / AEO / GEO

### 12.1 Metadata model

Every page's metadata is derived, not hand-written, from
`{ locale, page, site.json, i18n }`:

```
title        = {page.title} | {site.brandName}      ≤ 60 chars, length-checked at build
description  = {page.description}                   140–160 chars, length-checked
canonical    = {site.origin}{page.permalink}        absolute, self-referencing
robots       = index,follow (production) | noindex,nofollow (preview)
og:type      = website | article (case studies)
og:url       = canonical
og:title / og:description / og:site_name / og:locale / og:locale:alternate ×8
og:image     = {site.origin}/assets/og/{locale}-{page}.png   1200×630, per locale
twitter:card = summary_large_image
```

A build check fails on a missing, duplicate, or over-length title or description across all 9 ×
N pages. Today: zero canonical tags and no `og:image` at all.

### 12.2 Canonical strategy

- Self-referencing absolute canonical on every page.
- The directory form (`/en/`) is canonical; `/en/index.html` 301s to it (§1.8).
- No cross-locale canonicalisation — each locale is its own canonical, related by `hreflang`.
  Pointing all locales at the English canonical is the classic mistake and would de-index eight
  languages.
- Trailing slash is enforced consistently in `vercel.json`.

### 12.3 hreflang and x-default

Every page emits all nine alternates plus `x-default`, including a self-reference — the full,
symmetric, bidirectional set, which is what search engines require:

```html
<link rel="alternate" hreflang="he-IL"  href="https://{origin}/">
<link rel="alternate" hreflang="en"     href="https://{origin}/en/">
<link rel="alternate" hreflang="fr"     href="https://{origin}/fr/">
<link rel="alternate" hreflang="es"     href="https://{origin}/es/">
<link rel="alternate" hreflang="pt-BR"  href="https://{origin}/pt/">
<link rel="alternate" hreflang="ru"     href="https://{origin}/ru/">
<link rel="alternate" hreflang="zh-Hans" href="https://{origin}/zh/">
<link rel="alternate" hreflang="ar"     href="https://{origin}/ar/">
<link rel="alternate" hreflang="de"     href="https://{origin}/de/">
<link rel="alternate" hreflang="x-default" href="https://{origin}/en/">
```

Generated from `locales.json`, so it cannot drift out of sync.

### 12.4 Sitemap and robots

`sitemap.xml` generated at build with `xhtml:link` alternate entries per URL (the correct
multilingual form), `lastmod` from git commit date, and priorities per §2.1. No sitemap index is
needed at this scale (~110 URLs).

`robots.txt`:
```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://{origin}/sitemap.xml
```
Plus explicit `Allow` for `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended` — a
deliberate GEO decision: ZOHAR wants to be cited by AI assistants. This is decision **D8**.

### 12.5 Preview no-index

Three independent layers, because one is not enough:
1. Vercel already applies `x-robots-tag: noindex` to preview deployments.
2. The project has **SSO protection enabled** (`all_except_custom_domains`), so previews require
   authentication and are unreachable by crawlers. Verified in the project settings.
3. The build reads `VERCEL_ENV`; when it is not `production`, `head-meta.njk` emits
   `<meta name="robots" content="noindex,nofollow">` and the canonical points at the production
   origin. Belt, braces and a third layer in code.

### 12.6 Schema (JSON-LD)

A single `@graph` per page:

- `Organization` — name, legal name, URL, logo, `sameAs`, `contactPoint` (WhatsApp + email),
  `areaServed`, `knowsLanguage` (all nine — a genuine differentiator).
- `WebSite` — with `inLanguage` and `potentialAction` only if site search exists (it does not, so
  omitted — a fake `SearchAction` is a common error).
- `ProfessionalService` — `serviceType`, `priceRange`, `areaServed`, `address`.
- `Service` × N — one per purchasable service, with `offers` carrying real prices from
  `pricing.json`. **In-development services are excluded from `Offer` markup entirely.**
- `ItemList` on `/work/` → the four projects.
- `CreativeWork` on each case study, with `creator: ZOHAR`, `about`, `url`. This is the
  structured-data counterpart of fixing B1 — the markup asserts authorship, so it must be true.
- `FAQPage` on the home FAQ and `/services/`.
- `BreadcrumbList` on all non-home pages.

All schema is generated from the same data files as the visible content, so markup and page can
never disagree.

### 12.7 Social cards

Nine locale-specific 1200×630 PNGs per key page, generated at build from an SVG template (brand
mark, the locale's headline, the green system). Correct script and direction per locale. Today
there is no `og:image` at all, so every share renders as a bare text link.

### 12.8 Structured factual content (AEO/GEO)

AI assistants cite what they can extract unambiguously. The site therefore includes:

- A **Facts block** on `/about/`, marked up and plainly worded: legal entity, founded, location,
  languages served, services offered, typical delivery time, technology stack, contact. Short
  declarative sentences, no marketing voice.
- **Question-shaped H2s** throughout (`How long does a ZOHAR website take to build?`) with the
  direct answer in the **first 40–60 words** beneath — the extractable-answer pattern.
- **Stable entity naming.** "ZOHAR AI" is used identically everywhere. (Today the site
  inconsistently uses "ZoharAI", "Zohar AI" and "ZOHAR" — which fragments entity recognition.)
- `/llms.txt` — a plain-text summary of what ZOHAR does, what it sells now, what is in
  development, the four projects, and contact details. Explicitly separates the three tenses, so
  an assistant cannot claim the Self-Service builder is available.
- Definition-style content: short, quotable paragraphs for "what is an owned-code website",
  "WordPress vs owned code", "what does BUILD GROW PROVE MEMORY mean".

### 12.9 Service and case-study content structure

**Service page:** Problem → What we build → What is included (list) → What it costs →
Timeline → What you own at the end → FAQ (3) → CTA. Same skeleton for every service so the
markup generator is uniform.

**Case study:** Client & sector → The brief (1 paragraph) → What we built (list) → Stack →
Result (evidenced only) → Live link → Next project. Never a testimonial without a named,
consenting source.

---

## 13. Analytics and conversion

### 13.1 The three conversion paths

**1. Project brief (primary).** A 5-step form, one question per step, progress indicated:
(1) What does your business do? — free text, prefilled from the hero field;
(2) What do you need? — site / store / system / migration;
(3) Languages needed — multi-select from the nine;
(4) Timeline and budget band;
(5) Name + contact method (WhatsApp number or email).
Submitted to a form endpoint (Formspree, Basin, or Vercel Forms — decision D7). No backend, no
database, per the architecture constraint. Progress is preserved in `sessionStorage` so a
refresh does not lose the answers.

**2. WhatsApp path.** `https://wa.me/{number}?text={prefilled}` where the prefilled message is
localised **and** carries the page context: *"Hi, I came from the ZOHAR pricing page and I'm
interested in a Done-For-You store."* Today the link is bare, so every enquiry arrives without
context. The number lives in `site.json`, once, instead of in 117 places across nine files.

**3. Consultation CTA.** A 20-minute call. Booking via an embedded scheduler loaded **on click
only**, never on page load (an eagerly-embedded scheduler iframe typically costs 300–600KB).

### 13.2 Meaningful conversion events

Vanity events are excluded. These are the only events tracked:

| Event | Trigger | Value |
|---|---|---|
| `brief_start` | Step 1 rendered | Micro |
| `brief_step` | Each step completed (`step` param) | Micro |
| `brief_submit` | Successful submission | **Macro** |
| `whatsapp_click` | Any WhatsApp link (`location` param) | **Macro** |
| `consult_open` | Scheduler opened | Micro |
| `consult_booked` | Scheduler confirmation callback | **Macro** |
| `work_case_open` | Case study opened (`project` param) | Intent |
| `pricing_view` | Pricing section ≥50% visible ≥2s | Intent |
| `early_access_submit` | Self-Service waitlist | **Macro** |
| `lang_switch` | Language changed (`from`, `to`) | Diagnostic |

Not tracked: scroll depth beyond a single 75% marker, mouse movement, rage clicks, session
recording. (Hotjar is removed — it is currently loaded with an invalid ID on every page and adds a
consent obligation for no return.)

### 13.3 GTM / GA4 integration points

- **One** GTM container. GA4 is configured **inside** GTM only — never a second `gtag.js` in the
  page, which is the current setup and causes double-counting when both work.
- The page pushes to `dataLayer` with a stable schema; GTM maps to GA4 events. Tag changes then
  need no code deploy.
- `analytics.njk` renders the *correct, complete* GTM snippet from a template, eliminating B4
  permanently.
- GA4 conversions: `brief_submit`, `whatsapp_click`, `consult_booked`, `early_access_submit`.

### 13.4 Meta / TikTok configuration approach

- Loaded **through GTM**, not hard-coded in the page. This is the key structural change: adding or
  removing a pixel becomes a GTM change, not a nine-file edit.
- Both fire only after consent (§13.6).
- Meta: `Lead` on `brief_submit`, `Contact` on `whatsapp_click`. Recommend Conversions API via a
  server container only if ad spend justifies it — **not** in Phase 1.
- TikTok: `SubmitForm` on `brief_submit`. Recommend deferring TikTok entirely until there is an
  active TikTok campaign; a pixel with no campaign is pure overhead and consent liability (D10).

### 13.5 UTM attribution

On first visit, `utm_source/medium/campaign/term/content`, `gclid`, `fbclid` and `ttclid` are
captured into a first-party cookie (`zohar_attr`, 90 days, `SameSite=Lax`, `Secure`). The brief
form injects them as hidden fields, so the enquiry that lands in the inbox carries its origin.
First-touch is stored and never overwritten; last-touch is captured separately in the same
cookie. WhatsApp clicks append a short campaign token to the prefilled message text, which is the
only way to attribute a WhatsApp conversation at all.

### 13.6 Privacy and consent

- **Google Consent Mode v2**, default `denied` for `ad_storage`, `ad_user_data`,
  `ad_personalization` and `analytics_storage` for EU/EEA/UK visitors (the site targets French,
  Spanish, Portuguese and German markets, so GDPR applies), default `granted` for `analytics_storage`
  elsewhere with a clear notice.
- A consent banner that is genuinely dismissible with a real "Reject all" of equal prominence.
- **No third-party tag fires before consent.** This is also why `api.microlink.io` must go: it
  leaks visitor IPs to a third party with no consent gate (B8).
- Real `/privacy/` and `/terms/` pages. The footer currently links "Privacy" to
  `mailto:support@zoharai.com` (B14).
- The business email replaces the personal Gmail address currently published site-wide (D3).

### 13.7 Behaviour when real IDs are absent

This is the direct structural fix for B4 and B5.

`src/_data/analytics.json`:
```json
{ "gtmId": null, "ga4Id": null, "metaPixelId": null,
  "tiktokPixelId": null, "schedulerUrl": null, "formEndpoint": null }
```

`analytics.njk` wraps every snippet in `{% if analytics.gtmId %}`. When an ID is `null`:
- **nothing is emitted** — no script tag, no noscript iframe, no placeholder, no comment;
- the build prints `ANALYTICS: gtmId not configured — GTM omitted` so the gap is visible;
- `scripts/validate-i18n.mjs` rejects any value matching `/X{4,}|TODO|CHANGEME/`, so a
  placeholder can never reach production;
- the `dataLayer` shim is still installed, so `window.dataLayer.push()` calls throughout the app
  are safe no-ops and no console error is thrown.

Result: a site with no analytics configured is *clean*, not *broken*. Today it is broken.

---

## 14. Performance budget

Budgets are enforced in CI (Lighthouse CI + `bundlesize`), and exceeding one **fails the pull
request**. A budget that is not enforced is a wish.

| Resource | Budget (mobile) | Budget (desktop) | Today |
|---|---|---|---|
| **Initial page weight** | **≤ 400KB** | **≤ 600KB** | ~1.5MB+ (99 external screenshots) |
| HTML (gzipped) | ≤ 40KB | ≤ 45KB | ~14KB gz (but 64KB raw) |
| **CSS total** | **≤ 25KB gz** | ≤ 25KB gz | 44KB raw, render-blocking |
| CSS critical (inlined) | ≤ 8KB | ≤ 8KB | none |
| **JavaScript total** | **≤ 30KB gz** | ≤ 30KB gz | 8KB own + 4 broken third-party loaders |
| JS before interaction | ≤ 15KB gz | ≤ 15KB gz | all of it, blocking |
| Hero motion JS | ≤ 6KB gz | ≤ 6KB gz | n/a |
| **Fonts** | **≤ 110KB** | ≤ 110KB | 2 families × 10 weights via Google CDN |
| Fonts preloaded | 2 files | 2 files | 0 (render-blocking stylesheet instead) |
| **Hero video** (if approved) | **not loaded** | ≤ 1.2MB, deferred | n/a |
| Images per page | ≤ 120KB each, ≤ 500KB total | same | 11 uncached third-party renders |
| Third-party requests | **≤ 2** (GTM + fonts=0) | ≤ 2 | 8 distinct hosts |

**Core Web Vitals targets** (75th percentile, field data):

| Metric | Target | Hard fail |
|---|---|---|
| **LCP** (mobile 4G) | ≤ 2.0s | > 2.5s |
| **CLS** | **≤ 0.02** | > 0.05 |
| **INP** | ≤ 150ms | > 200ms |
| TBT (lab) | ≤ 150ms | > 250ms |
| TTFB | ≤ 400ms | > 600ms |

**Lighthouse (mobile, throttled):** Performance ≥ 95, Accessibility **100**, Best Practices 100,
SEO 100. Accessibility at 100 is non-negotiable, not aspirational.

**Layout shift controls.** Every image and media frame has explicit `width`/`height` or
`aspect-ratio`. Fonts use metric-matched fallbacks (§5.5). The sticky nav and sticky mobile CTA
are `position: fixed` and reserve no flow space. No content is injected above existing content
after load — including the consent banner, which enters as a fixed overlay.

**Mobile loading strategy.** Critical CSS inlined; the full stylesheet loaded with
`media="print" onload="this.media='all'"`. `main.js` is `type="module" defer`. `hero-motion.js`
loads only after `load`, only if in view, only if motion is allowed, and only above 375px. Images
are `loading="lazy" decoding="async"` except the single LCP candidate. AVIF with WebP fallback,
`srcset` at 400/800/1600.

**Animation workload.** `transform`/`opacity` only. No `requestAnimationFrame` loop runs longer
than 2.8s. No animation while the tab is hidden. ≤ 4ms/frame main thread on a mid-tier Android;
compositor-only where possible. Total animated elements on screen at once: ≤ 12. Under
`prefers-reduced-motion`, scripted animation never starts.

---

## 15. Responsive and QA matrix

Every cell must pass before a merge to `main`. Rows marked **P0** are release-blocking.

| Class | Device / condition | Viewport | Checks | Pri |
|---|---|---|---|---|
| Small iPhone | SE (2nd/3rd gen) | 375×667 | Hero CTA visible without scroll; D1 ≤ 32px; motion frame replaced by still; no horizontal scroll | **P0** |
| Small iPhone | 12/13 mini | 360×780 | As above; nav fits without wrap | **P0** |
| Floor | Generic small | 320×568 | No horizontal scroll; nav = mark + 2 buttons; all text ≥ 14px | P1 |
| Standard iPhone | 14/15/16 | 390×844 | Baseline design target; safe-area insets; sticky CTA clears home indicator | **P0** |
| Pro Max | 15/16 Pro Max | 430×932 | Line length does not exceed measure; hero does not look sparse | P1 |
| iPhone Safari | iOS 16, 17, 18 | — | `100vh` vs `100dvh` toolbar behaviour; `backdrop-filter` support; scroll-snap RTL; date/tel inputs; no zoom-on-focus (inputs ≥16px) | **P0** |
| Android | Pixel 7/8, Chrome | 412×915 | Fonts render; scroll-snap; consent banner | **P0** |
| Low-power Android | Galaxy A-series / Moto G, 4× CPU throttle | 360×800 | Hero motion ≤ 4ms/frame; TBT ≤ 250ms; INP ≤ 200ms; no jank on the showcase rail | **P0** |
| Tablet portrait | iPad 10.9" | 820×1180 | Not a stretched phone — 2-col pillars, 1.4-card carousel | P1 |
| Tablet landscape | iPad 10.9" | 1180×820 | Desktop nav appears; hero split layout | P1 |
| Laptop | MacBook Air | 1440×900 | Hero fits above fold; 2.2-card carousel | **P0** |
| Desktop | 1920×1080 | — | Content capped at 1200/1440; no stranded whitespace | P1 |
| Ultra-wide | 2560×1080 · 3440×1440 | — | Full-bleed sections do not stretch; `--z-grad-dawn` stays centred; max-width holds | P1 |
| **RTL** | `he`, `ar` | all | Logical properties everywhere; carousel arrows/keys inverted; `<bdi>` on Latin runs; no mirrored logo; no clipped nikud | **P0** |
| **LTR** | remaining 7 | all | German/Russian button overflow (the length guard, §11.5) | **P0** |
| Reduced motion | OS setting on | all | **No rAF scheduled at all**; final hero frame static; carousel jumps; no CSS transitions | **P0** |
| Browser zoom | 200%, 400% | 1280 base | WCAG 1.4.10 reflow: no horizontal scroll at 320 CSS px equivalent; no clipped content | **P0** |
| Text-only zoom | 200% | — | No clipped or overlapped text | P1 |
| Keyboard | Tab / Shift-Tab / Arrows / Esc | all | Visible focus ring everywhere; logical order; menu sheet traps and restores focus; carousel arrow keys; skip-to-content link | **P0** |
| Screen reader | VoiceOver iOS+macOS, NVDA Win | — | Landmarks; one H1; accordion and carousel ARIA; `lang` announced correctly per locale | **P0** |
| Contrast | Automated + manual | all | Every pair ≥ 4.5:1 (≥3:1 non-text); the action-on-emerald rule (§4.3) | **P0** |
| Forced colors | Windows High Contrast | — | Borders and focus survive; no invisible buttons | P2 |
| No-JS | JS disabled | — | Hero renders complete; nav links work; content fully readable | P1 |
| Slow network | Slow 4G, 400kbps | — | LCP ≤ 2.5s; no blank hero; fonts swap without CLS | **P0** |
| Print | — | — | Motion removed, dark background dropped, links expanded | P2 |

Automation: Playwright across Chromium/WebKit/Firefox for the P0 functional rows; axe-core for
contrast and ARIA; Lighthouse CI for the budgets in §14; a visual-regression pass on `he`, `en`
and `ar` at 375, 390, 820 and 1440. Manual: real iPhone SE, real low-power Android, VoiceOver and
NVDA. **URL preservation (§1.8) is checked by `scripts/verify-urls.mjs` against the preview
deployment on every PR.**

---

## 16. Migration and implementation plan

Nothing merges to `main` without the user's explicit approval at the named gate. Every phase is a
separate PR from `redesign/zohar-flagship-marketing-site` or a child branch, each with its own
preview deployment.

---

**Phase 0 — Foundations (no visible change)**
Scaffold 11ty, `package.json`, `vercel.json` (buildCommand, outputDirectory, headers, redirects).
Add `tokens.css`, the reset, the CI pipeline (Lighthouse CI, axe, bundlesize, `validate-i18n`,
`verify-urls`, the no-literal-hex and no-physical-property lint rules).
**Critically: port the existing nine pages through the new pipeline byte-comparably first.** The
build must reproduce today's site before it changes today's site.
*Test:* `verify-urls` passes on all 21 legacy URLs; visual diff vs production is empty.
**Gate 0 — user confirms the preview is indistinguishable from production.**

---

**Phase 1 — Truth and repair (highest value, lowest risk)**
This phase ships the corrections independently of the redesign, so the exposure is closed early.
- **Remove the 11 third-party portfolio entries (B1).** Replace with the four verified projects
  from `projects.json`, with committed screenshots. Remove all 99 microlink calls (B8).
- **Remove the unsubstantiated testimonials and metric claims (B2).**
- **Fix the hero CTA (B3)** — either ship the brief form or repoint the CTA (D1).
- **Fix or remove all analytics (B4, B5)** — null-safe `analytics.njk`; nothing renders without a
  real ID.
- **Add the SEO foundation (B6)** — canonical, hreflang ×9 + x-default, sitemap, robots, JSON-LD,
  og:image, and an `<h1>` on the Hebrew page.
- Fix the typewriter locale fallback (B12).
- Add `/privacy/` and `/terms/` (B14).
*Test:* full P0 QA matrix; Lighthouse ≥ 90; `validate-i18n` clean; manual read of all 9 locales.
**Gate 1 — user approves. This phase may merge to `main` ahead of the redesign.**

---

**Phase 2 — Design system and homepage**
Full `tokens.css`; self-hosted fonts; the component library; the new homepage per §2.2, §7, §8;
the hero motion per §9; the showcase carousel per §10. Hebrew and English only.
*Test:* full QA matrix including RTL, reduced motion, zoom, keyboard, screen reader; all §14
budgets enforced in CI; design review against this document.
**Gate 2 — user approves the Hebrew and English homepage on preview.**

---

**Phase 3 — Logo**
Develop the two recommended concepts (B primary, A alternate) to full fidelity: mark, horizontal
and stacked lockups in HE and EN, monochrome, favicon set, motion version.
**Gate 3 — user selects one direction.** Only then is it applied site-wide.

---

**Phase 4 — Remaining pages**
`/work/` + 4 case studies, `/services/`, `/pricing/`, `/roadmap/`, `/about/`, `/contact/` with the
brief form. Hebrew and English.
*Test:* QA matrix on new templates; schema validation; URL checks.
**Gate 4 — user approves.**

---

**Phase 5 — The remaining seven locales**
Translate all copy from the HE/EN controlling text. Per-locale font subsets, per-locale OG images,
hreflang completion, `validate-i18n` green.
*Test:* native-speaker review per locale (or a professional pass — D4); RTL matrix for Arabic;
German and Russian length guard; Chinese line-breaking.
**Gate 5 — user approves each locale, or approves in batches.**

---

**Phase 6 — Analytics, consent and launch**
Real GTM container; GA4 configuration; consent mode v2; the consent banner; UTM capture; form
endpoint wired; conversion events verified end-to-end with GTM Preview.
*Test:* every event in §13.2 fires once and only once; consent blocks tags before acceptance;
brief submissions arrive with attribution.
**Gate 6 — user approves.**

---

**Phase 7 — Production cutover**
Merge to `main` → Vercel production deploy. Immediately: re-verify all 21 legacy URLs against
production; submit the new sitemap in Search Console; monitor Core Web Vitals and 404s for 72
hours. The previous production deployment
(`dpl_2mw25nzJyRUUtksbD6Kgj1rfnmiQ`) remains a one-click rollback for the entire period.

---

**Rollback:** every phase is a separate merge commit, and Vercel retains each production
deployment. Rollback is instant and does not require a code change.

---

## 17. Decisions required from the user

Only decisions that materially change design, positioning, cost, content or implementation. Each
carries a recommendation.

| # | Decision | Why it matters | **Recommendation** |
|---|---|---|---|
| **D1** | **The Self-Service builder: does it exist in any usable form?** | Determines whether `/builder.html` is built (Phase 1 scope, significant), the CTA is repointed to the brief, and whether the Self-Service pricing tier stays. It is currently sold, priced, and 404s. | **Repoint the hero CTA to the project brief now. Remove the Self-Service pricing tier until the product exists. Present it as "in development" with an early-access list.** Selling an unavailable product at a published price is the same exposure class as B1. |
| **D2** | **Is there any real, consented client testimonial or metric?** | Decides whether §3.5 proof is testimonial-led or work-led. The current quotes and figures must come down either way. | **Ship work-led proof (the four projects). Add testimonials only when you have a named client, their business, their consent, and a link.** One real quote outweighs four invented ones. |
| **D3** | **Public business identity: email, legal entity, address.** | Needed for the footer, `/about/`, `Organization` schema, `/privacy/`, and basic credibility. Today the public address is a personal Gmail and the "Privacy" link is a `mailto:` to a different, undocumented domain. | **Register and publish a business email on the brand domain, name the legal entity and its country, and state a service area even if there is no public office.** |
| **D4** | **Translation quality for the seven non-HE/EN locales.** | Phase 5 cost and schedule. The current Spanish required a punctuation fix commit, and seven locales currently show English strings in the hero. | **Professional human review for French, Spanish, German and Portuguese (highest commercial value). Machine translation with a native proofread for Russian, Chinese and Arabic.** Arabic must be proofread by a native speaker — RTL typography errors are invisible to a non-reader. |
| **D5** | **Brand name: "ZOHAR" or "ZOHAR AI"?** | Affects the logo lockup, every `<title>`, schema `Organization.name`, and entity recognition. The site currently uses "ZoharAI", "Zohar AI" and "ZOHAR" interchangeably. | **"ZOHAR" as the mark and the wordmark; "ZOHAR AI" as the full legal/entity name used in titles and schema.** "AI" in a logo dates quickly; the name alone is stronger and more ownable. Either way: pick one and use it identically everywhere. |
| **D6** | **Hero: code-based motion only, or add a video?** | ~1.2MB, nine localisations, and the mobile performance budget. | **Code-based motion only for launch (§9.4).** It localises, respects reduced-motion, costs 6KB, and stays crisp. Revisit video after launch with real engagement data. |
| **D7** | **Form endpoint for the project brief.** | The architecture forbids a backend, so the brief needs a third-party endpoint. | **Formspree or Basin on a paid tier (~$10–25/mo)** — GDPR-compliant, no backend, spam filtering, forwards to email and webhook. Vercel Forms is an acceptable alternative if you prefer a single vendor. |
| **D8** | **Allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)?** | Directly determines whether ZOHAR is citable by AI assistants — which is the "AEO/GEO" objective in the brief. | **Allow them.** For a business whose customers increasingly ask an assistant "who builds websites in Israel", being uncitable is a self-inflicted loss. Revisit only if content scraping becomes a commercial problem. |
| **D9** | **Light theme?** | Roughly +25% design and QA effort across 9 locales and the full device matrix. | **Dark only for launch.** The green system is designed for a dark canvas and is materially weaker on white. A light theme is a Phase 8 item if ever. |
| **D10** | **Keep the TikTok pixel and Hotjar?** | Both are currently loaded with invalid IDs on every page, adding weight and a consent obligation for zero return. | **Remove both.** Reintroduce TikTok only alongside an active TikTok campaign; reintroduce Hotjar only for a defined research question with a fixed end date. |
| **D11** | **Custom domain.** | The site is live only on `*.vercel.app`. This caps SEO authority, makes `canonical`/`hreflang`/schema URLs provisional, and undermines the business email in D3. Every absolute URL in §12 depends on it. | **Register and connect the brand domain before Phase 1 merges.** Doing it after launch means re-issuing every canonical, hreflang, sitemap and OG URL, plus a redirect map. |
| **D12** | **Are the four projects' details and live URLs confirmed, and may they be shown?** | Phase 1 cannot ship without the sector, one-line outcome, live URL and permission for SADAFRONIA, YAYIN, Better World and ZOHAR AI. They appear nowhere in the repo today. | **Confirm all four with client permission where the work was for a client.** If any cannot be shown, say so now — three real projects beat four with one disputed. |

---

## 18. Readiness

**Recommendation: READY FOR APPROVAL.**

This document specifies the architecture, folder structure, tokens, type scale, colour values with
measured contrast ratios, controlling copy in Hebrew and English, three logo concepts, desktop and
mobile wireframes, motion timings, carousel behaviour across five interaction modes, the
multilingual and SEO models, the event schema, enforced performance budgets, a QA matrix and a
gated implementation plan. A senior implementation agent can build Phases 0–2 from it without
inventing product or design decisions.

Twelve decisions (§17) are open. **D1, D3, D11 and D12 block Phase 1**; the remainder can be
resolved in parallel with Phase 0.

One finding warrants attention independently of this project's schedule: **B1 — eleven
third-party websites presented as ZOHAR's own work, live in nine languages** — together with
**B2**, the fabricated testimonials. These are live now. Phase 1 is deliberately structured so
they can be corrected and merged ahead of the redesign.

---

*Gate 2 — planning only. No implementation. No production change.*
