# AGENTS.md — www.lohn.cc

Instructions for AI coding agents (Antigravity, Claude, Copilot, etc.) working on this repository.
Read this whole file before making changes.

## 1. What this site is

**www.lohn.cc** is the personal site of **Lohn** — an IT Manager, Systems Engineer and Biomedical Engineer based in Laos.
Purpose: portfolio / bio, a record of experience and projects, and **Notes** — practical articles sharing knowledge
from the field. It links to Lohn's one-person company, **Vangera Systems** (https://www.vangera.systems/).

Audience: potential clients and employers, IT peers, and readers searching for practical IT know-how.
Tone: first person ("I"), clear, practical, modest and factual. No hype, no buzzword soup.

## 2. Facts — do not invent anything

The **data files are the single source of truth** for the owner's career: `data/experience.yaml`,
`data/credentials.yaml`, `data/projects.yaml`, `data/expertise.yaml` and `content/_index.md`.
Only state facts that are in these files or that the owner gives you. **Never invent** dates, numbers, metrics,
achievements, client names, certifications, testimonials or quotes. If something is missing, add a clearly marked
TODO and ask the owner.

- **Never hard-code career numbers** (years, organisation count, sector years). They are computed from
  `data/experience.yaml` by `layouts/_partials/career.html`, so they stay correct when the CV changes.
- Only **Avani+ Lanexang Vientiane** was a hotel **pre-opening**; Pullman Luang Prabang and Avani+ Luang Prabang were
  operations roles. Don't describe them as pre-openings.
- **Privacy:** do not publish the owner's phone number or personal Gmail. Public contact = contact form,
  `lohn@lohn.cc`, LinkedIn.
- Sector tags (`tag:` in experience.yaml) use exactly these 7 values: Hospitality & F&B, Healthcare & Biomedical,
  Research & Facilities, Manufacturing & Industry, Enterprise, Public & NGO, Security & Technology Services,
  Independent Consulting.
- Period format must stay `Mon YYYY – Mon YYYY` or `Mon YYYY – Present` (the career partial parses it).
  Order bullets by importance — the first `params.highlights` (3) are shown, the rest sit behind "Show all".
- Do not use other organisations' logos or brand assets. Mention employers by name in text only.

## 3. Tech stack and constraints

- **Hugo `0.167.0`** (pinned in `.github/workflows/deploy.yml` → `HUGO_VERSION`). Plain Hugo — no theme, no Node,
  no npm, no Tailwind, no Sass, no bundler. Keep it that way unless the owner explicitly asks.
- Uses Hugo's **new template system** (v0.146+):
  `layouts/baseof.html`, `layouts/home.html`, `layouts/page.html`, `layouts/section.html`,
  `layouts/notes/page.html`, `layouts/404.html`, `layouts/_partials/`, `layouts/_shortcodes/`, `layouts/robots.txt`.
  Do **not** create `layouts/_default/` or `layouts/partials/` (old layout).
- Use current APIs: `hugo.Data` (not `.Site.Data`), `site.Language.Locale`, `locale` in config (not `languageCode`).
- CI builds with `hugo --gc --minify --panicOnWarning` — **any Hugo warning fails the deploy**. Always build locally
  with the same flags before committing.
- Plain CSS in `assets/styles.css`, built by Hugo as `styles.min.<hash>.css` (fingerprinted + SRI) so browsers never
  use a stale copy — never link a fixed `/styles.css` URL. Light + dark mode via `prefers-color-scheme`.
- System font stacks only — **no web fonts, no Google Fonts, no external CDNs**.

### Design system (UI refinement, Oct 2026)

- **Colours only via tokens** in `assets/styles.css` (`--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-soft`…).
  Never hard-code colours in components and never add new `@media (prefers-color-scheme: dark)` rules —
  dark mode is the two token blocks at the top (automatic **and** `:root[data-theme="dark"]` for the manual toggle).
  Every text colour pair must meet WCAG AA (4.5:1 for normal text); dark-mode text is deliberately softened (~12–14:1).
- **Typography:** all sans-serif (`--display` = `--sans`); body 18px; no text smaller than 13px (13px only for short uppercase labels).
- **Icons:** use `{{ partial "icon.html" "name" }}` (inline SVG, `currentColor`). No emoji as icons.
  Available: pin, mail, linkedin, arrow-right, external, sun, moon, menu, close, code, server, network, health, compass, check.
- **JavaScript:** only `assets/js/site.js` (theme toggle + mobile menu), loaded fingerprinted in `<head>`. The site must still
  work without it (links wrap on small screens, theme follows the device).
- **Hierarchy:** at most one primary and one secondary button per section; tap targets ≥ 44px.

### Content Security Policy (enforced by the server — you cannot change it from this repo)

```
default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self';
object-src 'none'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'; upgrade-insecure-requests
```

This means:
- **No inline `<script>`** blocks or `onclick=` handlers. All JS goes in files under `static/js/`.
- **No inline `style="…"` attributes** and no `<style>` blocks. All CSS goes in `assets/styles.css`.
- **No external resources** (scripts, styles, fonts, images, iframes, embeds, analytics, YouTube, Google Maps…).
  Images must be committed to the repo (`static/images/` or page bundles) — prefer WebP/AVIF, always set width/height and `alt`.
- If a feature genuinely needs an external resource, **stop and tell the owner** — the CSP must be changed on the server first.

## 4. Structure — where things live

| What | File |
|---|---|
| Site config, params, AdSense switch | `hugo.toml` |
| Home headline, lede, About text | `content/_index.md` |
| Competencies | `data/expertise.yaml` |
| Experience timeline (positions + early_career) | `data/experience.yaml` |
| Education, certifications, training, licenses | `data/credentials.yaml` |
| Projects | `data/projects.yaml` |
| Computed career figures (years, sectors, organisations) | `layouts/_partials/career.html` |
| One timeline entry (highlights + "Show all") | `layouts/_partials/position.html` |
| Search-engine data: Person, profile page, website (home only) | `layouts/_partials/jsonld-person.html` |
| Search-engine data: BlogPosting + breadcrumbs (Notes articles) | `layouts/_partials/jsonld-article.html` |
| Social-preview image (opt-in per page) | `layouts/_partials/page-image.html` |
| Title, description, canonical, Open Graph tags | `layouts/_partials/head.html` |
| robots.txt (sitemap is Hugo's built-in `/sitemap.xml`) | `layouts/robots.txt` |
| AdSense seller declaration | `static/ads.txt` |
| Machine-readable profile for vangera.systems | `layouts/home.profile.json` → `/profile.json` |
| Notes section intro + "upcoming" topics | `content/notes/_index.md` |
| Articles | `content/notes/<slug>.md` → `/notes/<slug>/` |
| Privacy policy | `content/privacy.md` |
| Form result pages | `content/contact/thanks.md`, `content/contact/error.md` |
| Page frame / head / header / footer | `layouts/baseof.html`, `layouts/_partials/*.html` |
| Styles | `assets/styles.css` |

Design tokens (in `assets/styles.css`): background `#f7f5f0` / dark `#14161a`, ink `#1d1f23`, accent teal `#0f766e`
(dark `#5eead4`), serif headings (`--serif`), system sans body (`--sans`), radius 14px. Keep the warm, editorial feel.

## 5. Writing Notes (articles)

Front matter:
```yaml
---
title: "Running your own email: DNS, SPF, DKIM and DMARC explained"
description: "One or two sentences for search results and the notes list."
date: 2026-10-15
draft: false
# seo_title: "Shorter title"    # optional: the <title> if the real one is too long (≤60 chars with the suffix)
# lastmod: 2026-11-02           # set when you update an article substantially (sitemap + dateModified)
# image: "cover.jpg"            # optional social-preview image from the page bundle (see below)
# image_alt: "What it shows"
# keywords: ["DNS", "email"]
# robots: "noindex"             # only for pages that must stay out of search results
# ad_slot_top: "1234567890"     # only once AdSense is approved and enabled
# ad_slot_bottom: "1234567890"
---
```
- **Social-preview image is opt-in:** only the file named in `image:` is used (cropped to 1200×630 JPEG). Never pick
  a screenshot that shows personal data (customer names, plate numbers, phone numbers…).
- Write from real experience; practical, step-by-step, with code blocks where useful.
- Use `##` / `###` headings (the page title is the only `h1`).
- Never publish anything the owner hasn't reviewed — create articles with `draft: true` unless told otherwise.

### Affiliate links
Always use the shortcode — it adds `rel="sponsored nofollow noopener"`, a `*` marker, and an automatic disclosure
at the top of the article:
```markdown
{{< aff href="https://partner.example/?ref=lohn" >}}Product name{{< /aff >}}
```
Never add raw affiliate links. Only recommend products honestly and in context.

### Google AdSense — Auto ads on Notes articles (prepared, not active yet)
- The owner chose **Auto ads on Notes articles only** — never on the home page (CV), privacy, contact or thanks
  pages. The ad script is added only to Notes article pages (`layouts/_partials/head.html`); Google places the ads.
  Manual units (`ad_slot_top` / `ad_slot_bottom`) are optional.
- Done: `static/ads.txt`, the `google-adsense-account` verification `<meta>`, and the Advertising section of
  `content/privacy.md`. Google's consent message for EEA/UK/CH visitors is set up in AdSense
  (Privacy & messaging), not in this repo.
- **CSP:** Google supports only a nonce-based CSP for AdSense. While `params.adsense.enabled = true`, every
  `<script>` in the Notes section carries `nonce="[[% placeholder `http.request.uuid` %]]"` (partial
  `script-nonce.html`). The server runs Notes pages through Caddy `templates` (delimiters `[[% %]]`) and sends
  `script-src 'nonce-{http.request.uuid}' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http:` there; all other
  pages keep the strict `'self'` CSP. Any new script on Notes pages must use the partial, or it will be blocked.
- Switching on (owner only): AdSense approval → consent message published in AdSense → server CSP change →
  `params.adsense.enabled = true`. Do not enable it on your own: without the server change the ad script is blocked.

## 5a. SEO — keep these true

**Structured data (JSON-LD).** Built only from the data files and `hugo.toml`; JSON-LD is a data block, so the CSP
allows it. Home: one `@graph` with `ProfilePage` → `Person` (`#person`) → `WebSite`, plus Vangera Systems as an
`Organization`. The Person has `knowsAbout` (data/expertise.yaml), `sameAs` (LinkedIn + `params.profiles` — only
profiles that *are* the owner; employer and company sites go in `worksFor`), `alumniOf` and `hasCredential`
(data/credentials.yaml; competitions are not credentials; `issuer_type: person` when the issuer is an individual).
Notes articles: `BlogPosting` whose author and publisher are the same `#person`, plus a `BreadcrumbList`.
Check changes with Google's Rich Results Test and validator.schema.org.

**Checklist for every page or article**
- [ ] `<title>` ≤ ~60 characters including " — Lohn Xongmixay" (use `seo_title` if the real title is longer);
  unique per page; the main words first.
- [ ] `description` 120–160 characters: what the reader gets, in plain words (longer ones are cut in results).
- [ ] Exactly one `h1` (the page title), then `h2` for sections and `h3` inside them — never skip a level for
  looks (style with CSS instead). Notes list titles are `h2`.
- [ ] Social preview: `og:title`, `og:description`, `og:url`, `og:type` (article for Notes) are automatic; add
  `image` + `image_alt` to an article when there's a suitable picture (else the card has no image).
- [ ] Canonical URL is automatic; don't publish the same text under two URLs (use `aliases` when moving a page).
- [ ] Pages that shouldn't be found: `robots: "noindex"` (not a robots.txt `Disallow`, which hides the noindex).
- [ ] Images: descriptive `alt`, width and height, WebP; descriptive file names.
- [ ] Link to related Notes and to the home page sections with meaningful link text (not "click here").
- [ ] After a substantial update, set `lastmod` so the sitemap and `dateModified` tell search engines.
- [ ] The sitemap needs no settings: Hugo writes `/sitemap.xml` with `lastmod` (Google ignores
  `changefreq`/`priority`); drafts and pages with `sitemap: { disable: true }` stay out.

## 5b. profile.json — consumed by www.vangera.systems

`https://www.lohn.cc/profile.json` (template `layouts/home.profile.json`) is fetched by the vangera.systems build to
render its "Founder's track record". Treat it as a public API, **schema version 1**: you may add keys, but do not
rename or remove existing keys (`person`, `summary`, `sectors`, `positions`, `projects`, `education`, `training`,
`certifications`) without updating vangera.systems at the same time. Never put the phone number or private email in it.

## 6. Contact form — do not break this contract

The form is in `layouts/_partials/contact-form.html` and is handled by a backend service on the server
(not in this repo). The backend expects exactly:

- `GET /api/challenge` → ALTCHA challenge (fetched by the widget)
- `POST /api/contact` (form-encoded) with fields **`name`** (≤100 chars), **`email`**, **`message`** (10–5000 chars),
  **`website`** (honeypot — must stay hidden and empty), **`altcha`** (set by the widget)
- Responds `303` → `/contact/thanks/` or `/contact/error/` (those pages must keep existing)

The ALTCHA widget files are self-hosted in `static/assets/altcha/` (CSP-safe "external" build + PBKDF2 worker) and
loaded by `static/js/contact.js`. You may restyle the form, but keep the field names, the action URL, the honeypot,
and the `<altcha-widget challenge="/api/challenge">` element. Don't swap ALTCHA for reCAPTCHA/Turnstile.

## 7. Deployment

- `main` is production. **Every push to `main` deploys to the live site within ~30 seconds** via
  `.github/workflows/deploy.yml` (Hugo build → rsync over SSH to the server).
- Do not modify the deploy workflow, the `DEPLOY_SSH_KEY` secret, the pinned host key, or the action SHA pins
  unless the owner asks. To upgrade Hugo, change `HUGO_VERSION` only and test locally first.
- Prefer working on a branch and opening a pull request, so the owner can review before it goes live.
- Never commit secrets, API keys, or private data.

## 8. Before every commit — checklist

```bash
hugo --gc --minify --panicOnWarning     # must finish with no warnings
hugo server                              # check pages in a browser, light + dark mode, mobile width (~375px)
```
- [ ] No inline scripts/styles, no external URLs loaded by the page (links are fine)
- [ ] Every image has `alt`, width and height; headings in order; one `h1` per page
- [ ] Layout works at 375px wide with no horizontal scroll
- [ ] Contact form fields/action unchanged; `/contact/thanks/` and `/contact/error/` still build
- [ ] No invented facts; new articles are `draft: true` unless approved
- [ ] `public/` is not committed (it's in `.gitignore`)

## 9. Out of scope (server-side — ask the owner)

Web server (Caddy) config and CSP, TLS, DNS, the contact-form backend, email, and the server itself are managed
separately. If a change needs any of these, describe what's needed and stop.
