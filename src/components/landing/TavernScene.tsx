"use client";

/**
 * Cena da "mesa inicial": um grupo de aventureiros bem diferentes entre si,
 * sentados à mesa de uma taverna, jogando — a ideia visual por trás do nome
 * "Taverna Inicial": aqui, você senta à mesa e é quem quiser ser.
 *
 * Tudo desenhado à mão em SVG (sem fotos nem imagens externas), no mesmo estilo
 * "chapado com sombra" já usado no restante do app (ver SceneryArt.tsx) — leve
 * de carregar e combinando com a identidade visual de madeira/pergaminho/latão.
 */

type Hero = {
  x: number;
  skin: string;
  outfit: string;
  outfitDark: string;
  accent: string;
  kind: "barbaro" | "mago" | "arqueira" | "clerigo";
};

const HEROES: Hero[] = [
  { x: 150, skin: "#c98a5e", outfit: "#6b2a20", outfitDark: "#4a1c16", accent: "#e6c987", kind: "barbaro" },
  { x: 345, skin: "#e8c39a", outfit: "#2e4a7a", outfitDark: "#1f3357", accent: "#c9a8e6", kind: "mago" },
  { x: 545, skin: "#8a6a4a", outfit: "#3f6b2a", outfitDark: "#2a4a1c", accent: "#e6c987", kind: "arqueira" },
  { x: 740, skin: "#d9a876", outfit: "#8d6a2c", outfitDark: "#6b4a1c", accent: "#fbeed3", kind: "clerigo" },
];

export function TavernScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 520" className={className} role="img" aria-label="Quatro aventureiros bem diferentes, sentados à mesa de uma taverna">
      <defs>
        <radialGradient id="ts-fire" cx="12%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#ffb25c" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffb25c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ts-lantern" cx="88%" cy="30%" r="40%">
          <stop offset="0%" stopColor="#ffe6a8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffe6a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ts-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1c12" />
          <stop offset="100%" stopColor="#1a1008" />
        </linearGradient>
        <radialGradient id="ts-table" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#a8783f" />
          <stop offset="100%" stopColor="#6b4a26" />
        </radialGradient>
        <linearGradient id="ts-map" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8d9ae" />
          <stop offset="100%" stopColor="#d3bd84" />
        </linearGradient>
      </defs>

      {/* Parede de madeira ao fundo */}
      <rect width="900" height="520" fill="url(#ts-wall)" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={i * 95} y={0} width={1.5} height={520} fill="#000" opacity={0.18} />
      ))}
      <rect x="0" y="40" width="900" height="14" fill="#3b2618" />
      <rect x="0" y="40" width="900" height="4" fill="#5a3a24" />

      {/* Brilho da lareira (esquerda) e do lampião (direita) */}
      <rect width="900" height="520" fill="url(#ts-fire)" />
      <rect width="900" height="520" fill="url(#ts-lantern)" />

      {/* Lampiões pendurados na trave */}
      <g stroke="#1a1008" strokeWidth="2">
        <line x1="220" y1="54" x2="220" y2="110" />
        <line x1="680" y1="54" x2="680" y2="95" />
      </g>
      <g>
        <ellipse cx="220" cy="122" rx="16" ry="20" fill="#e6c987" opacity="0.9" />
        <ellipse cx="220" cy="122" rx="9" ry="13" fill="#ffe6a8" />
        <ellipse cx="680" cy="106" rx="14" ry="18" fill="#e6c987" opacity="0.9" />
        <ellipse cx="680" cy="106" rx="8" ry="11" fill="#ffe6a8" />
      </g>

      {/* Barris ao fundo, pra dar ambiente */}
      <g opacity="0.9">
        <rect x="40" y="300" width="60" height="80" rx="10" fill="#5a3a24" stroke="#2a1c12" strokeWidth="2" />
        <rect x="40" y="320" width="60" height="6" fill="#2a1c12" opacity="0.5" />
        <rect x="40" y="350" width="60" height="6" fill="#2a1c12" opacity="0.5" />
        <rect x="800" y="290" width="58" height="80" rx="10" fill="#5a3a24" stroke="#2a1c12" strokeWidth="2" />
        <rect x="800" y="310" width="58" height="6" fill="#2a1c12" opacity="0.5" />
        <rect x="800" y="340" width="58" height="6" fill="#2a1c12" opacity="0.5" />
      </g>

      {/* Os quatro heróis, sentados */}
      {HEROES.map((h) => (
        <Hero key={h.x} hero={h} />
      ))}

      {/* Mesa redonda com o que não pode faltar numa sessão */}
      <ellipse cx="450" cy="430" rx="340" ry="80" fill="url(#ts-table)" stroke="#3f2614" strokeWidth="5" />
      <ellipse cx="450" cy="430" rx="340" ry="80" fill="none" stroke="#2a1c12" strokeOpacity="0.25" strokeWidth="1" />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx="450" cy="430" rx={300 - i * 60} ry={70 - i * 14} fill="none" stroke="#3f2614" strokeOpacity="0.3" strokeWidth="2" />
      ))}

      {/* Mapa de pergaminho no centro */}
      <g transform="translate(450 420) rotate(-6)">
        <rect x="-95" y="-62" width="190" height="124" rx="4" fill="url(#ts-map)" stroke="#8d6a2c" strokeWidth="2" />
        <path d="M -75 -30 Q -40 -50 0 -28 T 75 -20" fill="none" stroke="#8d6a2c" strokeWidth="2" opacity="0.7" />
        <path d="M -60 10 Q -10 -5 40 15 T 80 30" fill="none" stroke="#8d6a2c" strokeWidth="2" opacity="0.7" />
        <circle cx="30" cy="-10" r="5" fill="#a8431f" opacity="0.8" />
        <path d="M 30 -10 l -4 10 l 8 0 Z" fill="#a8431f" opacity="0.8" />
      </g>

      {/* Dados, canecas e vela espalhados */}
      <Die x={610} y={392} r={16} />
      <Die x={290} y={400} r={13} />
      <Mug x={360} y={455} />
      <Mug x={560} y={460} />
      <Candle x={450} y={345} />
    </svg>
  );
}

function Hero({ hero: h }: { hero: Hero }) {
  const y = 300;
  return (
    <g transform={`translate(${h.x} ${y})`}>
      {/* Sombra de contato */}
      <ellipse cx="0" cy="150" rx="70" ry="16" fill="#000" opacity="0.28" />

      {/* Corpo / torso */}
      <path d="M -62 150 Q -68 70 -40 40 L 40 40 Q 68 70 62 150 Z" fill={h.outfit} stroke={h.outfitDark} strokeWidth="3" />
      {/* Cinto */}
      <rect x="-45" y="95" width="90" height="12" fill={h.outfitDark} />
      <rect x="-7" y="93" width="14" height="16" rx="2" fill={h.accent} stroke={h.outfitDark} strokeWidth="1.5" />

      {/* Braços apoiados na mesa */}
      <ellipse cx="-58" cy="128" rx="16" ry="30" fill={h.outfit} stroke={h.outfitDark} strokeWidth="3" transform="rotate(-18 -58 128)" />
      <ellipse cx="58" cy="128" rx="16" ry="30" fill={h.outfit} stroke={h.outfitDark} strokeWidth="3" transform="rotate(18 58 128)" />
      <circle cx="-68" cy="150" r="11" fill={h.skin} stroke={h.outfitDark} strokeWidth="2" />
      <circle cx="68" cy="150" r="11" fill={h.skin} stroke={h.outfitDark} strokeWidth="2" />

      {/* Pescoço + cabeça */}
      <rect x="-12" y="18" width="24" height="26" fill={h.skin} />
      <circle cx="0" cy="-10" r="42" fill={h.skin} stroke="#2a1c12" strokeWidth="2.5" />
      {/* Rosto simples e simpático */}
      <circle cx="-15" cy="-12" r="4" fill="#2a1c12" />
      <circle cx="15" cy="-12" r="4" fill="#2a1c12" />
      <path d="M -12 6 Q 0 14 12 6" fill="none" stroke="#5a3a24" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="-20" cy="2" rx="7" ry="4" fill="#a8431f" opacity="0.25" />
      <ellipse cx="20" cy="2" rx="7" ry="4" fill="#a8431f" opacity="0.25" />

      <HeroDetails hero={h} />
    </g>
  );
}

function HeroDetails({ hero: h }: { hero: Hero }) {
  if (h.kind === "barbaro")
    return (
      <>
        {/* Elmo com chifres curvos, virados para os lados */}
        <path d="M -40 -22 Q 0 -50 40 -22 Q 40 -36 0 -40 Q -40 -36 -40 -22 Z" fill={h.outfitDark} stroke="#1a1008" strokeWidth="2" />
        <path d="M -30 -36 Q -70 -40 -78 -70 Q -64 -78 -46 -58 Q -32 -44 -30 -36 Z" fill="#e3d2ad" stroke="#8d6a2c" strokeWidth="2" />
        <path d="M 30 -36 Q 70 -40 78 -70 Q 64 -78 46 -58 Q 32 -44 30 -36 Z" fill="#e3d2ad" stroke="#8d6a2c" strokeWidth="2" />
        <path d="M -78 -70 Q -72 -64 -64 -66" fill="none" stroke="#8d6a2c" strokeWidth="1.5" opacity="0.6" />
        <path d="M 78 -70 Q 72 -64 64 -66" fill="none" stroke="#8d6a2c" strokeWidth="1.5" opacity="0.6" />
        {/* Manto de pele no ombro */}
        <path d="M -62 40 Q -30 20 0 30 L -10 60 Q -45 55 -62 70 Z" fill="#f6ecd4" opacity="0.9" />
        {/* Machado apoiado */}
        <g transform="translate(78 60) rotate(18)">
          <rect x="-4" y="-50" width="8" height="90" rx="3" fill="#6b4a2a" />
          <path d="M -4 -50 L -28 -66 L -20 -30 Z" fill="#9a9aa0" stroke="#3a3a40" strokeWidth="2" />
        </g>
      </>
    );
  if (h.kind === "mago")
    return (
      <>
        {/* Chapéu pontudo de mago */}
        <path d="M -34 -34 L 0 -112 L 34 -34 Z" fill={h.outfit} stroke={h.outfitDark} strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="0" cy="-32" rx="46" ry="11" fill={h.outfit} stroke={h.outfitDark} strokeWidth="2.5" />
        <circle cx="0" cy="-86" r="5" fill={h.accent} />
        {/* Barba */}
        <path d="M -22 8 Q 0 34 22 8 Q 16 24 0 26 Q -16 24 -22 8 Z" fill="#e8dcc0" stroke="#c9b07a" strokeWidth="1.5" />
        {/* Cajado com orbe brilhante */}
        <g transform="translate(-80 30)">
          <rect x="-4" y="-40" width="8" height="120" rx="3" fill="#6b4a2a" />
          <circle cx="0" cy="-48" r="12" fill={h.accent} opacity="0.9" />
          <circle cx="0" cy="-48" r="20" fill={h.accent} opacity="0.25" />
        </g>
      </>
    );
  if (h.kind === "arqueira")
    return (
      <>
        {/* Capuz de caçadora */}
        <path d="M -46 -8 Q -50 -58 0 -58 Q 50 -58 46 -8 Q 46 -30 0 -36 Q -46 -30 -46 -8 Z" fill={h.outfit} stroke={h.outfitDark} strokeWidth="2.5" />
        {/* Orelhas élficas */}
        <path d="M -40 -14 L -52 -20 L -40 -4 Z" fill={h.skin} stroke="#2a1c12" strokeWidth="1.5" />
        <path d="M 40 -14 L 52 -20 L 40 -4 Z" fill={h.skin} stroke="#2a1c12" strokeWidth="1.5" />
        {/* Aljava nas costas */}
        <rect x="34" y="-18" width="16" height="50" rx="5" fill={h.outfitDark} transform="rotate(14 42 7)" />
        {/* Arco apoiado */}
        <path d="M 86 -10 Q 106 60 86 130" fill="none" stroke="#6b4a2a" strokeWidth="5" strokeLinecap="round" />
        <line x1="86" y1="-10" x2="86" y2="130" stroke="#e8dcc0" strokeWidth="1.5" />
      </>
    );
  return (
    <>
      {/* Cocar/circlet de clérigo */}
      <path d="M -40 -26 Q 0 -50 40 -26" fill="none" stroke={h.accent} strokeWidth="5" strokeLinecap="round" />
      <circle cx="0" cy="-40" r="7" fill={h.accent} stroke="#8d6a2c" strokeWidth="1.5" />
      {/* Símbolo sagrado no peito */}
      <circle cx="0" cy="70" r="14" fill={h.accent} stroke="#8d6a2c" strokeWidth="2" />
      <path d="M 0 61 V 79 M -9 70 H 9" stroke="#8d6a2c" strokeWidth="3" strokeLinecap="round" />
      {/* Cajado/maça apoiada */}
      <g transform="translate(-82 40)">
        <rect x="-4" y="-30" width="8" height="110" rx="3" fill="#8d6a2c" />
        <circle cx="0" cy="-38" r="14" fill="#c9a8a0" stroke="#6b4a2a" strokeWidth="2" />
      </g>
    </>
  );
}

function Die({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon
        points={`0,${-r} ${r * 0.87},${-r * 0.5} ${r * 0.87},${r * 0.5} 0,${r} ${-r * 0.87},${r * 0.5} ${-r * 0.87},${-r * 0.5}`}
        fill="#f6ecd4"
        stroke="#8d6a2c"
        strokeWidth="1.5"
      />
      <polygon points={`0,${-r} ${r * 0.87},${-r * 0.5} 0,0`} fill="#fff" opacity="0.5" />
      <polygon points={`0,${-r} ${-r * 0.87},${-r * 0.5} 0,0`} fill="#000" opacity="0.08" />
      <text x="0" y={r * 0.08} textAnchor="middle" fontSize={r * 0.9} fontWeight="700" fill="#a8431f">
        20
      </text>
    </g>
  );
}

function Mug({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="14" rx="18" ry="6" fill="#000" opacity="0.2" />
      <rect x="-14" y="-18" width="28" height="30" rx="4" fill="#c9a84a" stroke="#6b4a1c" strokeWidth="2" />
      <path d="M 14 -10 q 14 0 14 10 q 0 10 -14 10" fill="none" stroke="#6b4a1c" strokeWidth="4" />
      <ellipse cx="0" cy="-18" rx="14" ry="5" fill="#f6ecd4" />
    </g>
  );
}

function Candle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-6" y="0" width="12" height="26" fill="#e8dcc0" stroke="#c9b07a" strokeWidth="1.5" />
      <path d="M 0 -14 C 7 -7 7 -2 0 1 C -7 -2 -7 -7 0 -14 Z" fill="#e6862a" />
      <path d="M 0 -8 C 3 -4 3 -1 0 1 C -3 -1 -3 -4 0 -8 Z" fill="#ffe6a8" />
    </g>
  );
}
