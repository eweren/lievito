# Changelog

Alle nennenswerten Änderungen an Lievito werden hier dokumentiert.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Added

- **Phase 0 — Antipasto:**
  - Projekt-Skelett: SvelteKit 2 + Svelte 5 + Vite 6 + TypeScript (strict) + Vitest 3.
  - ESLint 9 (Flat-Config) + Prettier mit Svelte-Plugin.
  - `@sveltejs/adapter-static` für reines statisches Deployment (Cloudflare Pages-tauglich).
  - MDsvex preprocessing für `.md`/`.svx` Rezept-Dateien.
  - Design-Tokens (`src/app.css`): OKLCH-Farbpalette (Pomodoro, Terracotta, Oliva,
    Farina, Forno, Pergamena), Spacing-Skala, Typografie-Variablen, Forno-Modus
    via `[data-theme="forno"]` plus `prefers-color-scheme`-Auto-Schalter, CSS-Layer
    (`tokens / reset / base / components / utilities`).
  - `app.html` mit Viewport + theme-color + Apple-PWA-Meta vorbereitet.
  - Landingpage `/` als minimaler Hero.
- ROADMAP.md mit Checkbox-Struktur für Definition-of-Done und Meilensteine versehen
- CHANGELOG.md angelegt
