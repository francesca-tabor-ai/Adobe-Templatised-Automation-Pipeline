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

Output is in `out/`. The site uses `trailingSlash: true` so each route is emitted as `route/index.html`, which avoids 404s on direct URLs and refresh when deployed (e.g. Vercel, Netlify).

**Vercel:** In Project Settings → General, set **Root Directory** to `website` (this repo has the app in a subfolder). Then deploy; all routes will resolve correctly.

## Pages

- **/** — Home: hero, Why CGVIP, positioning pillars, CTA
- **/product** — System flow and seven agents
- **/use-cases** — Problems, before/after, KPIs
- **/resources** — Doc links (update `href` values to your repo or docs URL)
- **/contact** — Contact CTA (mailto; replace with your email or form link)

## Design system

- **Typography**: Source Sans 3 (humanist sans-serif), high legibility; headlines bold and confident, body with generous line height (`leading-relaxed`).
- **Colour**: Near-black (`ink`) for text, white (`paper`) background, cool greys for UI and secondary text; signature gradient (purple → blue → pink → orange) used sparingly in hero and CTA.
- **Components**: Rounded UI (`rounded-ui` 0.75rem, `rounded-card` 1rem), soft shadows (`shadow-soft`, `shadow-soft-lg`), clear hierarchy and whitespace.
- **Vibe**: Developer-first, calm, confident; “serious but not intimidating.”

## Customization

- **Resources**: Edit `app/resources/page.tsx` and the doc links in `components/Footer.tsx` to point to your repository (e.g. GitHub `docs/` or raw URLs).
- **Contact**: Edit `app/contact/page.tsx` and set the mailto address or link to your CRM/contact form.
