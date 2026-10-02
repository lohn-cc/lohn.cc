# www.lohn.cc

Personal site of Lohn — built with [Hugo](https://gohugo.io), deployed automatically.

## Edit
| What | Where |
|---|---|
| About text, headline | `content/_index.md` |
| Expertise cards | `data/expertise.yaml` |
| Experience timeline (add `years:` to show dates) | `data/experience.yaml` |
| Projects | `data/projects.yaml` |
| Notes / articles | `content/notes/<slug>.md` |
| Privacy policy | `content/privacy.md` |
| Styles | `static/styles.css` |

New article:
```bash
hugo new content notes/my-first-note.md
```
Affiliate link inside an article (adds `rel="sponsored"` and a disclosure automatically):
```markdown
{{< aff href="https://partner.example/?ref=lohn" >}}Product name{{< /aff >}}
```

## Preview locally
```bash
hugo server
```

## Publish
Push to `main` — GitHub Actions builds the site and deploys it to the server in about 30 seconds.
The workflow needs one repository secret: `DEPLOY_SSH_KEY`.

## Ads (later)
Set `params.adsense.enabled = true` and `client` in `hugo.toml`, add `ad_slot_top` / `ad_slot_bottom`
to an article's front matter, and relax the Content-Security-Policy for www.lohn.cc in Caddy.

The contact form posts to `/api/contact`, served by the contact-form service on the server.
