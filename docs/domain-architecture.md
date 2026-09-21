# ZOHAR — two-domain architecture, cutover and rollback

Status: **prepared in code, not activated.** No DNS record, nameserver, MX,
SPF, DKIM, DMARC, domain assignment, production alias or deployment has been
touched. `domains.he` and `domains.international` are `null`, so the build emits
no canonical, no hreflang, no schema and no sitemap entries at all.

**Canonical decision — CLOSED (§6c).**

| Market | Canonical origin |
|---|---|
| Hebrew / Israel | `https://www.zohar-ai.co.il/` |
| International | `https://zohar-ai.com/` |

The approved host behaviour is encoded as data in `src/_data/hostMap.js` and
proved by `npm run check:hostmap` (§2b). Encoding it activates nothing:
`vercel.json` still carries no host rule, and no domain is attached to the
Vercel project.

---

## 1 · Domain roles

| Domain | Role | Verified current state |
|---|---|---|
| `zohar-ai.co.il` | **Israel / Hebrew canonical host.** | Apex **301 → `www.zohar-ai.co.il`**; `www` serves the legacy Hebrew site |
| `zohar-ai.com` | **International canonical host.** English at the root, every future locale beneath it. | `www` serves **the same legacy Hebrew site**; apex behaviour **unverified** |
| `zoharai.com` | **Not a website origin.** Mail only — `support@zoharai.com`, confirmed working. | GoDaddy for-sale page; mail records must be preserved untouched |

### Material finding

**`www.zohar-ai.com` currently serves the Hebrew site.** Two consequences:

1. **There is already duplicate content across both domains today** — the same
   Hebrew pages answer on `.co.il` and on `.com`. Whatever ranking signal exists
   is split between two hosts with no canonical or hreflang linking them. The
   cutover fixes this rather than causing it.
2. **`.com` must stop serving Hebrew at cutover.** Under the approved
   architecture `.com` is the English/international canonical. Hebrew URLs
   requested on `.com` redirect to their `.co.il` equivalents, and vice versa —
   §2 covers both directions.

Hebrew is never canonical on `.com`. The international locales are never
canonical on `.co.il`. There is exactly one canonical copy of each page.

## 2 · One build, two hosts

The build writes Hebrew to `/` and English to `/en/`. At cutover the edge routes
each request to its canonical host and rewrites the international host so
English answers at its root.

### The ordering rule

**Cross-domain locale routing takes precedence over hostname normalisation.**

This is the substance of the map, not a detail. If the hostname is normalised
first and the locale transferred second, `zohar-ai.co.il/en/` becomes
`www.zohar-ai.co.il/en/` and only then `zohar-ai.com/` — two redirects for a
single request. Matching the locale rules on **both hostname forms of each
domain**, ahead of the normalisation rules, sends every request to its final
host in one move.

**Budget: a canonical URL takes 0 redirects. Every other approved URL takes at
most 1.** `scripts/verify-host-map.mjs` fails the build on any chain longer than
one hop.

```jsonc
// vercel.json — NOT YET ADDED. Paste at cutover, after the domains are attached
// and TLS is issued for all four hostnames. Order is significant: Vercel
// evaluates redirects before rewrites, and the first match in each list wins.
"redirects": [
  // ── 1 · LOCALE ROUTING FIRST, matched on BOTH hostname forms of each domain.
  //        These must precede every normalisation rule below.
  { "source": "/en/:p*",
    "has": [{ "type": "host", "value": "zohar-ai.co.il" }],
    "destination": "https://zohar-ai.com/:p*", "permanent": true },
  { "source": "/en/:p*",
    "has": [{ "type": "host", "value": "www.zohar-ai.co.il" }],
    "destination": "https://zohar-ai.com/:p*", "permanent": true },
  { "source": "/:lang(fr|es|pt|ru|zh|ar|de)/:p*",
    "has": [{ "type": "host", "value": "zohar-ai.co.il" }],
    "destination": "https://zohar-ai.com/:lang/:p*", "permanent": true },
  { "source": "/:lang(fr|es|pt|ru|zh|ar|de)/:p*",
    "has": [{ "type": "host", "value": "www.zohar-ai.co.il" }],
    "destination": "https://zohar-ai.com/:lang/:p*", "permanent": true },
  // Hebrew has no /he/ prefix — it is the root of its own host. Fold the
  // duplicate away rather than serving the same page at two URLs.
  { "source": "/he/:p*",
    "has": [{ "type": "host", "value": "zohar-ai.co.il" }],
    "destination": "https://www.zohar-ai.co.il/:p*", "permanent": true },
  { "source": "/he/:p*",
    "has": [{ "type": "host", "value": "www.zohar-ai.co.il" }],
    "destination": "https://www.zohar-ai.co.il/:p*", "permanent": true },
  { "source": "/he/:p*",
    "has": [{ "type": "host", "value": "zohar-ai.com" }],
    "destination": "https://www.zohar-ai.co.il/:p*", "permanent": true },
  { "source": "/he/:p*",
    "has": [{ "type": "host", "value": "www.zohar-ai.com" }],
    "destination": "https://www.zohar-ai.co.il/:p*", "permanent": true },
  // English is canonical at the ROOT of .com; /en/ is the duplicate.
  { "source": "/en/:p*",
    "has": [{ "type": "host", "value": "zohar-ai.com" }],
    "destination": "https://zohar-ai.com/:p*", "permanent": true },
  { "source": "/en/:p*",
    "has": [{ "type": "host", "value": "www.zohar-ai.com" }],
    "destination": "https://zohar-ai.com/:p*", "permanent": true },

  // ── 2 · HOSTNAME NORMALISATION LAST. Reached only when no locale rule
  //        matched, so it can never be the first half of a two-hop chain.
  { "source": "/:p*", "has": [{ "type": "host", "value": "zohar-ai.co.il" }],
    "destination": "https://www.zohar-ai.co.il/:p*", "permanent": true },
  { "source": "/:p*", "has": [{ "type": "host", "value": "www.zohar-ai.com" }],
    "destination": "https://zohar-ai.com/:p*", "permanent": true }
],
"rewrites": [
  // Each host serves its OWN robots.txt — see §4.
  { "source": "/robots.txt", "has": [{ "type": "host", "value": "www.zohar-ai.co.il" }],
    "destination": "/robots-he.txt" },
  // Assets, sitemaps and robots resolve at their own paths on .com, pinned to
  // identity BEFORE the English catch-all below.
  { "source": "/assets/:p*",        "has": [{ "type": "host", "value": "zohar-ai.com" }], "destination": "/assets/:p*" },
  { "source": "/concept-gate2/:p*", "has": [{ "type": "host", "value": "zohar-ai.com" }], "destination": "/concept-gate2/:p*" },
  { "source": "/robots.txt",        "has": [{ "type": "host", "value": "zohar-ai.com" }], "destination": "/robots.txt" },
  { "source": "/sitemap.xml",       "has": [{ "type": "host", "value": "zohar-ai.com" }], "destination": "/sitemap.xml" },
  // Published international locales are served from their own directories.
  { "source": "/:lang(fr|es|pt|ru|zh|ar|de)/:p*", "has": [{ "type": "host", "value": "zohar-ai.com" }], "destination": "/:lang/:p*" },
  // Everything else on .com is English at the root.
  { "source": "/:p*", "has": [{ "type": "host", "value": "zohar-ai.com" }], "destination": "/en/:p*" }
]
```

`www.zohar-ai.co.il` is the Hebrew canonical, so it is the one host with no
normalisation redirect of its own.

### What is preserved across every redirect

| | Preserved | How |
|---|---|---|
| Full equivalent path | yes | `:p*` captures the remainder; a locale transfer strips exactly the leading `/xx/` segment and keeps the rest |
| Query string | yes | carried by Vercel on a redirect; asserted per case in §2b |
| Trailing slash | yes | `trailingSlash: true` is already set in `vercel.json`; `/en/work/` → `/work/`, `/en/work` → `/work`. Asserted in §2b |
| Fragment | yes | a fragment is **never sent to the server**. The browser re-attaches it to the `Location` target itself, which is why a single hop matters: each extra hop is another chance for a client to drop it |

`zoharai.com → zohar-ai.com` is **not authorised** and is not listed above.

## 2b · The host map is encoded as data and tested

`src/_data/hostMap.js` holds the approved canonical origins, the four hosts that
need TLS before any redirect is activated, and the eleven ordered rules above in
machine-readable form. It is data only — no template reads it at build time and
it changes no output.

`scripts/verify-host-map.mjs` (`npm run check:hostmap`) walks the rule chain for
23 requests and **fails the build on any chain longer than one hop**:

```
── final host map ──
  redirects  request                                   result
      0      https://www.zohar-ai.co.il/                https://www.zohar-ai.co.il/ [he]
      0      https://zohar-ai.com/                      https://zohar-ai.com/ [en]
      0      https://zohar-ai.com/fr/                   https://zohar-ai.com/fr/ [fr]
      1      https://zohar-ai.co.il/                    https://www.zohar-ai.co.il/ [he]
      1      https://zohar-ai.co.il/about/?a=1          https://www.zohar-ai.co.il/about/?a=1 [he]
      1      https://www.zohar-ai.com/                  https://zohar-ai.com/ [en]
      1      https://www.zohar-ai.com/fr/               https://zohar-ai.com/fr/ [fr]
      1      https://zohar-ai.co.il/en/                 https://zohar-ai.com/ [en]
      1      https://zohar-ai.co.il/en/work?a=1         https://zohar-ai.com/work?a=1 [en]
      1      https://zohar-ai.co.il/en/work/?a=1        https://zohar-ai.com/work/?a=1 [en]
      1      https://zohar-ai.co.il/de/x?q=2            https://zohar-ai.com/de/x?q=2 [de]
      1      https://www.zohar-ai.co.il/en/             https://zohar-ai.com/ [en]
      1      https://www.zohar-ai.co.il/fr/             https://zohar-ai.com/fr/ [fr]
      1      https://www.zohar-ai.co.il/de/x?q=2        https://zohar-ai.com/de/x?q=2 [de]
      1      https://www.zohar-ai.com/he/               https://www.zohar-ai.co.il/ [he]
      1      https://www.zohar-ai.com/he/about?z=3      https://www.zohar-ai.co.il/about?z=3 [he]
      1      https://www.zohar-ai.com/he/about/?z=3     https://www.zohar-ai.co.il/about/?z=3 [he]
      1      https://zohar-ai.com/he/                   https://www.zohar-ai.co.il/ [he]
      1      https://zohar-ai.com/en/                   https://zohar-ai.com/ [en]
      1      https://zohar-ai.com/en/work?a=1           https://zohar-ai.com/work?a=1 [en]
      1      https://www.zohar-ai.com/en/               https://zohar-ai.com/ [en]
      1      https://www.zohar-ai.co.il/he/             https://www.zohar-ai.co.il/ [he]
      1      https://zohar-ai.co.il/he/about?z=3        https://www.zohar-ai.co.il/about?z=3 [he]

── invariants ──
  ok  canonical URLs take 0 redirects; every other approved URL takes <= 1
  ok  no chain normalises the hostname before transferring the locale
  ok  no Hebrew on .com, no English on .co.il
  ok  path, query and trailing slash preserved; every approved host covered by a rule

── sitemap host check ──
  zohar-ai.com         /robots.txt     advertises /sitemap.xml     1 URL(s), all 0-redirect 200
  www.zohar-ai.co.il   /robots-he.txt  advertises /sitemap-he.xml  1 URL(s), all 0-redirect 200
  ok  neither sitemap is advertised by the wrong host; no held locale appears in either

── loop guard (negative control) ──
  ok  guard fires on a circular pair

host map: PASS — 23 cases, every canonical 0 redirects, every other URL <= 1,
          per-host sitemaps verified, loop guard proved to fire
```

**There are no two-hop chains.** Every one of the 23 approved requests reaches
its final host in 0 or 1 redirect.

Two negative controls, because a check that cannot fail proves nothing:

1. **Loop guard.** A deliberately circular rule pair, never part of the approved
   map, must be caught rather than resolved.
2. **Budget guard.** Restoring the old precedence — normalisation rule first —
   makes the suite exit 1 and name each over-budget request
   (`OVER BUDGET — max is 1`). Verified, then reverted.

A third assertion states the rule directly rather than only its effect: no chain
may both normalise the hostname and transfer the locale.

**This test models the rules, not the live edge.** It proves the map is
internally consistent. It cannot prove Vercel's matcher behaves identically —
that is what step 10 of §7 verifies against the real hosts.

## 3 · Cross-domain canonical and hreflang map

Every published page carries a self-referencing canonical on its own host, plus
the full symmetric alternate set. Unpublished locales appear in neither.

| Locale | hreflang | Canonical URL | Build path |
|---|---|---|---|
| Hebrew | `he-IL` | `https://www.zohar-ai.co.il/` | `/` |
| English | `en` | `https://zohar-ai.com/` | `/en/` |
| French | `fr` | `https://zohar-ai.com/fr/` | `/fr/` |
| Spanish | `es` | `https://zohar-ai.com/es/` | `/es/` |
| Portuguese | `pt-BR` | `https://zohar-ai.com/pt/` | `/pt/` |
| Russian | `ru` | `https://zohar-ai.com/ru/` | `/ru/` |
| Chinese | `zh-Hans` | `https://zohar-ai.com/zh/` | `/zh/` |
| Arabic | `ar` | `https://zohar-ai.com/ar/` | `/ar/` |
| German | `de` | `https://zohar-ai.com/de/` | `/de/` |
| — | `x-default` | `https://zohar-ai.com/` | — |

**At the current HE/EN stage only `he-IL`, `en` and `x-default` are emitted.**
Verified by building with both origins set:

```
$ VERCEL_ENV=production \
  ZOHAR_ORIGIN_HE=https://www.zohar-ai.co.il \
  ZOHAR_ORIGIN_INTL=https://zohar-ai.com  npx @11ty/eleventy

HE  /            canonical https://www.zohar-ai.co.il/
                 alternates he-IL https://www.zohar-ai.co.il/
                            en    https://zohar-ai.com/
                            x-default https://zohar-ai.com/
EN  /en/         canonical https://zohar-ai.com/
                 alternates he-IL https://www.zohar-ai.co.il/
                            en    https://zohar-ai.com/
                            x-default https://zohar-ai.com/
FR  /fr/         noindex,nofollow,noarchive,nosnippet
                 NO canonical · NO hreflang · NO og:url · NO og:image · NO schema
                 absent from both sitemaps and from every hreflang set

sitemap.xml      <loc>https://zohar-ai.com/</loc>          0 .co.il URLs
sitemap-he.xml   <loc>https://www.zohar-ai.co.il/</loc>    0 .com URLs
robots.txt       Sitemap: https://zohar-ai.com/sitemap.xml          (only)
robots-he.txt    Sitemap: https://www.zohar-ai.co.il/sitemap-he.xml (only)
```

### Held locales emit no publication signal at all

An earlier build did emit a self-referencing canonical on a held locale
(`https://zohar-ai.com/fr/`). **That is fixed.** A locale whose `ready` flag is
false is a placeholder, not a publication surface, and now emits:

| Signal | Published locale | Held locale |
|---|---|---|
| `robots` | `index,follow,max-image-preview:large` | `noindex,nofollow,noarchive,nosnippet` |
| `<link rel="canonical">` | yes, self-referencing on its own origin | **none** |
| `<link rel="alternate" hreflang>` | full symmetric set | **none** |
| `og:url` | yes | **none** |
| `og:image` | yes | **none** |
| `application/ld+json` | yes | **none** |
| Listed in a sitemap | yes, on its own host only | **never** |
| Listed in another page's hreflang set | yes | **never** |

`src/_includes/partials/head.njk` gates all of it on one variable, `publishes`
(`canonical and loc.ready`), so the signals cannot drift apart from each other.

This is enforced on every build by `npm run check:surface`
(`scripts/verify-publication-surface.mjs`), which runs its own production build
into a scratch directory and asserts both directions — every published locale
carries **all** signals on its own approved origin, every held locale carries
**none**:

```
── publication surface ──
  he  published  canonical, hreflang, og:url, og:image, ld+json
  en  published  canonical, hreflang, og:url, og:image, ld+json
  fr  held       no publication signals
  es  held       no publication signals
  pt  held       no publication signals
  ru  held       no publication signals
  zh  held       no publication signals
  ar  held       no publication signals
  de  held       no publication signals

publication surface: PASS — 2 published locale(s) carry every signal on their
own origin; 7 held locale(s) carry none and appear in no sitemap and in no
hreflang set.
```

The gate was verified against the regression it exists to catch: restoring the
old condition makes it exit 1 and name every held locale and every signal.

A held locale becomes published by one change — flipping `ready` to `true` in
`src/_data/locales.js` once its translation is reviewed. The gate then requires
the full signal set for it, so a locale cannot be published half-way.

## 4 · Sitemaps

A sitemap may only list URLs on its own host, so there are two — and each host
advertises **only its own**.

| Host | `robots.txt` served | Advertises | Must never advertise |
|---|---|---|---|
| `zohar-ai.com` | `/robots.txt` | `https://zohar-ai.com/sitemap.xml` | `/sitemap-he.xml` |
| `www.zohar-ai.co.il` | `/robots-he.txt` *(rewritten from `/robots.txt`)* | `https://www.zohar-ai.co.il/sitemap-he.xml` | `/sitemap.xml` |

**This changed.** A single `robots.txt` previously advertised both sitemaps on
both hosts, which cross-submits each host's sitemap from the other. The build
now emits two files and the edge rewrite in §2 serves the Hebrew one on the
Hebrew host. Cross-submission is only accepted once **both hosts are verified in
Search Console**, and it is not how this is set up today.

| File | Host | Contents |
|---|---|---|
| `/sitemap.xml` | `zohar-ai.com` | International locales only |
| `/sitemap-he.xml` | `www.zohar-ai.co.il` | Hebrew only |

Each entry carries the full `xhtml:link` alternate set.

### Enforced on every build

`npm run check:hostmap` asserts all five properties against real build output
and the routing map together:

```
── sitemap host check ──
  zohar-ai.com         /robots.txt     advertises /sitemap.xml     1 URL(s), all 0-redirect 200
  www.zohar-ai.co.il   /robots-he.txt  advertises /sitemap-he.xml  1 URL(s), all 0-redirect 200
  ok  neither sitemap is advertised by the wrong host; no held locale appears in either
```

1. `robots.txt` on `zohar-ai.com` references only the international sitemap —
   and exactly one `Sitemap:` line, on that host.
2. `robots.txt` on `www.zohar-ai.co.il` references only the Hebrew sitemap. The
   routing map is checked too: `/robots.txt` on that host must resolve to
   `/robots-he.txt` in **0 redirects**.
3. Neither sitemap is advertised by the wrong host.
4. No held locale appears in either sitemap.
5. **Every URL inside each sitemap resolves to a 200 on its canonical host with
   zero redirects**, walked through the same rule chain as §2b. A sitemap that
   lists a redirecting URL is a sitemap that wastes crawl budget and contradicts
   its own canonical.

## 5 · Language handling — no geolocation

No automatic redirect on IP, geolocation, browser country or `Accept-Language`.
Forced redirects break shared URLs, mislead crawlers, fight hreflang and fail
under VPN and travel.

- `www.zohar-ai.co.il` opens Hebrew. `zohar-ai.com` opens English.
- A visible switcher on every page links to the **equivalent page** on the
  correct host, not to a homepage.
- An optional one-time, non-blocking suggestion banner may be offered later. It
  must never redirect by itself.
- A deliberate choice may be remembered locally, as a suggestion only.

## 6 · Preview safety

Three independent guards, all already in force:

1. `domains.*` is null unless the environment supplies it, so a preview host can
   never become a canonical — a preview URL is never a value in that file.
2. A page is `index,follow` only when the build is production **and** the locale
   is reviewed **and** its canonical origin is configured. Any one missing and
   it is `noindex,nofollow,noarchive,nosnippet`.
3. Non-production `robots.txt` is `Disallow: /`, and both sitemaps render empty.
4. A held locale emits no canonical, hreflang, `og:url`, `og:image` or schema at
   all (§3), so an unreviewed translation cannot present itself as publishable
   even on a correctly configured production host.

## 6b · Cutover matrix

| # | Item | State |
|---|---|---|
| 1 | Apex `zohar-ai.co.il` | **301 → `www.zohar-ai.co.il`** (verified externally) |
| 2 | `www.zohar-ai.co.il` | Serves legacy Hebrew site (verified) |
| 3 | Apex `zohar-ai.com` | **Unverified** — must be tested during cutover |
| 4 | `www.zohar-ai.com` | Serves legacy Hebrew site (verified) |
| 5 | Current DNS targets | **Unavailable** — this environment blocks DNS and outbound HTTP |
| 6 | Current TLS coverage | **Unavailable** — same reason |
| 7 | Current hosting provider / project / repo / commit | **Unavailable** — not the `marketing-site` Vercel project; that project has no custom domain attached |
| 8 | Selected `.co.il` canonical hostname | **`https://www.zohar-ai.co.il`** — decision closed, see §6c |
| 9 | Selected `.com` canonical hostname | **Apex `https://zohar-ai.com`**, per the approved architecture |
| 10 | Email records | Untouched and to be preserved; see §6d |

## 6c · apex vs www for `.co.il` — CLOSED

**Decision: `https://www.zohar-ai.co.il` is the Hebrew canonical origin.**
**Decision: `https://zohar-ai.com` is the international canonical origin.**

The four reasons on record:

1. **`www` is the incumbent on `.co.il`.** The apex already 301s to `www`
   today — the one externally verified fact about that domain. Choosing `www`
   changes no redirect direction and moves no accumulated signal.
2. **No apex ALIAS/ANAME dependency.** `www` takes an ordinary CNAME, which
   every registrar supports. Apex-at-Vercel needs A or ALIAS records that many
   Israeli registrars do not offer, and the apex's current TLS state could not
   be verified from here.
3. **The apex is clean on `.com`.** `zohar-ai.com` has no incumbent redirect to
   preserve, so the shorter international origin costs nothing.
4. **Asymmetry is not a defect.** The two hosts are independent canonical
   origins with independent DNS, independent TLS and independent sitemaps.
   Nothing in the architecture requires them to share a hostname shape.

This closes the question. The values drop into `ZOHAR_ORIGIN_HE` and
`ZOHAR_ORIGIN_INTL`; the build guard rejects any preview, local or non-HTTPS
value in either.

### Final host behaviour

Locale routing is matched on **both** hostname forms of each domain, ahead of
hostname normalisation, so no approved URL takes more than one redirect.

| # | Request | Redirects | Result |
|---|---|---|---|
| 1 | `www.zohar-ai.co.il/*` | **0** | serves Hebrew |
| 2 | `zohar-ai.com/*` | **0** | serves English at the root |
| 3 | `zohar-ai.com/{fr,es,pt,ru,zh,ar,de}/*` | **0** | serves that locale (once published) |
| 4 | `zohar-ai.co.il/*` | 1 | → `https://www.zohar-ai.co.il/*` |
| 5 | `www.zohar-ai.com/*` | 1 | → `https://zohar-ai.com/*` |
| 6 | `{zohar-ai.co.il, www.zohar-ai.co.il}/en/*` | 1 | → `https://zohar-ai.com/*` |
| 7 | `{zohar-ai.co.il, www.zohar-ai.co.il}/{fr…de}/*` | 1 | → `https://zohar-ai.com/{lang}/*` |
| 8 | `{zohar-ai.com, www.zohar-ai.com}/he/*` | 1 | → `https://www.zohar-ai.co.il/*` |
| 9 | `{zohar-ai.com, www.zohar-ai.com}/en/*` | 1 | → `https://zohar-ai.com/*` (fold the duplicate) |
| 10 | `{zohar-ai.co.il, www.zohar-ai.co.il}/he/*` | 1 | → `https://www.zohar-ai.co.il/*` (fold the duplicate) |

Rows 6 and 8 are the ones that used to take two hops. They are now direct:

```
zohar-ai.co.il/en/              →  https://zohar-ai.com/
zohar-ai.co.il/en/work?a=1      →  https://zohar-ai.com/work?a=1
www.zohar-ai.com/he/            →  https://www.zohar-ai.co.il/
www.zohar-ai.com/he/about?z=3   →  https://www.zohar-ai.co.il/about?z=3
```

Rows 9 and 10 close a duplicate that the earlier map left open: `/en/` is a real
built path and would otherwise have served English at a second, non-canonical
URL on `.com`.

Every redirect is a single **301** preserving path, query and trailing slash; a
fragment is re-attached by the browser, which never sends it to the server.
Encoded in `src/_data/hostMap.js`, proved in §2b.

**All four hostnames need valid TLS before any of this is switched on** —
`zohar-ai.co.il`, `www.zohar-ai.co.il`, `zohar-ai.com`, `www.zohar-ai.com`. A
301 from a host whose certificate is missing is a browser error, not a redirect.

## 6d · Email preservation — `zoharai.com`

`support@zoharai.com` is confirmed working and is the approved public address.
`zoharai.com` is **not** a website origin and is not part of this cutover.

**Do not touch, on any domain:** `MX` · `TXT` SPF · DKIM selector `TXT` ·
`_dmarc` `TXT` · any autodiscover/autoconfig record.

Before and after **every** DNS step, send a test message to
`support@zoharai.com` and confirm receipt. If a step requires a nameserver
change on `zoharai.com`, export the full zone first and re-create every mail
record at the new provider **before** the nameservers are switched — a
nameserver change moves the whole zone, and mail is the thing that breaks
silently.

The future `zoharai.com → zohar-ai.com` web redirect is **not authorised** and
is not part of this plan.

## 7 · Cutover sequence

Nothing below is authorised yet. Each step is reversible on its own.

0. **§6c is closed** — `www.zohar-ai.co.il` and `zohar-ai.com`. No step below
   waits on it. What still has to be read before touching DNS is the *current*
   zone: run step 2 and record what the records actually are today.
1. **Verify ownership** of all three domains at the registrar. Record the
   registrar, nameservers and expiry.
2. **Export the current DNS zone** for both active domains, in full, and store
   it. This is the rollback artefact.
3. **Inventory the current hosting** behind `zohar-ai.co.il` and
   `zohar-ai.com`: provider, project, deployment, repository, branch, commit.
   Record the existing rollback path *before* changing anything.
4. **Preserve email.** Do not touch `MX`, `SPF` (TXT), `DKIM` (selector TXT) or
   `DMARC` (`_dmarc` TXT) on any domain. `support@zoharai.com` must keep
   receiving mail throughout; test send and receive before and after every step.
5. **Attach the domains to the Vercel project** without changing DNS yet. Vercel
   issues the verification records; add only those.
6. **Add the host rewrites and redirects** from §2 to `vercel.json`. Deploy to
   preview and confirm the rewrite fires for each host.
7. **Set the origins**: `ZOHAR_ORIGIN_HE`, `ZOHAR_ORIGIN_INTL`. Confirm on a
   preview build that canonical, hreflang and both sitemaps are correct.
8. **Lower TTL** on the A/CNAME records to 300s and wait one full old TTL.
9. **Point DNS** at Vercel — apex and `www` only, using the exact A / ALIAS /
   CNAME values **Vercel displays in the project's Domains tab**. Do not copy an
   IP or hostname from documentation, a blog or memory; those values change.
   Nothing else in the zone is edited.
10. **Verify TLS** is issued for all four hostnames — `zohar-ai.co.il`,
    `www.zohar-ai.co.il`, `zohar-ai.com`, `www.zohar-ai.com` — before
    announcing. Then confirm the direction tests:
    Then walk the **ten rows** of the §6c table against the live hosts with
    `curl -sIL -o /dev/null -w '%{num_redirects} %{url_effective}\n'`, and
    confirm each one reports the redirect **count** and final URL the table
    states — including that `www.zohar-ai.co.il/` and `zohar-ai.com/` are
    **0 redirects**, that `zohar-ai.com/` serves **English**, not Hebrew, and
    that **no row reports more than 1**. Confirm path, query and trailing slash
    survive on every redirecting row.

    Also fetch `https://zohar-ai.com/robots.txt` and
    `https://www.zohar-ai.co.il/robots.txt` and confirm each returns exactly one
    `Sitemap:` line, on its own host (§4).

    §2b proves the map is self-consistent; this step is the only thing that
    proves the live edge matches it.
11. **Verify both hosts** in Search Console, submit both sitemaps, and confirm
    hreflang is reported without errors.
12. **Restore TTL** once traffic is stable.

`zoharai.com` stays out of the cutover. Before any future redirect: verify
registrar ownership, remove the GoDaddy for-sale listing, inspect every DNS
record, and confirm the mail records survive.

## 8 · Rollback sequence — CORRECTED

### Correction to an earlier statement in this file

An earlier version of this section listed the Vercel deployment
`dpl_2mw25nzJyRUUtksbD6Kgj1rfnmiQ` (commit `e2bad8b`) as a rollback path for
the current website. **That was wrong, and it is withdrawn.**

That deployment belongs to the `marketing-site` Vercel project. It can restore
only **a previous deployment of this marketing site**. It is **not** recovery of
the legacy website currently served on `zohar-ai.co.il` and `zohar-ai.com` —
that site is hosted elsewhere, by a provider this project has no connection to
and which could not be identified from this environment (§6b, row 7).

| Artefact | What it can actually restore |
|---|---|
| `dpl_2mw25nzJyRUUtksbD6Kgj1rfnmiQ` | A previous deployment of the **new marketing site**, within the `marketing-site` Vercel project. Nothing else. |
| The exported DNS zone (§7 step 2) | The **legacy website**, by pointing the domains back at their current host. **This is the only artefact that restores the live site.** |

**Treat the Vercel rollback deployment only as rollback between versions of the
new marketing site. Do not describe it as recovery of the externally hosted
legacy website.**

### Consequence for the cutover

The DNS export in §7 step 2 and the hosting inventory in §7 step 3 are not
paperwork. **They are the entire rollback capability.** If the cutover begins
without an exact, complete, verified copy of the current zone, there is no way
back to the legacy site. Neither step may be skipped or deferred.

### Corrected rollback steps

1. **Stop.** Make no further DNS or domain change the moment failure is
   suspected. A partial second change makes the original records harder to
   reconstruct.
2. **Restore DNS first.** Re-create the **exact previous DNS records** from the
   zone exported in §7 step 2 — same names, same types, same values, same
   TTLs. This is the first action, before anything is touched in Vercel.
3. **Wait one TTL** and confirm resolution has moved back, from more than one
   resolver. §7 step 8 lowers the TTL to 300s precisely so this window is short.
4. **Confirm the legacy site answers again** on `www.zohar-ai.co.il` and
   `www.zohar-ai.com`, over HTTPS, with a valid certificate — the legacy host
   issues that certificate, not Vercel.
5. **Only then detach the custom domains** from the new Vercel project. Detaching
   before DNS has been restored and verified leaves the domains pointing at a
   project that no longer claims them, which is a harder outage than the one
   being rolled back.
6. **Unset the origins** — `ZOHAR_ORIGIN_HE` and `ZOHAR_ORIGIN_INTL`. The build
   immediately stops emitting canonical, hreflang, schema and sitemap entries,
   so a half-rolled-back state cannot publish a wrong canonical.
7. **Remove the host rules** (§2) from `vercel.json` and redeploy the branch, so
   no redirect to a production hostname survives in the project.
8. **Re-test email.** Send to and receive from `support@zoharai.com` and confirm
   `MX`, SPF, DKIM and `_dmarc` are byte-identical to the export. Mail is the
   thing that breaks silently.
9. **Roll back the deployment only if the failure is in the marketing site
   itself.** `dpl_2mw25nzJyRUUtksbD6Kgj1rfnmiQ` moves the `marketing-site`
   project back to its previous deployment. It has no effect on what the domains
   serve once DNS points at the legacy host, and it is irrelevant to a DNS-level
   failure.
10. **`main` is untouched** throughout the rebuild, so no revert is needed at the
    repository level. Record what failed, at which §7 step, before re-attempting.

**Rollback is DNS-first and takes one TTL.** That is why §7 step 8 lowers the
TTL before the cutover and step 12 raises it only after traffic is stable.

### Email safety, restated

No rollback step edits `MX`, SPF `TXT`, a DKIM selector `TXT`, `_dmarc` `TXT`,
or any autodiscover record on any domain — least of all `zoharai.com`, which is
mail-only and is not part of this cutover in either direction.
