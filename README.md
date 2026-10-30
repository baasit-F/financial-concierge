# Benjamin — Financial Concierge & Coach

Static website (HTML/CSS/JS, no build step). Primary focus: **life insurance** and **group health benefits**, with a quote request form that emails leads to `Bpryb718@outlook.com`.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole site (hero + quote form, life insurance, group benefits, about, MDRT resources, FAQ) |
| `styles.css` | Styling |
| `script.js` | Phone number setting, mobile menu, quote form submission |
| `thank-you.html` | Page shown after a quote request is sent |
| `assets/img/` | Put the headshot here as `headshot.jpg` |
| `assets/mdrt/` | Put the official MDRT logos here |

## How the quote form works

Submissions go through [FormSubmit](https://formsubmit.co) (free, no server needed) and arrive at **Bpryb718@outlook.com** as a table with name, email, phone, interest, best time and message.

**One-time activation:** the first time someone submits the form on the live site, FormSubmit sends a confirmation email to Bpryb718@outlook.com. Click **Activate** in that email — leads won't be delivered until you do. Check the junk folder.

Optional: after activating, FormSubmit gives you a random alias (e.g. `https://formsubmit.co/abc123...`). Swap it into `script.js` (`leadEmail`) and the `action` in `index.html` so the real email address isn't visible in the page source.

## Still to do before launch

- [ ] **Phone number** — when the dedicated advertising number is ready, set `phone` at the top of `script.js` (e.g. `"7185551234"`). It updates every phone link on the site.
- [ ] **Headshot** — clean it up with an AI tool (background removal, lighting, blemishes) and save as `assets/img/headshot.jpg` (portrait, ~800×1000px). Until then a placeholder shows.
- [ ] **MDRT logos** — download the official Life Member and Qualifying Member logos from the MDRT member portal (mdrt.org → Membership → Logos/Brand resources) and save as:
  - `assets/mdrt/mdrt-life-member.png`
  - `assets/mdrt/mdrt-qualifying-member.png`

  Follow MDRT's logo usage guidelines (correct year, no alterations).
- [ ] **Full name / license info** — the site currently says "Benjamin". Add last name and state license numbers if desired.
- [ ] **Compliance review** — replace the bracketed placeholders in the footer disclosures (agency, broker-dealer, states licensed) and have compliance approve the site, especially the "financial concierge & coach" section that mentions retirement planning.

## Hosting (GitHub Pages)

Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / root → Save. The site will be live at `https://baasit-f.github.io/financial-concierge/`. A custom domain can be added on the same screen.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
