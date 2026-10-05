---
name: <Product>
description: <One line on the look.>
colors:
  primary: "<#hex>"
  primary-foreground: "<#hex>"
  background: "<#hex>"
  foreground: "<#hex>"
  muted: "<#hex>"
  muted-foreground: "<#hex>"
  border: "<#hex>"
  destructive: "<#hex>"
typography:
  heading:
    fontFamily: "<family>, system-ui, sans-serif"
    fontWeight: 600
  body:
    fontFamily: "<family>, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.5
rounded:
  base: "0.5rem"
depth: borders   # borders | shadows
density: comfortable   # compact | comfortable
---

# <Product> design

## Theme

<Why these colors: the scene (who, where, what light), the domain they come from.>

## Token map (DESIGN.md → theme.css)

| DESIGN.md | Basecoat token | Also |
|---|---|---|
| colors.primary | `--primary`, `--ring` | manifest `theme_color` |
| colors.background | `--background`, `--card` | manifest `background_color` |
| colors.foreground / muted / border | `--foreground`, `--muted(-foreground)`, `--border`, `--input` | |
| colors.destructive | `--destructive` | |
| rounded.base | `--radius` | |
| typography.heading / body | `--font-heading`, `--font-sans` | self-host in `vendor/fonts/` |

## Signature

<What it looks like, built from which Basecoat parts, where it appears.>

## Do / Don't

- Do: <…>
- Don't: <…>
