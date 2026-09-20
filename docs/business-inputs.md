# ZOHAR — business input checklist

Everything the build needs from you. Each row maps to one field in
`src/_data/site.js`. Supplying a value is a data edit, never a code change.

## Supplied and live

| Input | Value | Where it appears |
|---|---|---|
| Public WhatsApp | `972555626040` (displayed `055-562-6040`) | Hero CTA, brief alternates, mobile sheet, footer — all with a localised prefill carrying no personal data, page history or tracking identifier |
| Public email | `support@zoharai.com` | Footer, brief alternates, `Organization.email` |
| Entry price | `₪4,900` starting point | Commercial-offer section, once, with the scope qualifier |
| Commercial terms | 50/50, two consolidated revision rounds, ₪650 extra round, ₪300/hr out of scope, 1 year hosting, ₪600/yr renewal | Offer fine print |

`m.plus770@gmail.com` is **not** present anywhere in the built HTML, schema,
metadata or client-side JavaScript. Verified by grep on every build.

## Still required

| # | Input | Blocks | Notes |
|---|---|---|---|
| 1 | **Custom domain** | Every canonical, hreflang, sitemap, OG and schema URL; the whole SEO surface | Set `ZOHAR_ORIGIN`. Until then nothing SEO-facing is emitted at all — deliberately, because a guessed canonical is worse than none. |
| 2 | **Legal entity / public business name** | Footer copyright, `Organization.legalName`, Privacy and Terms pages | Not to be inferred. Currently null. |
| 3 | **Service area** | `ProfessionalService.areaServed` | e.g. Israel, or a city list. |
| 4 | **Approved form destination** | Project-brief submission | The UI and validation are built; `preventDefault` holds and nothing is transmitted or stored until an endpoint **and** its privacy handling are approved. |
| 5 | **Response-time promise** | Brief confirmation copy and the contact section | e.g. "within one business day". Currently null, so no promise is made. |
| 6 | **Project media + alt text** | Publishing real proof for ZOHAR, SADAFRONIA, YAYIN | Per `docs/project-media-spec.md`. |
| 7 | **Better World permission** | Whether it appears at all | Explicit yes/no. Currently `permission: false` and fully hidden. |
| 8 | **Scheduler URL** | Consultation CTA | Currently renders as inert text. |
| 9 | **Premium tier public?** | Whether ₪7,900 is shown | Held internal and unrendered, per instruction. |
| 10 | **Social profiles** | `Organization.sameAs` | Optional. |
| 11 | **Founded date** | `Organization.foundingDate` | Optional. |

## Rule

No value here is ever inferred from conversation history, profile data or a
previous project. An unsupplied field stays null, and the template renders inert
text rather than a broken link.
