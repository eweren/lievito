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
  - PWA-Manifest mit Maskable- und Standard-Icons (192/512 + 180 Apple Touch +
    OG-Default 1200x630), generiert via `scripts/generate-icons.mjs` (sharp).
  - SvelteKit-Service-Worker (`src/service-worker.ts`): App-Shell-Cache,
    Stale-While-Revalidate Runtime-Cache, exkludiert `/api/*`.
  - Theme-State-Modul (`src/lib/state/theme.svelte.ts`) mit Runes + localStorage.
  - Header- und Footer-Komponenten mit Forno-Modus-Toggle und
    Local-First-Footer-Claim.
  - Landingpage `/` als minimaler Hero.
- ROADMAP.md mit Checkbox-Struktur für Definition-of-Done und Meilensteine versehen
- CHANGELOG.md angelegt
