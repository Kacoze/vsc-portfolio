# vsc-portfolio

[![CI](https://github.com/Kacoze/vsc-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Kacoze/vsc-portfolio/actions/workflows/ci.yml)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-100%2F100-brightgreen?logo=lighthouse)](https://github.com/Kacoze/vsc-portfolio/actions/workflows/ci.yml)

Portfolio site styled as a VS Code workspace — open the files from the sidebar.

**Live:** [kamil.kozieradzcy.com](https://kamil.kozieradzcy.com)

![vsc-portfolio screenshot](docs/screenshot.png)

## Concept

The site simulates a VS Code environment: a window manager, an editor with multiple files, a working terminal, a Postman-style contact form, and a GitHub Actions panel. Everything runs in the browser with no backend.

## Features

- Draggable, resizable windows with minimize / maximize / close
- Multi-file editor with syntax highlighting, breakpoints, and a context menu
- Terminal with a custom command set (`help`, `ls`, `git log`, `neofetch`, …)
- Postman-style contact form with tab switching and auth type cycling
- GitHub Actions panel — CI jobs, re-run animation, diff popups on commit hashes
- Branch switcher, encoding and line-ending cycling in the status bar
- 100 / 100 Lighthouse score (desktop + mobile)

## Stack

- **Vite 6** + TypeScript — strict, no framework, zero runtime dependencies
- **Playwright** — E2E + Lighthouse audits
- **Vitest** — unit tests (jsdom)
- **Cloudflare Pages** — hosting

## Dev

```bash
npm install
cp .env.example .env   # set VITE_CONTACT_URL to your form endpoint
npm run dev            # localhost:5173
npm run build          # dist/
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run test           # vitest (unit)
npm run test:e2e       # playwright (e2e + lighthouse)
npm run coverage       # vitest --coverage
```

## Tests

```
tests/
  e2e/
    editor.spec.ts      — file switching, terminal, source control
    wm.spec.ts          — window manager (minimize/maximize/close/resize)
    postman.spec.ts     — contact form validation and submission
    actions.spec.ts     — CI jobs panel
    sidebar.spec.ts     — sidebar navigation, breadcrumbs
    content.spec.ts     — editor content assertions
    tabs.spec.ts        — tab management
    terminal.spec.ts    — all terminal commands
    run-panel.spec.ts   — Run & Debug panel
    search.spec.ts      — file search
    dock.spec.ts        — dock icons and animations
    mobile.spec.ts      — mobile layout
    lighthouse.spec.ts  — 100/100 Lighthouse (desktop + mobile)
  unit/
    editor.test.ts      — terminal REPL, file switching, status bar, context menu
    wm.test.ts          — window state, close/minimize/maximize/restore
    postman.test.ts     — form validation, tab switching, fetch mock
    actions.test.ts     — CI job toggle, rerun animation, diff popup
    reveal.test.ts      — terminal reveal timing
    terminal.test.ts    — command parsing edge cases
    utils.test.ts       — esc(), clamp(), parseTerminalCommand()
```
