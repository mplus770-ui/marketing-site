# ZOHAR — two-domain architecture, cutover and rollback

Status: **prepared in code, not activated.** No DNS record, nameserver, MX,
SPF, DKIM, DMARC, domain assignment, production alias or deployment has been
touched. `domains.he` and `domains.international` are `null`, so the build emits
no canonical, no hreflang, no schema and no sitemap entries at all.

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

The build writes Hebrew to `/` and English to `/en/`. At cutover the edge
rewrites the international host so English answers at its root:

```jsonc
// vercel.json — NOT YET ADDED. Paste at cutover, after the domains are attached.
"rewrites": [
  { "source": "/",      "has": [{ "type": "host", "value": "zohar-ai.com" }], "destination": "/en/" },
  { "source": "/en/:p*", "has": [{ "type": "host", "value": "zohar-ai.com" }], "destination": "/en/:p*" }
],
"redirects": [
  { "source": "/:p*", "has": [{ "type": "host", "value": "www.zohar-ai.com"   }], "destination": "https://zohar-ai.com/:p*",   "permanent": true },
  { "source": "/:p*", "has": [{ "type": "host", "value": "www.zohar-ai.co.il" }], "destination": "https://zohar-ai.co.il/:p*", "permanent": true },
  // Hebrew requested on the international host, or a locale requested on the
  // Hebrew host, goes to its canonical home rather than duplicating.
  { "source": "/:lang(fr|es|pt|ru|zh|ar|de|en)/:p*", "has": [{ "type": "host", "value": "zohar-ai.co.il" }], "destination": "https://zohar-ai.com/:lang/:p*", "permanent": true }
]
```

Paths and query strings are preserved by the `:p*` capture.

`zoharai.com → zohar-ai.com` is **not authorised** and is not listed above.

## 3 · Cross-domain canonical and hreflang map

Every published page carries a self-referencing canonical on its own host, plus
the full symmetric alternate set. Unpublished locales appear in neither.

| Locale | hreflang | Canonical URL | Build path |
|---|---|---|---|
| Hebrew | `he-IL` | `https://zohar-ai.co.il/` | `/` |
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
HE  canonical https://zohar-ai.co.il/   alternates he-IL, en, x-default
EN  canonical https://zohar-ai.com/     alternates he-IL, en, x-default
FR  noindex, no canonical, absent from both sitemaps and from hreflang
```

## 4 · Sitemaps

A sitemap may only list URLs on its own host, so there are two:

| File | Host | Contents |
|---|---|---|
| `/sitemap.xml` | `zohar-ai.com` | International locales only |
| `/sitemap-he.xml` | `zohar-ai.co.il` | Hebrew only |

Each entry carries the full `xhtml:link` alternate set. `robots.txt` lists both
absolute sitemap URLs. **Both hosts must be verified in Search Console** before
cross-submission is accepted. Contamination is checked on every build: 0 `.co.il`
URLs in the international sitemap, 0 `.com` URLs in the Hebrew one, 0 pending
locales in either.

## 5 · Language handling — no geolocation

No automatic redirect on IP, geolocation, browser country or `Accept-Language`.
Forced redirects break shared URLs, mislead crawlers, fight hreflang and fail
under VPN and travel.

- `zohar-ai.co.il` opens Hebrew. `zohar-ai.com` opens English.
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
| 8 | Selected `.co.il` canonical hostname | **NOT CHOSEN** — see §6c. Requires the DNS and TLS state first. |
| 9 | Selected `.com` canonical hostname | **Apex `https://zohar-ai.com`**, per the approved architecture |
| 10 | Email records | Untouched and to be preserved; see §6d |

## 6c · apex vs www for `.co.il` — decision deferred, deliberately

You asked not to choose without the DNS and SSL state, and that state is still
unavailable from here. So this is the decision rule, not the decision.

**The live apex already 301s to `www`.** That is the only hard fact available,
and it points at `www` as the incumbent. Choosing `www` means no redirect
direction changes and no accumulated signal moves.

| Choice | DNS change needed | Argument |
|---|---|---|
| **`www.zohar-ai.co.il`** *(incumbent)* | `www` → CNAME to the value Vercel displays. Apex keeps redirecting to `www`. | Preserves the existing redirect direction and whatever link equity sits on `www`. CNAME at `www` is universally supported. |
| **`zohar-ai.co.il`** *(apex)* | Apex → A or ALIAS to the value Vercel displays; `www` → 301 to apex, reversing the current direction. | Shorter, cleaner. But it inverts a live redirect and depends on the DNS provider supporting ALIAS/ANAME at the apex — many Israeli registrars do not. |

**Decide with these three answers:**
1. `dig +short A zohar-ai.co.il` and `dig +short CNAME www.zohar-ai.co.il` — what do they point at now?
2. Does the registrar support ALIAS/ANAME (or flattened CNAME) at the apex?
3. `curl -sI https://zohar-ai.co.il` and `https://www.zohar-ai.co.il` — is TLS valid on **both**, or only `www`?

If apex TLS is absent or the registrar has no ALIAS support, **`www` is the
answer** and the question is closed. If both are clean, apex is the better
long-term choice and is worth the one-time redirect inversion.

Either value drops straight into `ZOHAR_ORIGIN_HE`; the resolver does not care
which, and the build guard accepts both.

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

0. **Answer §6c** and fix the `.co.il` canonical hostname. Nothing below can
   start until that is decided, because it determines the DNS change itself.
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
    - Hebrew URL on `.com` → 301 to the `.co.il` equivalent
    - English URL on `.co.il` → 301 to the `.com` equivalent
    - `www` → selected canonical, path and query preserved
    - `.com` root serves **English**, not Hebrew
11. **Verify both hosts** in Search Console, submit both sitemaps, and confirm
    hreflang is reported without errors.
12. **Restore TTL** once traffic is stable.

`zoharai.com` stays out of the cutover. Before any future redirect: verify
registrar ownership, remove the GoDaddy for-sale listing, inspect every DNS
record, and confirm the mail records survive.

## 8 · Rollback sequence

1. **DNS**: restore the exported zone from step 2. This is the primary rollback
   and reverses everything at the edge within one TTL.
2. **Vercel**: detach the domains from the project. The old host resumes serving
   as soon as DNS points back.
3. **Deployment**: roll back to the previous production deployment. The previous
   `marketing-site` production deployment `dpl_2mw25nzJyRUUtksbD6Kgj1rfnmiQ`
   (commit `e2bad8b`) remains a one-click rollback candidate.
4. **Repository**: `main` is unchanged throughout the entire rebuild, so a
   revert is never needed to restore the previous site.
5. **Origins**: unset `ZOHAR_ORIGIN_HE` and `ZOHAR_ORIGIN_INTL`. The build
   immediately stops emitting canonical, hreflang, schema and sitemaps, so a
   half-rolled-back state cannot publish a wrong canonical.
6. **Email**: untouched throughout, so nothing to roll back — but re-test
   `support@zoharai.com` after any DNS restore.

Rollback is DNS-first and takes one TTL. That is why step 8 lowers the TTL
before the cutover and step 12 raises it only after traffic is stable.
