# ZOHAR — business input checklist

Everything the build needs from you. Each row maps to one field in
`src/_data/site.js`. Supplying a value is a data edit, never a code change.

## Supplied and live

| Input | Value | Where it appears |
|---|---|---|
| Public WhatsApp | `972555626040` (displayed `055-562-6040`) | Hero CTA, brief alternates, mobile sheet, footer — all with a localised prefill carrying no personal data, page history or tracking identifier |
| Public email | `support@zoharai.com` | Footer, brief alternates, `Organization.email` |
| Entry price | `₪4,900` starting point | Commercial-offer section, once, with the scope qualifier |
| Commercial terms | 50/50, two consolidated revision rounds, ₪650 extra round, ₪300/hr out of scope, 1 year hosting, ₪600/yr renewal | Relevant FAQ answers; not expanded into a contract checklist in the offer |
| Published languages | Hebrew, English, French | Full homepage, portfolio copy, metadata and trust pages |
| Approved web hosts | `www.zohar-ai.co.il` (HE), `zohar-ai.com` (EN/FR) | Canonical architecture is implemented but held until cutover |
| Portfolio proof | ZOHAR, SADAFRONIA, Better World, YAYIN, Eco-Tech, Urban Fashion, Le Monde Séfarade | Local media, reviewed copy and outbound destinations |

`m.plus770@gmail.com` is **not** present anywhere in the built HTML, schema,
metadata or client-side JavaScript. Verified by grep on every build.

## Still required

| # | Input | Blocks | Notes |
|---|---|---|---|
| 1 | **DNS and TLS cutover evidence** | Attaching the approved hosts and enabling the SEO surface | After both hosts validate, set `ZOHAR_ORIGIN_HE=https://www.zohar-ai.co.il` and `ZOHAR_ORIGIN_INTL=https://zohar-ai.com`. Preview remains noindex until then. |
| 2 | **Registered legal entity or approved public business name + country** | Final legal identification in schema and formal documents | Not to be inferred. The public privacy, accessibility and terms pages are deliberately factual and identify the approved contact, but do not invent a registered entity. |
| 3 | **Service area** | `ProfessionalService.areaServed` | e.g. Israel, or a city list. |
| 4 | **Approved form destination** | Project-brief submission | The UI and validation are built; `preventDefault` holds and nothing is transmitted or stored until an endpoint **and** its privacy handling are approved. |
| 5 | **Response-time promise** | Brief confirmation copy and the contact section | e.g. "within one business day". Currently null, so no promise is made. |
| 6 | **Live recapture at cutover** | Final assurance that project media still matches each external destination | Existing captures are local and approved; re-verify every destination immediately before production. |
| 7 | **Scheduler URL** | Consultation CTA | Currently renders as inert text. |
| 8 | **Premium tier public?** | Whether ₪7,900 is shown | Held internal and unrendered, per instruction. |
| 9 | **Social profiles** | `Organization.sameAs` | Optional. |
| 10 | **Founded date** | `Organization.foundingDate` | Optional. |

## Rule

No value here is ever inferred from conversation history, profile data or a
previous project. An unsupplied field stays null, and the template renders inert
text rather than a broken link.
