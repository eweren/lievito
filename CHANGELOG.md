# Changelog

Alle nennenswerten Änderungen an Lievito werden hier dokumentiert.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Added

- **Phase 1 — Primo (MVP):**
  - Datenmodell `src/lib/types/schema.ts` mit `schemaVersion`, allen Entities aus
    der Roadmap (Settings, DoughCalculationInput/Result, Bake, Photo, Timer,
    Chat, ExportBundle).
  - Stil-Profile für Neapoletana, Romana, NY und Pan/Detroit
    (`src/lib/dough/styles.ts`) inklusive Defaults und Slider-Ranges.
  - Direktteig- und Vorteig-Rechenkern (`src/lib/dough/calculate.ts`):
    Bäckerprozent-Verteilung, Vorteig-Trennung, Hefe-Schätzer (Stunden/Temperatur),
    Konsistenzwarnungen.
  - 12 Vitest-Unit-Tests gegen die Standard-AVPN-Werte (Neapoletana 4×250 g, 62 %
    Hydration), Skalierung, Vorteig-Edge-Cases und Hefe-Suggestion.
  - URL-State-Helper (`src/lib/state/url-state.svelte.ts`): liest initial aus
    Searchparameters, schreibt via `goto` mit `replaceState`.
  - Calculator-State-Modul (`src/lib/state/calculator.svelte.ts`):
    Runes-basiertes `$state`/`$derived`, URL-Serialisierung mit
    Default-Vergleich (saubere URLs).
  - UI-Bausteine: `Slider`, `NumberInput`, `Card`, `Tabs`, `Button`, `RecipeCard`.
  - Direktteig-Rechner-Seite `/rechner` mit Stil-Tabs, Slidern für Hydration,
    Salz, Hefe, Maturazione, Vorteig-Methode plus Ergebnis-Cards (Hauptteig,
    Vorteig, Zugabe, Ablauf, Hinweise) und Share-Button (Web Share API +
    Clipboard-Fallback).
  - MDsvex-Recipe-Loader (`src/lib/recipes/index.ts`) mit Vite-Glob.
  - Drei Rezepte: Neapoletana 24 h, Neapoletana 48 h Kühlschrank, Romana Tonda.
  - Recipe-Routen `/rezepte` (Liste + Favoriten-Sektion) und
    `/rezepte/[slug]` (prerendered, Schema.org JSON-LD, Sprung in den Rechner
    via vorgefüllter URL).
  - Favoriten + persistenter „letzter Rechner-Setup" via localStorage
    (`src/lib/state/favorites.svelte.ts`).
  - Landingpage-Hero mit CTA, Feature-Spalten, Featured-Rezepten und JSON-LD.
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
