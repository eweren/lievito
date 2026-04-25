// OG-Image-Funktion: liefert einen Recipe-/Rechner-OG als SVG.
// SVG ist als og:image schwächer unterstützt als PNG, deckt aber
// Twitter, LinkedIn und Telegram ab. PNG-Variante via @cf-wasm/og
// wäre der nächste Schritt – dafür braucht es WASM-Edge.

interface OgQuery {
  title?: string;
  subtitle?: string;
  badge?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestGet: any = async (context: { request: Request }) => {
  const url = new URL(context.request.url);
  const params: OgQuery = {
    title: url.searchParams.get('title') ?? 'Lievito',
    subtitle: url.searchParams.get('subtitle') ?? 'Die Pizzateig-Werkstatt',
    badge: url.searchParams.get('badge') ?? undefined
  };
  const svg = renderSvg(params);
  return new Response(svg, {
    status: 200,
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=86400, s-maxage=86400'
    }
  });
};

function renderSvg({ title, subtitle, badge }: OgQuery): string {
  const safeTitle = escapeXml(title ?? 'Lievito');
  const safeSubtitle = escapeXml(subtitle ?? '');
  const safeBadge = badge ? escapeXml(badge) : null;

  // 1200×630, beige Pergament-Hintergrund, große Display-Schrift.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fbf8f3"/>
      <stop offset="1" stop-color="#f1e8d5"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="980" cy="510" r="240" fill="#e6c98f" opacity="0.4"/>
  <circle cx="220" cy="120" r="160" fill="#c8362b" opacity="0.12"/>
  <text x="80" y="140" font-family="Georgia, 'Times New Roman', serif" font-size="32" font-weight="500" fill="#c8362b" letter-spacing="6">LIEVITO</text>
  ${safeBadge ? `<text x="80" y="200" font-family="ui-monospace, monospace" font-size="22" fill="#5a8341" letter-spacing="4">${safeBadge.toUpperCase()}</text>` : ''}
  ${wrapTitle(safeTitle, 80, 280)}
  <text x="80" y="540" font-family="Inter, system-ui, sans-serif" font-size="32" fill="#5a3b1a">${safeSubtitle}</text>
  <text x="80" y="585" font-family="ui-monospace, monospace" font-size="20" fill="#7a5430" letter-spacing="2">lievito.app</text>
</svg>`;
}

function wrapTitle(title: string, x: number, y: number): string {
  // Sehr einfacher Zeilenumbruch nach Wortgrenzen, max ~22 Zeichen pro Zeile,
  // max 3 Zeilen. Reicht für Rezeptnamen.
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > 22 && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
    if (lines.length === 3) break;
  }
  if (lines.length < 3 && current) lines.push(current);
  const lineHeight = 88;
  return lines
    .map(
      (line, i) =>
        `<text x="${x}" y="${y + i * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="78" font-weight="700" fill="#1a1208">${line}</text>`
    )
    .join('\n');
}

function escapeXml(text: string): string {
  return text.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}
