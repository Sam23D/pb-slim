---
name: pb-design
description: "Theme, one signature element, and voice on Basecoat."
license: MIT
metadata:
  author: sam23d
  version: "0.4.0"
---

# Design: Basecoat base, product personality

Persona: `pb-slim`. Basecoat markup and setup: `references/basecoat.md`. Use when a PM asks how the app should look, wants it to feel like their brand, or a spec needs its look and feel section.

## Rule

Basecoat gives every app the same solid SaaS base. Personality comes from **three things only**:

1. **Theme** — colors, fonts, corner radius, borders vs shadows, density. Source: `DESIGN.md`. Output: `pb_public/css/theme.css`, overriding Basecoat's tokens. The blank app ships a plain `theme.css`; replace its values, keep its shape. Full token list with chart colors: `assets/theme.css`. The manifest `theme_color` and `background_color` use the same values. Fonts are self-hosted in `pb_public/vendor/fonts/`, or stay on `system-ui`.
2. **One signature element** — something only this product has (a ledger's owed/owes line; a gym app's streak strip). Built from Basecoat parts plus `css/app.css`. Shows on the home screen, the empty state, and the install screen.
3. **Voice** — words on buttons, empty screens, errors, and the Install button. Comes from the personality in `PRODUCT.md`. One action keeps one verb through the flow ("Save" → "Saved"). Errors say what happened and how to fix it.

**Never rewrite Basecoat components or invent new ones.** A request that needs that is Later or Cut.

## Flow

1. The spec gets a **Look & feel** section: 3 words, one thing it must not look like, the signature idea.
2. Write `PRODUCT.md` (who, personality, anti-references, principles) and `DESIGN.md` (tokens + why) at the project root. Templates: `assets/PRODUCT.md`, `assets/DESIGN.md`. If the **impeccable** skill is installed, use its `init` instead.
3. Find the product's world before picking colors: 5 concepts from its domain, 5 colors that exist in that domain, then the signature. Token names may evoke the product (`--owed`), but Basecoat's own token names stay.
4. Show the **same Basecoat screen in 2–3 themes** as static HTML files: one restrained default, one or two with more personality. The PM picks one in one line.
5. Write `theme.css` from the pick. Check contrast: body text ≥ 4.5:1, large text ≥ 3:1, placeholder text too.

## Defaults

- Product UI: restrained color (tinted neutrals + one accent ≤ 10% of the surface). One font family is often enough.
- Light or dark is not a default. Decide from a one-sentence scene: who uses it, where, in what light.
- Warm paper or cream backgrounds are allowed when `PRODUCT.md` asks for that look. (Some design skills ban them for new projects; this one does not.)
- Touch targets ≥ 40px on phones. Respect `prefers-reduced-motion`.

## Review checks

- Basecoat markup untouched; no new component framework.
- Signature visible in at least 3 places.
- The same verb through each flow. The Install button uses the product voice.
- Contrast passes; no remote fonts, so the shell opens with no signal.
