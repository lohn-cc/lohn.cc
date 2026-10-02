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

Only state facts that are already in this repo or that the owner gives you. **Never invent** dates, years,
numbers, metrics, achievements, client names, certifications, degrees, testimonials or quotes.
If a section needs a fact you don't have, leave a clearly marked TODO in the content and ask the owner.

Known career history (most recent first, order still to be confirmed by the owner):

| Organisation | Role | What is known |
|---|---|---|
| A children's hospital (name not yet given) | IT Manager & Biomedical Engineer | Hospital IT + biomedical equipment |
| Everlao (Everbright Headwear, China — spelling to confirm) | IT Supervisor | IT facilities across 3 factory locations; co-implemented production process tracking |
| Avani+ Luang Prabang, Pullman Luang Prabang, Avani+ Lanexang Vientiane | IT Manager | Hotel IT, multiple properties, two cities |
| Institut Pasteur du Laos | IT Manager & Facility Manager | IT and facilities for a research institute |
| Lao Tobacco | IT Executive | Company IT |
| Eyetech Security Systems | Product Engineer | Knowledge transfer from Robert Bosch Thailand to Laos |

Open questions to ask the owner before filling in: full display name, years for each role, the children's
hospital's name, exact city, education, certifications, languages, technologies, photo, LinkedIn/GitHub links,
whether a Lao-language version is wanted.

Do not use other organisations' logos or brand assets. Mention employers by name in text only.

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
- Plain CSS in `static/styles.css` with CSS custom properties; light + dark mode via `prefers-color-scheme`.
- System font stacks only — **no web fonts, no Google Fonts, no external CDNs**.

### Content Security Policy (enforced by the server — you cannot change it from this repo)

```
default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self';
object-src 'none'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'; upgrade-insecure-requests
```

This means:
- **No inline `<script>`** blocks or `onclick=` handlers. All JS goes in files under `static/js/`.
- **No inline `style="…"` attributes** and no `<style>` blocks. All CSS goes in `static/styles.css`.
- **No external resources** (scripts, styles, fonts, images, iframes, embeds, analytics, YouTube, Google Maps…).
  Images must be committed to the repo (`static/images/` or page bundles) — prefer WebP/AVIF, always set width/height and `alt`.
- If a feature genuinely needs an external resource, **stop and tell the owner** — the CSP must be changed on the server first.

## 4. Structure — where things live

| What | File |
|---|---|
| Site config, params, AdSense switch | `hugo.toml` |
| Home headline, lede, About text | `content/_index.md` |
| Expertise cards | `data/expertise.yaml` |
| Experience timeline (`years:` optional) | `data/experience.yaml` |
| Projects | `data/projects.yaml` |
| Notes section intro + "upcoming" topics | `content/notes/_index.md` |
| Articles | `content/notes/<slug>.md` → `/notes/<slug>/` |
| Privacy policy | `content/privacy.md` |
| Form result pages | `content/contact/thanks.md`, `content/contact/error.md` |
| Page frame / head / header / footer | `layouts/baseof.html`, `layouts/_partials/*.html` |
| Styles | `static/styles.css` |

Design tokens (in `static/styles.css`): background `#f7f5f0` / dark `#14161a`, ink `#1d1f23`, accent teal `#0f766e`
(dark `#5eead4`), serif headings (`--serif`), system sans body (`--sans`), radius 14px. Keep the warm, editorial feel.

## 5. Writing Notes (articles)

Front matter:
```yaml
---
title: "Running your own email: DNS, SPF, DKIM and DMARC explained"
description: "One or two sentences for search results and the notes list."
date: 2026-10-15
draft: false
# ad_slot_top: "1234567890"     # only once AdSense is approved and enabled
# ad_slot_bottom: "1234567890"
---
```
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

### Google AdSense (not active yet)
- Ads are allowed **only on Notes articles** — never on the home page, privacy, contact or thanks pages.
- It's switched off in `hugo.toml` (`params.adsense.enabled = false`). Enabling it requires, in this order:
  (1) AdSense approval, (2) a Google-certified consent banner (CMP) for EEA/UK/CH visitors, (3) updating
  `content/privacy.md`, (4) an `ads.txt` in `static/`, (5) the owner relaxing the CSP on the server.
  Do not enable it on your own.

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
