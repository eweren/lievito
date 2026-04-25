# Changelog

Alle nennenswerten Änderungen an Lievito werden hier dokumentiert.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Added

- **Phase 3 — Contorno (KI + Push):**
  - Cloudflare Pages Function (`functions/api/pizzaiolo.ts`) als KI-Endpunkt:
    streamt Anthropic-Messages via SSE, IP-Rate-Limit (20/Tag) und globaler
    Tageslimit über KV, Kill-Switch via Env, 32-KB-Body-Limit, modellbar
    konfigurierbar (`ANTHROPIC_MODEL`).
  - System-Prompt im versionierten Modul (`src/lib/server/prompts/pizzaiolo.ts`).
  - Browser-Streaming-Client (`src/lib/chat/client.ts`): SSE-Reader, ParseS-
    Event-Stream, `text_delta`-Aggregation.
  - Diagnose-Parser (`src/lib/chat/parse-diagnosis.ts`) inkl. 5 Vitest-Tests:
    extrahiert ```json-Block, validiert Causes/Solutions-Schema, fällt bei
    Bruch elegant zurück.
  - Chat-CRUD in IndexedDB (`src/lib/db/chats.ts`), opt-in Persistenz, neue
    Sitzung jederzeit startbar.
  - `/pizzaiolo` Seite mit Datenschutz-Hinweis-Gate, Streaming-Cursor-Effekt,
    strukturierter Diagnose-Anzeige (Likelihood-Badges, Solution-Steps).
  - Lokale Push-Notifications via Service Worker (`src/lib/notify/index.ts`):
    `SCHEDULE_NOTIFICATION` / `CANCEL_NOTIFICATION`-Messages, `notificationclick`-
    Handler fokussiert offene Tabs, fällt sonst zurück auf `/timer`.
  - Timer-Page registriert Notification beim Start, räumt bei Löschen auf.
  - Mehl-Lexikon: Datenmodul mit 16 Mehlsorten (Tipo 00/0/1/2, Manitoba,
    Vollkorn, Kamut, Dinkel, Roggen, Semola, Pinsa-Mix, Maisgrieß, Reis,
    glutenfrei, Tipo 00 Bio), `/mehl` Seite mit Suche und Kategorien-Filter.
- **Phase 2 — Secondo (V1):**
  - Dexie-Setup (`src/lib/db/index.ts`) mit Tabellen für Bakes, Photos, Timers,
    Chats, Settings. Migrations-Skelett (`db.version().upgrade()`) und
    Pre-Migration-Backup nach localStorage.
  - Storage-Helfer (`src/lib/db/storage.ts`): `navigator.storage.estimate()`-Wrapper,
    `requestPersistentStorage()`, `formatBytes()`.
  - Foto-Pipeline (`src/lib/db/photos.ts`): `createImageBitmap` + OffscreenCanvas,
    Resize auf max. 1600 px, JPEG 0.8, gespeichert als Blob (nie Base64).
  - Backjournal-CRUD (`src/lib/db/bakes.ts`): create/list/get/update/delete +
    Photo-Tabellen-Cleanup, automatischer `navigator.storage.persist()`-Request beim
    ersten Bake.
  - Backjournal-Routen `/journal`, `/journal/neu`, `/journal/[id]` mit
    Storage-Auslastung-Warnung ab 80 %.
  - JSON-Export/Import (`src/lib/db/export.ts`): vollständiges Bundle mit
    Bakes/Fotos/Timern/Chats/Settings, Fotos als Data-URL, Versions-Validierung,
    Merge- vs. Replace-Strategie. Vitest-Roundtrip-Test für JSON-Symmetrie.
  - `/journal/export` Seite mit Download-Button und Datei-Import.
  - Timer-Engine (`src/lib/db/timers.ts`): Wall-Clock-basierte Restzeit,
    parallele Sessions, IndexedDB-Persistenz, 5 Vitest-Tests für
    `formatRemaining` und `remainingSec`.
  - Timer-Komponente (`src/lib/components/Timer.svelte`) mit Conic-Gradient-Ring,
    Notification-API, Vibration und WebAudio-Beep beim Schritt-Ende.
  - Timer-Route `/timer` mit Builder, aktiven und beendeten Sessions.
  - `EmptyState`-Komponente.
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
