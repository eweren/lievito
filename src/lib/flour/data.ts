// Mehl-Lexikon. Bewusst keine Marken, sondern Sorten. W-Wert (gemessen
// am Chopin-Alveograph, P/L-Verhältnis als Begleitwert) ist optional,
// weil viele Hersteller ihn nicht angeben.

export type FlourCategory =
  | 'tipo-00'
  | 'tipo-0'
  | 'tipo-1'
  | 'tipo-2'
  | 'integrale'
  | 'manitoba'
  | 'speziale';

export interface FlourEntry {
  id: string;
  name: string;
  category: FlourCategory;
  origin: string;
  proteinPercent: [number, number];
  wValue?: [number, number];
  pToL?: [number, number];
  description: string;
  bestFor: string[];
  notSuitable?: string[];
  hydrationRange: [number, number];
  maturationRange: [number, number]; // Stunden
}

export const CATEGORIES: { id: FlourCategory; label: string }[] = [
  { id: 'tipo-00', label: 'Tipo 00' },
  { id: 'tipo-0', label: 'Tipo 0' },
  { id: 'tipo-1', label: 'Tipo 1' },
  { id: 'tipo-2', label: 'Tipo 2' },
  { id: 'integrale', label: 'Integrale (Vollkorn)' },
  { id: 'manitoba', label: 'Manitoba' },
  { id: 'speziale', label: 'Spezial' }
];

export const FLOURS: FlourEntry[] = [
  {
    id: 'tipo-00-pizza',
    name: 'Tipo 00 „Pizza"',
    category: 'tipo-00',
    origin: 'Italien',
    proteinPercent: [11, 13],
    wValue: [240, 320],
    pToL: [0.45, 0.65],
    description:
      'Der Klassiker für Neapoletana und kurze direkte Teige. Feinste Ausmahlung, hellweiß, niedriger Aschegehalt.',
    bestFor: ['Neapoletana', 'Romana tonda', 'kurze Stockgare'],
    hydrationRange: [0.58, 0.7],
    maturationRange: [8, 36]
  },
  {
    id: 'tipo-00-lunga',
    name: 'Tipo 00 „Lunga lievitazione"',
    category: 'tipo-00',
    origin: 'Italien',
    proteinPercent: [12, 14],
    wValue: [330, 400],
    pToL: [0.45, 0.65],
    description:
      'Hoher W-Wert, bindet viel Wasser, hält 48–72 h Reife problemlos aus. Ideal für Kühlschrankreife.',
    bestFor: ['lange Maturazione', 'Vorteig (Poolish/Biga)', 'Pinsa'],
    hydrationRange: [0.62, 0.78],
    maturationRange: [24, 72]
  },
  {
    id: 'tipo-0-pizza',
    name: 'Tipo 0',
    category: 'tipo-0',
    origin: 'Italien',
    proteinPercent: [11, 13],
    wValue: [220, 300],
    description:
      'Etwas höherer Mineralstoffgehalt als Tipo 00, leicht gelblicher Ton, vollerer Geschmack.',
    bestFor: ['New York Style', 'Pan/Detroit', 'klassisches Brot'],
    hydrationRange: [0.6, 0.72],
    maturationRange: [12, 48]
  },
  {
    id: 'tipo-1',
    name: 'Tipo 1',
    category: 'tipo-1',
    origin: 'Italien',
    proteinPercent: [11, 13],
    wValue: [260, 320],
    description:
      'Halbweiß, deutlich aromatischer als 00, behält mehr Schale und Keimling. Trifft viele aktuelle Pizza-Trends in Italien.',
    bestFor: ['rustikale Neapoletana', 'lange Reife', 'sourdough-freundlich'],
    hydrationRange: [0.65, 0.78],
    maturationRange: [24, 72]
  },
  {
    id: 'tipo-2',
    name: 'Tipo 2',
    category: 'tipo-2',
    origin: 'Italien',
    proteinPercent: [11, 13],
    wValue: [240, 300],
    description:
      'Halbgrobe Vermahlung, kräftigerer Ton, mehr Mineralien. Erfordert mehr Wasser und Geduld.',
    bestFor: ['rustikale Pizza', 'Sourdough-Pizza', 'Backstein/Holzofen'],
    hydrationRange: [0.7, 0.82],
    maturationRange: [24, 72]
  },
  {
    id: 'integrale',
    name: 'Vollkornmehl (Integrale)',
    category: 'integrale',
    origin: 'EU',
    proteinPercent: [12, 14],
    description:
      'Volles Korn inkl. Schale und Keimling. Sehr aromatisch, aber der Kleberanteil leidet — selten 100 % einsetzbar.',
    bestFor: ['Beimischung 10–30 %', 'Volkornpizza mit Sauerteig'],
    notSuitable: ['100 % für Neapoletana'],
    hydrationRange: [0.7, 0.85],
    maturationRange: [24, 60]
  },
  {
    id: 'manitoba',
    name: 'Manitoba',
    category: 'manitoba',
    origin: 'Kanada / IT-Verschnitt',
    proteinPercent: [13, 15],
    wValue: [340, 420],
    description:
      'Sehr proteinstark, beste Wasserabsorption. Allein zu zäh — 20–40 % Beimischung in „normales" Mehl liefert mehr Stabilität für lange Reife.',
    bestFor: ['Stärke-Boost', 'lange Kühlschrankreife', 'Pan-Style'],
    notSuitable: ['100 % für klassische Neapoletana (zu kleberstark)'],
    hydrationRange: [0.65, 0.82],
    maturationRange: [24, 72]
  },
  {
    id: 'kamut',
    name: 'Kamut (Khorasan)',
    category: 'speziale',
    origin: 'Khorasan / IT-Mühlen',
    proteinPercent: [13, 15],
    description:
      'Urweizen mit nussig-süßem Geschmack, gelblicher Krume. Bindet Wasser zögerlich.',
    bestFor: ['Sourdough-Pizza', 'Beimischung 20–40 %'],
    hydrationRange: [0.65, 0.78],
    maturationRange: [24, 60]
  },
  {
    id: 'farro',
    name: 'Dinkel (Farro)',
    category: 'speziale',
    origin: 'Italien',
    proteinPercent: [12, 14],
    description:
      'Kleberweicher als Weichweizen. Toleriert keine extreme Knetung — sanft kneten, lange ruhen lassen.',
    bestFor: ['Beimischung 20–40 %', 'milde Aromen'],
    notSuitable: ['100 % für hochhydrierte Teige'],
    hydrationRange: [0.6, 0.72],
    maturationRange: [12, 48]
  },
  {
    id: 'segale',
    name: 'Roggenmehl (Segale)',
    category: 'speziale',
    origin: 'EU',
    proteinPercent: [8, 10],
    description:
      'Wenig Kleber, viel Geschmack. Nur als Beimischung (5–15 %) verwenden, sonst kollabiert die Krume.',
    bestFor: ['Aroma-Beimischung', 'Sauerteig'],
    notSuitable: ['allein für Pizza-Teig'],
    hydrationRange: [0.6, 0.75],
    maturationRange: [12, 48]
  },
  {
    id: 'semola-rimacinata',
    name: 'Semola di grano duro rimacinata',
    category: 'speziale',
    origin: 'Süditalien',
    proteinPercent: [12, 14],
    description:
      'Doppelt vermahlene Hartweizenmischung. Gibt Pizza al taglio römischer Tradition mehr Biss; oft als Streumehl beim Ausstreichen.',
    bestFor: ['Pizza al taglio', 'Streumehl', 'Apulische Focaccia'],
    hydrationRange: [0.65, 0.8],
    maturationRange: [24, 48]
  },
  {
    id: 'tipo-00-pinsa',
    name: 'Pinsa-Mehlmischung',
    category: 'speziale',
    origin: 'Italien',
    proteinPercent: [12, 14],
    description:
      'Mischung aus Weichweizen, Reis- und Sojamehl. Ergibt knusprige Pinsa-Romana mit hoher Hydration.',
    bestFor: ['Pinsa Romana', 'Bauernbrot mit langer Reife'],
    hydrationRange: [0.78, 0.9],
    maturationRange: [24, 72]
  },
  {
    id: 'maisgriess-fein',
    name: 'Maisgrieß (fein)',
    category: 'speziale',
    origin: 'IT/AT',
    proteinPercent: [7, 9],
    description:
      'Kein Kleber, daher nur als Streumehl auf der Schiebepala oder dem Backstein. Verhindert Anhaften ohne Mehlgeschmack.',
    bestFor: ['Streumehl', 'Pala', 'Backstein-Boden'],
    notSuitable: ['allein im Teig'],
    hydrationRange: [0, 0],
    maturationRange: [0, 0]
  },
  {
    id: 'reismehl',
    name: 'Reismehl',
    category: 'speziale',
    origin: 'Asien / EU',
    proteinPercent: [6, 8],
    description:
      'Gluten-frei, häufig in Pinsa-Mischungen. Hilft bei Knusprigkeit, kann Wasser binden, ohne Gluten zu strecken.',
    bestFor: ['Pinsa-Mischung 5–10 %', 'Streumehl'],
    notSuitable: ['allein für Pizza'],
    hydrationRange: [0, 0],
    maturationRange: [0, 0]
  },
  {
    id: 'gluten-frei-mix',
    name: 'Glutenfreier Pizzamehl-Mix',
    category: 'speziale',
    origin: 'EU',
    proteinPercent: [3, 8],
    description:
      'Industrielle Mischung aus Reis-, Mais- und Buchweizenmehl mit Hydrokolloiden. Funktioniert nur mit den im Datenblatt angegebenen Werten.',
    bestFor: ['glutenfreie Pizza', 'Spezialdiät'],
    hydrationRange: [0.7, 0.95],
    maturationRange: [2, 24]
  },
  {
    id: 'tipo-00-bio',
    name: 'Tipo 00 Bio (mittelstark)',
    category: 'tipo-00',
    origin: 'Italien',
    proteinPercent: [11, 13],
    wValue: [260, 320],
    description:
      'Bio-Variante eines mittelstarken Tipo 00. Etwas weniger Reife-Toleranz als die hochkonzentrierten Profimehle, dafür sauberer Anbau.',
    bestFor: ['24–48 h Reife', 'Neapoletana mit Bio-Anspruch'],
    hydrationRange: [0.6, 0.72],
    maturationRange: [12, 48]
  }
];
