# CGVIP Marketing Website

Multi-page product marketing site for the Creative Governance & Variant Intelligence Platform (CGVIP). Built with Next.js (App Router), React, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build (static export)

```bash
npm run build
```

Output is in `out/`. The site is configured for static export (`output: 'export'` in `next.config.js`), so it can be hosted on any static host (e.g. GitHub Pages, Netlify, Vercel).

## Pages

- **/** — Home: hero, Why CGVIP, positioning pillars, CTA
- **/product** — System flow and seven agents
- **/use-cases** — Problems, before/after, KPIs
- **/resources** — Doc links (update `href` values to your repo or docs URL)
- **/contact** — Contact CTA (mailto; replace with your email or form link)

## Customization

- **Resources**: Edit `app/resources/page.tsx` and the doc links in `components/Footer.tsx` to point to your repository (e.g. GitHub `docs/` or raw URLs).
- **Contact**: Edit `app/contact/page.tsx` and set the mailto address or link to your CRM/contact form.
