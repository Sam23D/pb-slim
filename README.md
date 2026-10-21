# PB Slim

Agent skills that turn an AI coding agent into a product partner for **non-engineering PMs**. Describe an app idea in plain words. The agent ships a small **installable web app** on [PocketBase](https://pocketbase.io), with no frontend framework or build step.

- **Installable:** every app is a PWA with an "Install app" button on the site. No app stores. The installed app opens with no signal. Edits need a connection.
- **Online always.** Screens talk to PocketBase. An outbox is added only when they ask to work with no signal.
- **Boring stack:** one PocketBase process, plain HTML/CSS/JS, [Basecoat UI](https://basecoatui.com) components, SQLite on disk.
- **Personality per product:** Basecoat gives the solid SaaS base. Each product adds its own theme, one signature element, and voice.
- **Spec before build:** the agent writes a living spec (v1 floor + later ceiling), reviews it in ship / cut / later, and builds only when asked.

The skills follow the open [Agent Skills](https://agentskills.io/specification) format, so they work in any agent that reads `SKILL.md` folders.

## Skills

| Skill | Job |
|---|---|
| `pb-slim` | Entry point: persona, how to talk to a PM, which skill to use next. Stack and defaults in `references/stack.md` |
| `pb-spec` | Discovery, the living spec, as-built PRD, restyle spec |
| `pb-review` | Read-only product review: ship / cut / later; UX audit |
| `pb-audit` | Read-only security audit: rules, files, hooks, secrets in the browser, with a runnable two-client proof |
| `pb-build` | New app scaffold, then approved v1 online: migrations, PocketBase SDK, realtime on named screens. Offline only when asked |
| `pb-design` | Basecoat base + per-product theme, signature, voice |
| `pb-deploy` | One always-on server, files, backups, email, HTTPS. No per-PR test links in this version |

## Install

Copy or symlink the folders in `skills/` into your agent's skills directory.

```sh
git clone <this-repo> ~/pb-slim
```

| Agent | Command |
|---|---|
| Claude Code (user) | `ln -s ~/pb-slim/skills/* ~/.claude/skills/` |
| Claude Code (project) | `mkdir -p .claude/skills && ln -s ~/pb-slim/skills/* .claude/skills/` |
| Codex / agents that read `.agents/skills` | `mkdir -p ~/.agents/skills && ln -s ~/pb-slim/skills/* ~/.agents/skills/` |
| Hermes | add `~/pb-slim/skills` to `skills.external_dirs` in `config.yaml`, or `ln -s ~/pb-slim/skills/* ~/.hermes/skills/` |
| OpenCode | `ln -s ~/pb-slim/skills/* ~/.config/opencode/skills/` (it also reads `.claude/skills`) |
| Cursor | `mkdir -p .cursor/skills && ln -s ~/pb-slim/skills/* .cursor/skills/` |
| Anything else | point the agent at `skills/<name>/SKILL.md`, or paste `AGENTS.md` into its instructions file |

For the persona to apply in every turn, also copy `AGENTS.md` into your project. In Claude Code, add a `CLAUDE.md` with the line `@AGENTS.md`.

Paths differ between agent versions. Check your agent's docs if a folder above does not load.

## Optional companions

- **impeccable** (design skill): if installed, `pb-design` uses it to write PRODUCT.md / DESIGN.md and to critique screens. Without it, `pb-design` uses its own templates.
- **Node.js**: only for optional checks (`node --check` on scripts). The apps themselves need no Node.

## Start

> I want a simple app where [who] can [do one job]. Start me a blank app.

## Layout

```
skills/
  pb-slim/     SKILL.md, references/stack.md
  pb-spec/     SKILL.md, references/{as-built-prd,restyle}.md, assets/spec-template.md
  pb-review/   SKILL.md, references/ux-audit.md
  pb-audit/    SKILL.md, references/checks.md
  pb-build/    SKILL.md, references/{pages,data,migrations,realtime,offline-first,pocketbase-jsvm,local-dev}.md,
               assets/{index.html,manifest.webmanifest,sw.js}, assets/js/{install,outbox}.js,
               assets/vendor/VERSIONS.json, assets/icons/
  pb-design/   SKILL.md, references/basecoat.md, assets/{theme.css,PRODUCT.md,DESIGN.md}
  pb-deploy/   SKILL.md, references/hosting-and-storage.md
```

## License

MIT. See `LICENSE`.
