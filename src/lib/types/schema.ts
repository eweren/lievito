// Lievito-Datenmodell. Jede Entity, die persistiert wird, trägt
// `schemaVersion`, damit Dexie-Migrationen späterer Phasen sicher
// laufen können.

export const CURRENT_SCHEMA_VERSION = 1;

export interface VersionedEntity {
  schemaVersion: number;
}

export type DoughStyle = 'neapoletana' | 'romana' | 'ny' | 'pan';

export type FlourType = 'tipo00' | 'tipo1' | 'tipo2' | 'vollkorn';

export type YeastType = 'fresh' | 'dry' | 'lievito-madre';

export type PreFermentType = 'none' | 'poolish' | 'biga' | 'lievito-madre';

export type OvenType = 'forno' | 'haushaltsofen' | 'grill';

export type Units = 'metric' | 'imperial';

export interface Settings extends VersionedEntity {
  units: Units;
  theme: 'light' | 'forno' | 'auto';
  defaultStyle: DoughStyle;
  lastBackupAt?: number;
  acceptedAiTermsAt?: number;
}

export interface DoughCalculationInput extends VersionedEntity {
  style: DoughStyle;
  pizzaCount: number;
  ballWeight: number; // Gramm
  hydration: number; // 0.55–0.85
  saltPercent: number; // typ. 2.5–3.2
  yeastType: YeastType;
  yeastPercent: number; // % auf Mehl
  preFerment: PreFermentType;
  preFermentRatio?: number; // Anteil des Vorteig-Mehls am Gesamtmehl (0–1)
  preFermentHydration?: number; // Hydration des Vorteigs (Poolish ~1.0, Biga ~0.45)
  maturationHours: number;
  maturationTemp: number; // °C
  flourType: FlourType;
  oilPercent?: number; // optional, für Pan/NY
  sugarPercent?: number; // optional, für NY
}

export interface DoughCalculationResult {
  totalDough: number;
  flour: number;
  water: number;
  salt: number;
  yeast: number;
  oil?: number;
  sugar?: number;
  preFerment?: {
    type: PreFermentType;
    flour: number;
    water: number;
    yeast: number;
    totalWeight: number;
    restHours: number;
    restTemp: number;
  };
  mainDough?: {
    flour: number;
    water: number;
    salt: number;
    yeast: number;
  };
  bulkFermentation: { hours: number; temp: number };
  ballingTime: { hours: number; temp: number };
  warnings: string[];
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
  ovenType: OvenType;
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

export interface TimerStep {
  label: string;
  durationSec: number;
  startedAt?: number;
  completedAt?: number;
}

export interface TimerSession extends VersionedEntity {
  id: string;
  recipeId?: string;
  label: string;
  startedAt: number;
  steps: TimerStep[];
  currentStepIndex: number;
  status: 'running' | 'paused' | 'completed' | 'abandoned';
}

export interface Diagnosis {
  causes: { title: string; likelihood: 'high' | 'medium' | 'low'; explanation: string }[];
  solutions: { title: string; steps: string[]; difficulty: 'easy' | 'medium' | 'hard' }[];
}

export interface ChatMessage extends VersionedEntity {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  diagnosis?: Diagnosis;
}

export interface ExportBundle {
  exportVersion: 1;
  exportedAt: number;
  appVersion: string;
  schemaVersion: number;
  bakes: BakeJournalEntry[];
  photos: {
    id: string;
    bakeId: string;
    dataUrl: string;
    width: number;
    height: number;
    takenAt: number;
  }[];
  timerSessions: TimerSession[];
  chatMessages?: ChatMessage[];
  settings: Settings;
}
