# ZOHAR — Project media specification

Required before any project can move from an internal placeholder to published
proof. Applies to **ZOHAR, SADAFRONIA and YAYIN**. **Better World must not be
captured at all** until display permission is confirmed in writing.

No external screenshot API. No hotlinking. No stock browser-chrome mockups as
final proof. Every asset is captured once and committed to the repository.

---

## 1 · Capture

| | Desktop | Mobile |
|---|---|---|
| **Viewport** | 1440 × 900 CSS px | 390 × 844 CSS px |
| **Device pixel ratio** | 2 | 3 |
| **Raw capture** | 2880 × 1800 | 1170 × 2532 |
| **Region** | Top of page through the first full content section | Top of page through the primary CTA |
| **Colour profile** | sRGB | sRGB |
| **State** | Final frame. No animation mid-flight, no hover, no focus ring, no cookie banner, no scrollbar. | Same, plus no browser chrome and no status bar. |

Capture the **live site at its own domain**, logged out, with the viewport at a
standard zoom of 100%. Wait for fonts and images to settle before the shot.

## 2 · Export

Two formats per capture, AVIF first with WebP as the fallback. No JPEG, no PNG
for photographic content.

| Slot | Width | Aspect | AVIF budget | WebP budget |
|---|---|---|---|---|
| `card` | 800 | 16:10 | ≤ 45 KB | ≤ 70 KB |
| `card@2x` | 1600 | 16:10 | ≤ 110 KB | ≤ 170 KB |
| `mobile` | 480 | 9:16 | ≤ 40 KB | ≤ 60 KB |
| `mobile@2x` | 960 | 9:16 | ≤ 95 KB | ≤ 145 KB |

Quality target: AVIF q≈55, WebP q≈78. Re-encode rather than upscale. Total
media budget for the three projects: **≤ 500 KB** on a card-only homepage view.

## 3 · Focal area

The card slot is 16:10 and crops from a taller capture, so the crop must be
declared, not guessed.

- **Focal point** is expressed as `focal: [x, y]` in fractions of the raw
  capture, defaulting to `[0.5, 0.18]` — the upper-middle, where a site's
  identity and headline live.
- The crop keeps the **full width** of the capture and takes the 16:10 band
  centred on the focal Y, clamped to the capture bounds.
- The project's **logo or wordmark must survive the crop**. If it cannot, move
  the focal point rather than shrinking the type.
- No text may be clipped mid-glyph at any breakpoint.
- `object-position` is set from the same focal value so art direction and CSS
  never disagree.

## 4 · Alt text

One sentence per locale, describing **what the site is**, not what the image
shows. No "screenshot of", no keyword stuffing, no metrics.

- Hebrew and English are both required before a project publishes.
- Maximum 125 characters.
- Example shape — EN: `SADAFRONIA — a wine, hospitality and academy brand site built by ZOHAR.`

## 5 · Data fields

Every project in `src/_data/projects.js` carries exactly these fields. A project
missing any required field for a published locale fails the build.

```js
{
  slug:        "sadafronia",              // URL-safe, stable
  name:        "SADAFRONIA",              // display name, never translated
  own:         true,                      // part of the ZOHAR ecosystem
  verified:    true,                      // confirmed genuine ZOHAR work
  permission:  true,                      // cleared for public display
  url:         null,                      // live URL, or null to render unlinked
  category:    { he: "…", en: "…" },      // short sector line
  description: { he: "…", en: "…" },      // 1–2 sentences, no claims
  alt:         { he: "…", en: "…" },      // per §4
  focal:       [0.5, 0.18],               // per §3
  media: {                                // per §2 — null until captured
    card:   { avif: "/assets/work/<slug>-card.avif",   webp: "…-card.webp"   },
    card2x: { avif: "…-card@2x.avif",                   webp: "…-card@2x.webp" },
    mobile: { avif: "…-mobile.avif",                    webp: "…-mobile.webp"  },
    mobile2x:{ avif: "…-mobile@2x.avif",                webp: "…-mobile@2x.webp" },
  },
}
```

**Ownership and permission are separate on purpose.** `own` controls the wording
("from our own ecosystem" vs client work). `permission` controls whether the
project renders at all. Better World is `own: false, permission: false` and is
therefore absent from every surface — proof strip, carousel and schema.

## 6 · Publication gate

1. `media` is non-null for all four slots.
2. `alt` is present in both published locales.
3. `url` resolves, or is deliberately null.
4. A production build renders no element carrying the internal-placeholder chip.

Until all four hold, the project shows a clearly labelled internal placeholder
on the protected preview and **is dropped from a production build**.
