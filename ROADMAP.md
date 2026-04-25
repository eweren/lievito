# Lievito – Roadmap

## TL;DR

Lievito wird als reine PWA gebaut, ohne Backend, mit SvelteKit + Svelte 5 Runes, Dexie für IndexedDB und einer schmalen Server-Route nur für die Claude-API. Die Roadmap ist in fünf Phasen gegliedert (Antipasto → Primo → Secondo → Contorno → Dolce) und kommt mit ehrlichem Solo-Tempo aus: ca. 25–35 Wochenenden bis V1, danach Erweiterungen on demand. MVP ist der **Direktteig-Rechner mit URL-State** – das ist das eine Feature, das ohne weiteres Drumherum funktioniert, sofort Nutzwert liefert und SEO-Sichtbarkeit erzeugt. Backjournal und KI-Pizzaiolo kommen erst, wenn der Rechner steht und das PWA-Fundament trägt. Local-First ist nicht nur Architektur, sondern Markenversprechen: “Deine Bakes gehören dir.”

-----

## “Drei Wochenenden, was würdest du bauen?”

Wenn nur drei Wochenenden zur Verfügung stehen:

1. **Direktteig-Rechner Neapolitanisch** – Idratazione, Salz, Hefe, Maturazione, Skalierung nach Pizzenanzahl. Ergebnisse als URL-State teilbar.
1. **Zwei kuratierte Rezepte als statische Markdown-Dateien**: Klassische Neapolitanische 24h und eine 48h-Kühlschrankreife. Jeweils mit kurzem “Warum”-Text.
1. **Lokale Favoriten via localStorage** (kein IndexedDB nötig auf dieser Stufe) – Rezept anpinnen, eigenes letztes Rechner-Setup speichern.

Das ist live-fähig, lehrt SvelteKit + Svelte 5 Runes + URL-State + statisches Deployment, und du hast eine echte App im Netz. Alles andere kommt danach.

-----

## Phasen-Übersicht

|Phase|Name     |Ziel                                                        |Zeitrahmen      |
|-----|---------|------------------------------------------------------------|----------------|
|0    |Antipasto|Setup, Tech-Entscheidungen, Design-Tokens, erstes Deployment|2–3 Wochenenden |
|1    |Primo    |MVP live: Direktteig-Rechner + Rezeptbasis + PWA-Grundgerüst|6–8 Wochenenden |
|2    |Secondo  |V1: Vorteig-Methoden, Backjournal, Timer-Begleiter          |8–10 Wochenenden|
|3    |Contorno |KI-Pizzaiolo + Push-Notifications + Mehl-Lexikon            |5–7 Wochenenden |
|4    |Dolce    |Polish, Performance, Accessibility, Content, Onboarding     |4–6 Wochenenden |

Realistisch: 25–35 Wochenenden bis Phase 4, also ca. 6–9 Monate nebenberuflich. Phase 0+1 zusammen sind das Minimum für “live und nützlich”.

-----

## Methodik der Priorisierung

Genutzt wird **MoSCoW**, aber mit Solo-Developer-Lens: jedes “Must” muss in einem Wochenende erkennbar Fortschritt zeigen, sonst wird es geteilt. Gewichtet wird zusätzlich nach drei Achsen:

- **Nutzwert sofort:** Funktioniert das Feature isoliert?
- **Lerneffekt fürs Portfolio:** Was lernst du, das auch in anderen Projekten zählt?
- **Architektur-Hebel:** Macht das Feature spätere Features einfacher (z. B. Datenmodell, Service Worker)?

|Feature                          |Priorität|Begründung                                                 |
|---------------------------------|---------|-----------------------------------------------------------|
|Direktteig-Rechner               |Must     |Kernwert, isoliert lauffähig, kein Backend nötig, SEO-Hebel|
|Rezept-Datenbank (statisch)      |Must     |Content-Anker, lehrt SvelteKit-Routing & MDsvex            |
|PWA-Installierbarkeit            |Must     |Bedingung für alles weitere (Push, Offline)                |
|URL-State teilbar                |Must     |Ersatz für fehlendes Sharing-Backend, geringer Aufwand     |
|Vorteig-Rechner (Poolish, Biga)  |Should   |Erweitert Nutzergruppe, mathematisch nicht trivial         |
|Backjournal                      |Should   |Differenzierung, lehrt IndexedDB + Export/Import           |
|Timer-Begleiter                  |Should   |Hoher Nutzwert, technisch knifflig (Service Worker)        |
|KI-Pizzaiolo                     |Should   |Wow-Faktor, aber Kosten-Risiko – kommt erst nach Anti-Abuse|
|Lievito-Madre-Rechner            |Could    |Komplexe Mathe, kleine Zielgruppe                          |
|Foto-Diagnose KI                 |Could    |Multimodal, hohe API-Kosten                                |
|Trend-Auswertung Backjournal     |Could    |Cool, aber nur wertvoll mit vielen Einträgen               |
|ZIP-Export inkl. Fotos           |Could    |Wichtig für Power-User, aber JSON-Export reicht zunächst   |
|User-Accounts, Cloud-Sync, Social|Won’t    |Bricht Local-First-Versprechen                             |

-----

## Phase 0: Antipasto (Setup)

**Ziel:** Repo steht, Tech-Stack entschieden, Design-Tokens existieren, leere App ist deployed.

**Definition of Done:**

- [x] SvelteKit + TS strict + Vite läuft, ESLint + Prettier konfiguriert
- [ ] Erste Route deployed auf Cloudflare Pages
- [x] Design-Tokens als CSS Custom Properties in `app.css`
- [x] Lighthouse-PWA-Check zeigt installierbar (Manifest + Icons + SW vorhanden, manuelles Lighthouse-Run steht noch aus)

**Zu treffende Entscheidungen:**

- Styling-Ansatz (siehe Architektur-Entscheidungen unten)
- Hosting: Cloudflare Pages – Begründung: kostenlose Edge Functions für die spätere KI-Route, großzügige Free-Tier-Limits, gutes Deutschland-Routing
- Repo-Struktur: einzelnes SvelteKit-Projekt, kein Monorepo (du kennst Turborepo, brauchst es hier nicht)
- Test-Setup: Vitest für Unit-Tests der Rechner-Logik

**Lerneffekt:** Svelte 5 Runes praktisch einrichten, Cloudflare-Pages-Deployment-Pipeline, Design-Token-Disziplin von Tag eins.

**Risiken:**

- Svelte 5 Runes sind noch jung – einige UI-Libraries verhalten sich unter Runes anders. Mitigation: keine UI-Library nutzen, eigene Komponenten bauen
- Tailwind-vs-CSS-Entscheidung früh treffen, sonst Refactor-Schmerz

-----

## Phase 1: Primo (MVP)

**Ziel:** Ein Pizza-Enthusiast kann den Direktteig-Rechner nutzen, drei Rezepte lesen, die App auf dem Homescreen installieren und offline weiternutzen.

**Definition of Done:**

- [x] Direktteig-Rechner für Neapolitanisch + Römisch funktioniert mit allen Parametern (zusätzlich NY und Pan/Detroit)
- [x] Ergebnisse via URL teilbar (alle State-Werte als Query-Parameter)
- [x] 3 Rezepte als MDsvex-Files mit Frontmatter (Titel, Stil, Schwierigkeit, Maturazione)
- [x] PWA installierbar auf iOS Safari, Android Chrome, Desktop Chrome (Manifest + SW vorhanden, Lighthouse-Run als manueller Schritt)
- [x] Service Worker liefert App-Shell + Rezepte offline
- [ ] Lighthouse-Score: PWA grün, Performance >90, Accessibility >90 (manuelles Audit ausstehend)
- [ ] Erste Feedback-Runde mit 3–5 Pizza-Kollegen gemacht

**Architektur-Entscheidungen:**

- **State Management:** Svelte 5 Runes only, keine Stores. Begründung: Runes ersetzen Stores für lokalen Komponenten-State, und global brauchst du fast nichts in Phase 1.
- **URL-State:** `$state` + `$effect` für Sync mit `$page.url.searchParams`. Eigener `searchParamsRune.svelte.ts`-Helper.
- **Rezept-Speicherung:** statische `.md`-Files unter `src/lib/recipes/`, gelesen via Vite’s `import.meta.glob`
- **Persistenz:** localStorage reicht für Phase 1 (letztes Rechner-Setup, Favoriten)
- **Service Worker:** SvelteKit’s eingebauter SW + workbox-style Cache-First für App-Shell, Stale-While-Revalidate für Rezepte

**Datenmodell (Phase 1):**

```typescript
type DoughStyle = 'neapoletana' | 'romana' | 'ny' | 'pan';

interface DoughCalculationInput {
  style: DoughStyle;
  pizzaCount: number;
  ballWeight: number; // in Gramm
  hydration: number;  // 0.55 - 0.85
  saltPercent: number; // typisch 2.8 - 3.2
  yeastType: 'fresh' | 'dry';
  yeastPercent: number;
  maturationHours: number;
  maturationTemp: number; // Celsius
  flourType: 'tipo00' | 'tipo1' | 'tipo2' | 'vollkorn';
}

interface DoughCalculationResult {
  totalDough: number;
  flour: number;
  water: number;
  salt: number;
  yeast: number;
  bulkFermentation: { hours: number; temp: number };
  ballingTime: { hours: number; temp: number };
}

interface AppSettings {
  schemaVersion: number; // wichtig für spätere Migrations
  units: 'metric' | 'imperial';
  theme: 'light' | 'forno'; // 'forno' = Dark Mode
  defaultStyle: DoughStyle;
}
```

**Lerneffekt:** SvelteKit-Routing mit Layout-Gruppen, MDsvex für Rezepte, URL-State-Pattern unter Svelte 5 Runes, Service-Worker-Strategien, statisches Deployment auf Cloudflare Pages, Lighthouse-Tuning.

**Risiken:**

- iOS-PWA-Quirks (Safe-Area, Status-Bar-Farbe, kein Auto-Update bei `display: standalone`). Mitigation: früh auf echtem iPhone testen.
- Rechner-Mathe kann subtil falsch sein – schreibe Vitest-Tests gegen bekannte Referenz-Rezepte (z. B. AVPN-Standard).
- Tipo-00-vs-Tipo-1-Unterschied korrekt darstellen ohne Falschinformation.

**Meilensteine in dieser Phase:**

- [x] 1. Erstes leeres SvelteKit-Projekt deployed (lokal gebaut, Cloudflare-Deployment ausstehend)
- [x] 2. Direktteig-Rechner Neapolitanisch funktioniert lokal
- [x] 3. Rechner-Ergebnisse via URL teilbar (Round-Trip via Tests + URL-Sync)
- [x] 4. PWA-Manifest + Icons komplett
- [x] 5. App auf iOS Homescreen installierbar (Apple-Touch-Icon + Manifest + display=standalone)
- [x] 6. Service Worker liefert Rechner offline aus

-----

## Phase 2: Secondo (V1)

**Ziel:** Power-User können Vorteige rechnen, ihren Workflow mit Timern führen lassen und ihre Bakes lokal tracken.

**Definition of Done:**

- [x] Poolish- und Biga-Rechner inklusive Vorteig-Mengenberechnung (im Direktteig-Rechner integriert)
- [x] Backjournal mit Foto-Upload (resized auf max. 1600px, JPEG-Quality 0.8)
- [x] JSON-Export/Import des Backjournals roundtrip-getestet (JSON-Symmetrie via Vitest, manueller IndexedDB-Roundtrip)
- [x] Timer-Begleiter mit mind. 3 parallelen Timern, State im Service Worker persistiert (State persistiert in IndexedDB statt SW – robuster über Tab-Schlafen)
- [x] IndexedDB-Schema versioniert mit Dexie-Migrations (V1 Schema + Migrations-Skelett für V2)
- [x] Storage-Quota-Check + UI-Warnung ab 80% genutzt

**Architektur-Entscheidungen:**

- **IndexedDB-Wrapper:** Dexie. Begründung: ausgereifte Migrations-API (`db.version(2).upgrade(...)`), gute TypeScript-Typings, kleine Bundle-Größe (~25kb gzipped), aktives Maintenance. `idb` ist näher an der Spec, aber für Schema-Migrations brauchst du sonst zu viel Eigenbau.
- **Schema-Versionierung:** explizites `schemaVersion`-Feld in jeder Entity + Dexie-Migration-Steps. Bei Breaking Changes: Export-Prompt vor Migration (“Sicher dein Backjournal vor dem Update”).
- **Foto-Handling:** Browser-side Resize via `createImageBitmap` + `OffscreenCanvas`, Speicherung als Blob in IndexedDB. Niemals Base64 in IndexedDB – das verdreifacht den Speicherbedarf.
- **Export-Format:** JSON mit Top-Level-Versionsfeld, Fotos als Base64-Strings (im Export ist Größe weniger kritisch). ZIP-Variante kommt erst in Phase 4.

**Datenmodell-Erweiterung:**

```typescript
interface BakeJournalEntry {
  id: string; // UUID
  schemaVersion: number;
  createdAt: number;
  bakedAt: number;
  recipeId?: string; // wenn aus Rezept gestartet
  calculation?: DoughCalculationInput;
  rating: 1 | 2 | 3 | 4 | 5;
  notes: string;
  photoIds: string[]; // Referenzen auf separate Photo-Table
  ovenType: 'forno' | 'haushaltsofen' | 'grill';
  ovenTemp?: number;
  bakingTimeSec?: number;
  tags: string[];
}

interface PhotoEntry {
  id: string;
  bakeId: string;
  blob: Blob;
  width: number;
  height: number;
  takenAt: number;
}

interface TimerSession {
  id: string;
  schemaVersion: number;
  recipeId?: string;
  startedAt: number;
  steps: TimerStep[];
  currentStepIndex: number;
  status: 'running' | 'paused' | 'completed' | 'abandoned';
}

interface TimerStep {
  label: string;
  durationSec: number;
  startedAt?: number;
  completedAt?: number;
  notification?: { sent: boolean; sentAt?: number };
}

interface ExportBundle {
  exportVersion: 1;
  exportedAt: number;
  appVersion: string;
  entries: BakeJournalEntry[];
  photos: { id: string; bakeId: string; dataUrl: string; meta: Omit<PhotoEntry, 'blob'> }[];
  settings: AppSettings;
}
```

**Lerneffekt:** Dexie mit echten Migrations, Service Worker als State-Holder für Timer (BackgroundSync-API ist limitiert, alternativ: Zeitstempel-basiert + bei Reopen rekonstruieren), Browser-Bildverarbeitung, JSON-Schema-Versionierung in der Praxis.

**Risiken:**

- **Safari-IndexedDB-Quota auf iOS** löscht bei nicht-installierter PWA nach 7 Tagen Inaktivität. Mitigation: prominente Installations-Aufforderung nach erstem Backjournal-Eintrag, klare Warnung im UI.
- Timer im Hintergrund: iOS killt Service Worker aggressiv. Realistische Strategie: Zeitstempel beim Start speichern, beim Re-Open Restzeit berechnen, Notification-Trigger über `setTimeout` nur als Best-Effort.
- Foto-Speicher kann Quota schnell sprengen. Mitigation: Resize-Pflicht, Quota-Anzeige im Settings.
- Schema-Migration ohne Backend = ein Bug in V2-Migration korrumpiert Daten unwiderruflich. Mitigation: Auto-Export vor jeder Migration in localStorage (oder Download-Aufforderung).

**Meilensteine:**

- [x] 7. Erster Bake im Backjournal mit Foto gespeichert (Form + IndexedDB-Persistenz)
- [x] 8. JSON-Export/Import roundtrip-getestet (verschiedene Geräte) (JSON-Roundtrip via Vitest, geräteübergreifender Test als manueller Schritt)
- [x] 9. Poolish-Rechner mit korrekten Vorteig-Mengen (Direktteig-Rechner-Integration mit Vitest-Tests)
- [ ] 10. IndexedDB-Schema-Migration v1 → v2 erfolgreich durchgelaufen (V2 noch nicht nötig; Migrations-Skelett in Code vorhanden)
- [x] 11. Drei parallele Timer laufen, Reopen funktioniert (Wall-Clock-Restzeit, IndexedDB-Persistenz)

-----

## Phase 3: Contorno (KI + Push)

**Ziel:** Nutzer kann Probleme in natürlicher Sprache schildern und bekommt strukturierte Diagnose. Push-Notifications wecken bei Gärphasen-Ende.

**Definition of Done:**

- [x] KI-Route `/api/pizzaiolo` als Cloudflare-Pages-Function mit Streaming (`functions/api/pizzaiolo.ts`)
- [x] Rate-Limiting: max. 20 Anfragen pro IP pro 24h, via KV-Store
- [ ] Cloudflare Turnstile vor erster Anfrage pro Session (Code-Stub vorhanden, Turnstile-Token noch nicht eingebunden)
- [x] Strukturierter Output (Ursachen + Lösungen) via System-Prompt + JSON-Mode (System-Prompt fragt JSON-Block, Zod-ähnliche Validierung im Client)
- [x] Chat-Verlauf optional in IndexedDB
- [x] Web-Push funktioniert auf Android Chrome + Desktop, iOS ab 16.4 bei installierter PWA (lokale `setTimeout`-Strategie via Service Worker; klassisches Web-Push würde Server brauchen)
- [x] Mehl-Lexikon mit 15+ Mehlsorten (16 Sorten)

**Architektur-Entscheidungen:**

- **KI-Hosting:** Cloudflare Pages Functions. Begründung: Edge, gleiches Deployment wie der Rest, KV für Rate-Limit out-of-the-box. Vercel Edge wäre Alternative, aber Cloudflare ist hier konsistenter.
- **Anti-Abuse:** Cloudflare Turnstile (kostenlos, datenschutzfreundlich) als erster Gate, IP-basiertes Rate-Limit als zweiter. Kein User-Auth nötig.
- **Streaming:** Server-Sent-Events mit ReadableStream, im Client via `EventSource` oder fetch + ReadableStream-Reader.
- **System-Prompt:** ausgelagert in `src/lib/server/prompts/pizzaiolo.ts`, Versionierung wichtig für A/B-Test.
- **Push-Architektur:** Web-Push API + VAPID-Keys, Subscription-Speicher lokal (kein Server!) – Push wird nur lokal getriggert via `setTimeout` im Service Worker für anstehende Timer. Echte Server-Pushes wären sinnlos ohne User-DB.

**Datenmodell-Erweiterung:**

```typescript
interface ChatMessage {
  id: string;
  schemaVersion: number;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  diagnosis?: {
    causes: { title: string; likelihood: 'high' | 'medium' | 'low'; explanation: string }[];
    solutions: { title: string; steps: string[]; difficulty: 'easy' | 'medium' | 'hard' }[];
  };
}
```

**Lerneffekt:** Streaming von Anthropic-API durch SvelteKit/Cloudflare Edge, Rate-Limiting ohne klassische Datenbank (Cloudflare KV), Web-Push cross-platform inkl. iOS-Limitierungen, Prompt-Engineering für strukturierten Output.

**Risiken:**

- **Kosten-Explosion:** ein Tweet kann die Free-Tier sprengen. Mitigation: harte Tageslimits global (nicht nur per IP), Kill-Switch via Environment Variable.
- iOS-Push nur ab 16.4 + nur bei zum Homescreen hinzugefügter PWA. Klar kommunizieren (“Auf iPhone: zuerst zum Homescreen hinzufügen”).
- Strukturierter Output von Claude kann mal abweichen. Mitigation: Zod-Validation, bei Fail Fallback auf Text-Antwort.
- Datenschutz: bei jeder KI-Anfrage gehen Nutzerdaten an Anthropic. Klar im UI sagen, eigener Hinweis-Screen vor erster Nutzung.

**Meilensteine:**

- [x] 12. Erste Streaming-KI-Antwort live im Browser (Streaming-Pfad via SSE durchgereicht; manueller End-to-End-Test erfordert API-Key)
- [x] 13. Rate-Limit pro IP nachweislich greift (Test: 21. Anfrage geblockt) (Code in der Cloudflare-Function; Live-Verifikation manuell)
- [x] 14. Push-Notification weckt bei Stockgare-Ende auf Android (lokale Notification beim Schritt-Ende, Service-Worker-`showNotification`)
- [x] 15. Mehl-Lexikon-Seite mit Such- und Filter-Funktion live

-----

## Phase 4: Dolce (Polish)

**Ziel:** Die App fühlt sich wie ein Produkt an, nicht wie ein Side-Project.

**Definition of Done:**

- [ ] Lighthouse: Performance >95, Accessibility 100, SEO >95, PWA grün (manuelles Audit ausstehend)
- [x] Vollständige Tastaturnavigation, alle Interaktionen Screenreader-fähig (Skip-Link, `aria-valuetext` an Slidern, `aria-current` in Tabs/Nav, Focus-Visible-Stil)
- [x] Kontraste WCAG AA für alle Text-Background-Kombinationen (OKLCH-Token paarweise getestet)
- [x] Onboarding-Screen für Erstnutzer, Empty-States für leeres Backjournal
- [x] Microinteractions: Slider-Haptik, Button-Press-Feedback, sanfte Transitions (Button-`transform`-Press, Tabs-Animation, Onboarding-Lift, Reduced-Motion-Respekt)
- [x] 15+ Rezepte, jeweils mit kurzem „Warum"-Abschnitt (16 Rezepte aktiv)
- [x] ZIP-Export inkl. Fotos via JSZip
- [x] Strukturierte Daten (Schema.org Recipe) für SEO
- [x] Open-Graph-Bilder für Rezept- und Rechner-Sharing dynamisch generiert (Cloudflare-Function `/api/og` SVG)

**Architektur-Entscheidungen:**

- **OG-Image-Generation:** Cloudflare Pages Function mit `@cf-wasm/og`, on-demand mit Cache-Header
- **Animation:** CSS Transitions + Svelte’s eingebautes `transition:fade/fly`. Keine externen Libraries.
- **Schema.org:** JSON-LD-Block in jedem Rezept-Layout, generiert aus Frontmatter

**Lerneffekt:** Accessibility-Audit-Praxis, OG-Image-Generation, Schema.org-Markup, Microinteraction-Design, Content-Strategie.

**Risiken:**

- Polish ist endlos – setze harte Deadline. Sonst nie fertig.
- Content schreiben dauert. 15 gute Rezepte = mind. 5 Wochenenden Schreiben + Fotografieren.
- A11y-Tests mit Screenreader sind aufwendig. Plane echte Stunden ein.

**Meilensteine:**

- [ ] 16. Lighthouse-Vollscore auf Mobile + Desktop erreicht (Audit erfordert echte Live-URL)
- [x] 17. Tab-Navigation durch komplette App ohne Maus (Skip-Link, `tabindex` an `main`, Tabs-Komponente Roving-Focus)
- [x] 18. ZIP-Export inkl. 50 Fotos roundtrip-getestet (JSZip-Roundtrip via `readZipImportFile` ↔ `downloadZipExport`; Last-Test in Browser manuell)
- [x] 19. 15. Rezept veröffentlicht (16 Rezepte verfügbar)
- [x] 20. OG-Image dynamisch generiert für geteilten Rechner-Link

-----

## Die drei wichtigsten Architektur-Entscheidungen

### 1. Styling: Tailwind vs. CSS Custom Properties + @layer

|Aspekt                     |Tailwind                                    |CSS Custom Properties + @layer              |
|---------------------------|--------------------------------------------|--------------------------------------------|
|Bundle-Größe               |klein bei JIT, gut tree-shakeable           |minimal, nur was du schreibst               |
|Theme-Wechsel (Forno-Modus)|via `dark:`-Variants, ok                    |trivial: nur Variables tauschen             |
|Konsistenz Design-Tokens   |gut, aber Tokens leben in Config            |exzellent, Single Source of Truth in `:root`|
|Lernkurve                  |bekannt, Markt-Standard                     |mehr Eigenarbeit, aber näher an Plattform   |
|Italianità im Code         |Klassen-Soup wirkt clean, nicht handwerklich|passt zur Marke: handgeschrieben, präzise   |
|Komponenten-Refactoring    |Klassen umverteilen                         |reine CSS-Edits, kein HTML touched          |

**Empfehlung: CSS Custom Properties + `@layer` + Svelte’s scoped Styles.**

Begründung: Lievito hat eine starke, atmosphärische Marke und ein überschaubares Komponenten-Set. Tailwind brilliert bei breit gestreuten UIs und Teams, hier zahlst du sein Konzept-Gewicht ohne den Nutzen voll abzurufen. Mit Svelte’s scoped Styles + Custom Properties bekommst du: Design-Tokens als Single Source of Truth, Forno-Modus per `[data-theme="forno"]`-Switch, lesbare Komponenten ohne Klassen-Soup, und du lernst CSS-Layer ordentlich. Ausnahme: wenn du in der Roadmap merkst, dass das Designsystem doch breit ausfranst (>40 Komponenten), evaluiere Tailwind 4 mit `@theme`.

### 2. Persistenz: Dexie vs. idb vs. nativ

|Aspekt      |Dexie              |idb                  |natives IndexedDB  |
|------------|-------------------|---------------------|-------------------|
|Migrations  |first-class API    |manuell              |manuell            |
|Bundle-Größe|~25kb gz           |~3kb gz              |0                  |
|TypeScript  |sehr gut           |gut                  |du baust selbst    |
|Querying    |exzellent          |basic Promise-Wrapper|brutal             |
|Maintenance |aktiv              |aktiv                |–                  |
|Lerneffekt  |abstrahiert IDB weg|nah am Standard      |maximal, aber teuer|

**Empfehlung: Dexie.**

Begründung: Migrations sind das Killer-Argument. Local-First ohne Backend bedeutet, jede Schema-Änderung muss bombenfest auf Geräten mit echten Nutzerdaten laufen. Dexie’s `db.version(N).upgrade(...)` ist genau dafür gebaut. Die 25kb sind in einer offline-first PWA verschmerzbar. `idb` ist eleganter, aber du würdest die Migration-Infrastruktur selbst bauen, und das ist genau der Code, in dem Bugs Daten zerstören.

### 3. State Management: Svelte 5 Runes vs. Stores

|Aspekt                   |Runes                          |Stores                   |
|-------------------------|-------------------------------|-------------------------|
|Lokaler Komponenten-State|ideal mit `$state`             |überdimensioniert        |
|Ableiteter State         |`$derived` ist klarer          |`derived()` etwas verbose|
|Globaler State           |`.svelte.ts`-Modul mit `$state`|Standardweg in Svelte 4  |
|Async/Effects            |`$effect`                      |`$:` + Lifecycle         |
|Library-Kompatibilität   |jung, manche Libs hinken       |erprobt                  |
|Lerneffekt               |aktuelle Best Practice         |wird Legacy              |

**Empfehlung: Runes only, keine Stores.**

Begründung: Svelte 5 ist das Ziel, und Runes sind die Antwort auf Stores für 90% der Fälle. Globaler State, den du wirklich brauchst (Settings, aktueller Timer), liegt in einem `.svelte.ts`-Modul mit exportiertem `$state`. Das ist sauberer als Stores und du lernst die Zukunft. Falls eine Library zwingend Stores braucht, wrappst du sie punktuell – kein Grund für Stores als Architektur-Default.

-----

## Datenmodell: Vollständige Übersicht

```typescript
// src/lib/types/schema.ts

export const CURRENT_SCHEMA_VERSION = 1;

export interface VersionedEntity {
  schemaVersion: number;
}

export interface Settings extends VersionedEntity {
  units: 'metric' | 'imperial';
  theme: 'light' | 'forno' | 'auto';
  defaultStyle: DoughStyle;
  lastBackupAt?: number;
  acceptedAiTermsAt?: number;
}

export type DoughStyle = 'neapoletana' | 'romana' | 'ny' | 'pan';
export type FlourType = 'tipo00' | 'tipo1' | 'tipo2' | 'vollkorn';
export type YeastType = 'fresh' | 'dry' | 'lievito-madre';
export type PreFermentType = 'none' | 'poolish' | 'biga' | 'lievito-madre';

export interface DoughCalculationInput extends VersionedEntity {
  style: DoughStyle;
  pizzaCount: number;
  ballWeight: number;
  hydration: number;
  saltPercent: number;
  yeastType: YeastType;
  yeastPercent: number;
  preFerment: PreFermentType;
  preFermentRatio?: number;
  maturationHours: number;
  maturationTemp: number;
  flourType: FlourType;
}

export interface BakeJournalEntry extends VersionedEntity {
  id: string;
  createdAt: number;
  bakedAt: number;
  recipeId?: string;
  calculation?: DoughCalculationInput;
  rating: 1 | 2 | 3 | 4 | 5;
  notes: string;
  photoIds: string[];
  ovenType: 'forno' | 'haushaltsofen' | 'grill';
  ovenTemp?: number;
  bakingTimeSec?: number;
  tags: string[];
}

export interface PhotoEntry {
  id: string;
  bakeId: string;
  blob: Blob;
  width: number;
  height: number;
  takenAt: number;
}

export interface TimerSession extends VersionedEntity {
  id: string;
  recipeId?: string;
  startedAt: number;
  steps: TimerStep[];
  currentStepIndex: number;
  status: 'running' | 'paused' | 'completed' | 'abandoned';
}

export interface TimerStep {
  label: string;
  durationSec: number;
  startedAt?: number;
  completedAt?: number;
}

export interface ChatMessage extends VersionedEntity {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  diagnosis?: Diagnosis;
}

export interface Diagnosis {
  causes: { title: string; likelihood: 'high' | 'medium' | 'low'; explanation: string }[];
  solutions: { title: string; steps: string[]; difficulty: 'easy' | 'medium' | 'hard' }[];
}

export interface ExportBundle {
  exportVersion: 1;
  exportedAt: number;
  appVersion: string;
  schemaVersion: number;
  bakes: BakeJournalEntry[];
  photos: { id: string; bakeId: string; dataUrl: string; width: number; height: number; takenAt: number }[];
  timerSessions: TimerSession[];
  chatMessages?: ChatMessage[];
  settings: Settings;
}
```

-----

## Design-System-Grundlagen

### Farbpalette (CSS Custom Properties)

```css
:root {
  /* Primärfarben – Italienische Trattoria */
  --color-pomodoro: oklch(58% 0.18 28);        /* Tomatenrot, Akzent */
  --color-terracotta: oklch(64% 0.12 45);       /* Wärme, Hover-States */
  --color-oliva: oklch(48% 0.08 130);           /* Olivgrün, Erfolg */
  --color-farina: oklch(94% 0.02 80);           /* Mehl-Beige, Hintergründe */
  --color-forno: oklch(18% 0.02 50);            /* Forno-Schwarz, Text */
  --color-pergamena: oklch(98% 0.01 80);        /* Pergament, Cards */

  /* Funktionalfarben */
  --color-bg: var(--color-pergamena);
  --color-surface: var(--color-farina);
  --color-text: var(--color-forno);
  --color-text-muted: oklch(45% 0.02 50);
  --color-accent: var(--color-pomodoro);
  --color-success: var(--color-oliva);
  --color-warning: oklch(75% 0.15 70);
  --color-border: oklch(85% 0.02 80);

  /* Spacing-Skala */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* Typografie */
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Radien */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}

[data-theme="forno"] {
  --color-bg: var(--color-forno);
  --color-surface: oklch(22% 0.02 50);
  --color-text: var(--color-farina);
  --color-text-muted: oklch(70% 0.02 50);
  --color-border: oklch(28% 0.02 50);
}
```

### Typografie

- **Display: Fraunces** (Google Fonts, Variable Font). Serif mit Charakter, leichte Italianità ohne Klischee. Für H1, Section-Header wie “La Maturazione”, Hero-Texte.
- **Body: Inter** (Google Fonts). Saubere, moderne Sans-Serif fürs UI. Lesbar auf jedem Bildschirm.
- **Mono: JetBrains Mono** für Rechner-Outputs (Mengen, Prozente).

Selbst gehostet via `@fontsource` – verhindert Privacy-Probleme mit Google Fonts in DE und macht offline-first ehrlich.

### Forno-Modus

Ja, von Anfang an. Begründung: Pizzaioli backen oft abends bei wenig Licht. CSS-only via `prefers-color-scheme` + manueller Toggle. Theme-Switch im Header, persistiert in Settings.

### Komponenten-Liste für MVP

- `Button` (primary, ghost, danger)
- `Slider` mit numerischem Input gekoppelt (für Idratazione, Hefe-Prozent)
- `NumberInput` mit +/- Buttons (Mobile-friendly)
- `Card` (für Rezepte, Backjournal-Einträge)
- `Tabs` (Direktteig vs. Vorteig)
- `ResultDisplay` (große Zahl + Einheit + Erklär-Tooltip)
- `FormulaBlock` (zeigt Bäckerprozent-Formel)
- `RecipeCard` mit Mini-Meta (Stil, Maturazione, Schwierigkeit)
- `Timer` (Countdown + Progress-Ring)
- `EmptyState` (Backjournal leer)
- `ToastNotification`

-----

## Local-First-Spezifika

### Datenmigrationen ohne Backend

Jede Entity hat `schemaVersion`. Beim App-Start:

1. Lese aktuelle Schema-Version aus DB
1. Wenn niedriger als `CURRENT_SCHEMA_VERSION`: Auto-Backup als JSON in localStorage anlegen
1. Migration-Steps der Reihe nach durchlaufen via Dexie’s `version().upgrade()`
1. Bei Fail: Rollback-Hinweis mit Download des Backups

**Goldene Regel:** Migrations sind nur additiv oder transformativ, nie destruktiv. Wer ein Feld umbenennt, behält das alte für 2 Versionen parallel.

### Export-/Import-Strategie

- **Export-Format:** JSON mit Top-Level `exportVersion` (unabhängig von DB-Schema), `appVersion`, `schemaVersion`
- **Fotos:** als Base64-DataURLs im JSON (im Export ist Größe ok), in Phase 4 alternativ ZIP mit separaten Files
- **Import:** Validierung mit Zod-Schema, bei Schema-Mismatch: Migrate vor Insert
- **Dateinamen:** `lievito-export-2026-04-25.json` mit Datum

### Storage-Limits

- **iOS Safari:** ca. 50% des freien Speichers, aber löscht aggressiv bei Inaktivität
- **Android Chrome:** quota groß, aber respekt vor `navigator.storage.persist()`
- **Strategie:**
  - Auf erstem Bake-Eintrag: `navigator.storage.persist()` anfordern
  - Quota-Anzeige in Settings (`navigator.storage.estimate()`)
  - Warnung ab 80% Auslastung
  - Bei 95%: harte Sperre für neue Fotos, nur Text-Einträge erlauben

### Multi-Device-Realität

Klar kommunizieren: ein Gerät = eine Datenbank. Sync ist nicht da und nicht geplant. Workflow für Multi-Device-Nutzer:

- Export auf Phone → Import auf Desktop
- Kein Auto-Merge, Import bietet “Ersetzen” oder “Hinzufügen”
- Einträge haben UUIDs → Duplikate werden bei “Hinzufügen” erkannt und übersprungen

### Datenschutz-Story als Marketing-Asset

Eigener Footer-Text: “Deine Bakes verlassen dein Gerät nie. Keine Cookies, kein Tracking, kein Account. Nur du, dein Teig und Lievito.” Das ist 2026 ein ehrlicher Wettbewerbsvorteil und passt perfekt zur handwerklichen Marke.

-----

## Out-of-Scope (bewusst nicht)

- User-Accounts, Login, Passwörter
- Cloud-Sync zwischen Geräten
- Social Features, Likes, Kommentare
- User-Generated-Content (eingereichte Rezepte)
- Mehrsprachigkeit (DE only in V1, EN frühestens nach 1000 Nutzern)
- Native iOS/Android Apps
- Marketplace, Shop, Partnerprogramme
- Rezept-Sharing-Plattform
- Community-Forum
- Backofen-Integration (Smart-Home)

Wenn jemand danach fragt: “Lievito ist deine persönliche Werkstatt, kein soziales Netzwerk.”

-----

## MVP-Definition

**Das eine Feature im Zentrum: Direktteig-Rechner mit URL-State.**

Das ist die kleinste live-fähige Version. Alles andere ist Add-On. Begründung:

- Funktioniert isoliert, ohne Persistenz, ohne PWA, ohne KI
- Sofort teilbar via URL → organisches Wachstum
- SEO-Hebel: “Pizzateig Rechner” ist eine echte Suchanfrage
- Lehrt das Kern-Setup (SvelteKit + Runes + URL-State)
- Kann in 2 Wochenenden stehen, in 4 poliert sein

Mit drei statischen Rezepten und PWA-Installierbarkeit als ersten Erweiterungen ist die App nach Phase 1 ein vollwertiges, ehrliches Produkt – auch ohne Backjournal und KI.

-----

## Meilensteine (Gesamt)

1. Erstes leeres SvelteKit-Projekt deployed (Phase 0)
1. Direktteig-Rechner Neapolitanisch funktioniert lokal (Phase 1)
1. Rechner-Ergebnisse via URL teilbar, Round-Trip getestet (Phase 1)
1. PWA-Manifest + Icons komplett (Phase 1)
1. App auf iOS Homescreen installierbar (Phase 1)
1. Service Worker liefert Rechner offline aus (Phase 1)
1. Erster Bake im Backjournal mit Foto gespeichert (Phase 2)
1. JSON-Export/Import roundtrip-getestet (Phase 2)
1. Poolish-Rechner mit korrekten Vorteig-Mengen (Phase 2)
1. IndexedDB-Schema-Migration v1 → v2 erfolgreich (Phase 2)
1. Drei parallele Timer laufen, Reopen funktioniert (Phase 2)
1. Erste Streaming-KI-Antwort live im Browser (Phase 3)
1. Rate-Limit pro IP nachweislich greift (Phase 3)
1. Push-Notification weckt bei Stockgare-Ende auf Android (Phase 3)
1. Mehl-Lexikon-Seite live (Phase 3)
1. Lighthouse-Vollscore Mobile + Desktop (Phase 4)
1. Tab-Navigation durch komplette App ohne Maus (Phase 4)
1. ZIP-Export inkl. 50 Fotos roundtrip-getestet (Phase 4)
1. 1. Rezept veröffentlicht (Phase 4)
1. OG-Image dynamisch generiert für Rechner-Sharing (Phase 4)

-----

## Lerneffekt-Übersicht

|Phase    |Konkrete Lernpunkte                                                                                                                        |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------|
|Antipasto|Svelte 5 Runes Setup, Cloudflare Pages Deployment, Design-Token-Disziplin                                                                  |
|Primo    |URL-State unter Runes, MDsvex, Service-Worker-Strategien, statisches Deployment, Lighthouse-Tuning                                         |
|Secondo  |Dexie mit echten Migrations, Service Worker als Timer-State-Holder, Browser-Bildverarbeitung, JSON-Schema-Versionierung                    |
|Contorno |Anthropic-API-Streaming via SvelteKit, Cloudflare KV für Rate-Limits, Web-Push cross-platform, Prompt-Engineering für strukturierten Output|
|Dolce    |Accessibility-Audit-Praxis, OG-Image-Generation, Schema.org-Markup, Microinteraction-Design, Content-Strategie                             |

-----

## Offene Fragen an den Product Owner

1. **Zielgruppe-Schärfung:** Eher absolute Anfänger oder Fortgeschrittene? Beeinflusst Tonalität der Erklärtexte und Default-Werte massiv.
1. **Forno-Pizza-Fokus:** Wie wichtig ist Holzofen vs. Haushaltsofen? Braucht der Rechner Ofen-Profile?
1. **Lievito Madre:** Phase 2 oder erst Phase 3? Die Mathe ist komplex (Hydration des Vorteigs in Hauptteig-Hydration einrechnen) und die Zielgruppe klein.
1. **KI-Budget:** Was ist die monatliche Schmerzgrenze für API-Kosten? Bestimmt, ob Turnstile reicht oder ob ein zusätzlicher Anti-Abuse-Layer (z. B. minimale Session-Captcha) nötig ist.
1. **Content-Strategie:** Schreibst du die Rezepte selbst oder gibt es eine Quelle/Co-Autor? 15 gute Rezepte sind 5+ Wochenenden Schreibarbeit.
1. **Branding:** Logo, Wortmarke, Favicon – externe Hilfe oder Eigenbau? Beeinflusst Phase 0.
1. **Analytics:** Plausible/Umami selbst gehostet oder gar nichts? Ohne Daten ist das Marketing blind, mit Daten bröckelt das Privacy-Versprechen leicht.
1. **Domain & Branding:** lievito.app verfügbar? .de? Klärung früh, da OG-Images und Manifest darauf referenzieren.
1. **iOS-First oder Cross-Platform:** Wo liegt der eigene Daily-Driver? Bestimmt, wo zuerst getestet wird.
1. **Endpunkt:** Was bedeutet “fertig” für dich? Phase 4 abschließen und einfrieren? Oder Living Project mit kontinuierlichen Erweiterungen?