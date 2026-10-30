# Ben — Financial Concierge & Coach

Ben's personal website. The style is inspired by lifehappens.org (textured paper, colorful swirls, mint highlighter headlines, black pill buttons), with more sales features: a two-step quote form, a coverage calculator that feeds into the quote, urgency messaging, CTAs throughout and a sticky Call / Quote bar on phones.

Static website (HTML/CSS/JS, no build step). Primary focus: **life insurance** and **group health benefits**, with a quote request form that emails leads to `Bpryb718@outlook.com`.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole site (hero + quote form, life insurance, group benefits, about, MDRT resources, FAQ) |
| `styles.css` | Styling |
| `script.js` | Phone number setting, mobile menu, quote form submission |
| `thank-you.html` | Page shown after a quote request is sent |
| `assets/img/` | Headshot and optional photos (see below) |
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
- [ ] **Optional photos** — the product and story cards show colored panels until photos are added. Drop licensed photos into `assets/img/` with these names: `product-life.jpg`, `product-group.jpg`, `product-ltc.jpg`, `product-business.jpg`, `story-family.jpg`, `story-business.jpg`, `story-retire.jpg` (landscape, ~1200px wide). Illustrations in the Life Happens style also work.
- [ ] **Testimonials** — the "Real-life moments" cards are illustrative examples, not clients. Swap in real client reviews (with permission and compliance approval) for even more sales punch.
- [ ] **Full name / license info** — the site currently says "Ben". Add last name and state license numbers if desired.
- [ ] **Compliance review** — replace the bracketed placeholders in the footer disclosures (agency, broker-dealer, states licensed) and have compliance approve the site, especially the "financial concierge & coach" section that mentions retirement planning.

## Hosting (GitHub Pages)

Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / root → Save. The site will be live at `https://baasit-f.github.io/financial-concierge/`. A custom domain can be added on the same screen.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
