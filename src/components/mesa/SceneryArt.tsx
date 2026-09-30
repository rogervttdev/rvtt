"use client";

/**
 * Ilustrações isométricas (com volume, luz e sombra) para as peças de cenário —
 * substitui os ícones de emoji chapados por algo com "3D" de verdade sem pesar
 * o mapa: é tudo SVG vetorial, então dá pra ter dezenas na tela sem travar
 * (diferente de um WebGL por peça, que penaria com muitos objetos).
 *
 * A técnica: cada peça é montada a partir de "blocos" isométricos reutilizáveis
 * (caixa, cone, cilindro, poça) com três tons por face — topo (mais claro, luz
 * vindo de cima), face esquerda (tom médio) e face direita (mais escura) — o
 * mesmo truque usado em jogos com visual isométrico (ex.: Civilization, Monument
 * Valley) para dar sensação de profundidade sem geometria 3D de verdade.
 */
import type { SceneryDef } from "@/lib/cenario";

// ---------------------------------------------------------------------------
// Utilitário de cor: gera os tons claro/médio/escuro de uma peça a partir de
// uma única cor-base, para manter consistência de iluminação entre todas.
// ---------------------------------------------------------------------------
function shade(hex: string, percent: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + Math.round(255 * percent)));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * percent)));
  const b = Math.max(0, Math.min(255, (n & 0xff) + Math.round(255 * percent)));
  return `rgb(${r},${g},${b})`;
}

type Tones = { top: string; left: string; right: string; line: string };
function tones(base: string): Tones {
  return { top: shade(base, 0.32), left: shade(base, 0.02), right: shade(base, -0.22), line: shade(base, -0.42) };
}

/** Sombra de contato no chão — dá a sensação de que a peça "pousa" na casa do grid. */
function GroundShadow({ cx, cy, rx, ry = rx * 0.42 }: { cx: number; cy: number; rx: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#1a1008" opacity={0.32} />;
}

/** Caixa isométrica (3 faces visíveis): base de paredes, móveis, baús, portas… */
function IsoBox({ cx, cy, w, h, depth, c }: { cx: number; cy: number; w: number; h: number; depth: number; c: Tones }) {
  const hw = w / 2;
  const hd = depth / 2;
  const top = cy - h;
  return (
    <g stroke={c.line} strokeWidth={0.6} strokeLinejoin="round">
      <polygon points={`${cx - hw},${top - hd / 2} ${cx},${top - hd} ${cx + hw},${top - hd / 2} ${cx},${top}`} fill={c.top} />
      <polygon points={`${cx - hw},${top - hd / 2} ${cx},${top} ${cx},${cy} ${cx - hw},${cy - hd / 2}`} fill={c.left} />
      <polygon points={`${cx + hw},${top - hd / 2} ${cx},${top} ${cx},${cy} ${cx + hw},${cy - hd / 2}`} fill={c.right} />
    </g>
  );
}

/** Cone isométrico (copa de árvore, telhado, tocha) — topo pontudo com duas faces sombreadas. */
function IsoCone({ cx, cy, w, h, c }: { cx: number; cy: number; w: number; h: number; c: Tones }) {
  const hw = w / 2;
  return (
    <g stroke={c.line} strokeWidth={0.6} strokeLinejoin="round">
      <polygon points={`${cx},${cy - h} ${cx - hw},${cy} ${cx},${cy + hw * 0.32}`} fill={c.left} />
      <polygon points={`${cx},${cy - h} ${cx + hw},${cy} ${cx},${cy + hw * 0.32}`} fill={c.right} />
    </g>
  );
}

/** Cilindro isométrico (tronco, tocha, barril) — corpo + topo elíptico. */
function IsoCylinder({ cx, cy, w, h, c }: { cx: number; cy: number; w: number; h: number; c: Tones }) {
  const hw = w / 2;
  const ry = hw * 0.4;
  return (
    <g stroke={c.line} strokeWidth={0.5}>
      <path d={`M ${cx - hw} ${cy} A ${hw} ${ry} 0 0 0 ${cx + hw} ${cy} L ${cx + hw} ${cy - h} A ${hw} ${ry} 0 0 1 ${cx - hw} ${cy - h} Z`} fill={c.right} />
      <ellipse cx={cx} cy={cy - h} rx={hw} ry={ry} fill={c.top} />
    </g>
  );
}

/** Poça/terreno plano (água, lama, buraco) — disco com aro e brilho leve. */
function IsoGround({ cx, cy, rx, c, ring }: { cx: number; cy: number; rx: number; c: Tones; ring?: string }) {
  const ry = rx * 0.5;
  return (
    <g>
      {ring && <ellipse cx={cx} cy={cy} rx={rx * 1.12} ry={ry * 1.12} fill={ring} />}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={c.right} stroke={c.line} strokeWidth={0.6} />
      <ellipse cx={cx - rx * 0.18} cy={cy - ry * 0.22} rx={rx * 0.42} ry={ry * 0.3} fill={c.top} opacity={0.55} />
    </g>
  );
}

/** Labareda simples (fogueira, tocha) — duas camadas de chama em degradê quente. */
function Flame({ cx, cy, w, h }: { cx: number; cy: number; w: number; h: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy + h * 0.15} rx={w * 0.55} ry={h * 0.22} fill="#000" opacity={0.18} />
      <path d={`M ${cx} ${cy - h} C ${cx + w * 0.55} ${cy - h * 0.35}, ${cx + w * 0.3} ${cy - h * 0.05}, ${cx} ${cy + h * 0.05} C ${cx - w * 0.3} ${cy - h * 0.05}, ${cx - w * 0.55} ${cy - h * 0.35}, ${cx} ${cy - h} Z`} fill="#e6862a" />
      <path d={`M ${cx} ${cy - h * 0.62} C ${cx + w * 0.28} ${cy - h * 0.28}, ${cx + w * 0.16} ${cy - h * 0.02}, ${cx} ${cy + h * 0.02} C ${cx - w * 0.16} ${cy - h * 0.02}, ${cx - w * 0.28} ${cy - h * 0.28}, ${cx} ${cy - h * 0.62} Z`} fill="#f7c948" />
    </g>
  );
}

const VB = "0 0 100 86";
const FLOOR_Y = 68;

function Wall({ base }: { base: string }) {
  const c = tones(base);
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 6} rx={30} />
      <IsoBox cx={30} cy={FLOOR_Y} w={26} h={30} depth={16} c={c} />
      <IsoBox cx={60} cy={FLOOR_Y} w={26} h={36} depth={16} c={c} />
      <IsoBox cx={82} cy={FLOOR_Y} w={20} h={26} depth={14} c={tones(shade(base, -0.05))} />
    </svg>
  );
}

function Fence({ base }: { base: string }) {
  const c = tones(base);
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 6} rx={32} />
      {[18, 38, 58, 78].map((x, i) => (
        <IsoBox key={i} cx={x} cy={FLOOR_Y - 4} w={6} h={24 + (i % 2) * 4} depth={6} c={c} />
      ))}
      <IsoBox cx={48} cy={FLOOR_Y - 14} w={62} h={5} depth={5} c={tones(shade(base, -0.1))} />
    </svg>
  );
}

function Door({ base }: { base: string }) {
  const c = tones(base);
  const frame = tones(shade(base, -0.3));
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 4} rx={22} />
      <IsoBox cx={50} cy={FLOOR_Y} w={40} h={44} depth={10} c={frame} />
      <IsoBox cx={50} cy={FLOOR_Y - 2} w={26} h={36} depth={4} c={c} />
    </svg>
  );
}

function Shelf({ base }: { base: string }) {
  const c = tones(base);
  const book = ["#8f2417", "#2e6f7a", "#4c7a36", "#a8321f", "#c99a4a"];
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 5} rx={28} />
      <IsoBox cx={50} cy={FLOOR_Y} w={54} h={46} depth={16} c={c} />
      {book.map((col, i) => (
        <IsoBox key={i} cx={30 + i * 7} cy={FLOOR_Y - 16} w={5} h={14 + (i % 3) * 3} depth={3} c={tones(col)} />
      ))}
    </svg>
  );
}

function Campfire() {
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 8} rx={24} />
      {[[30, FLOOR_Y + 2, 24], [70, FLOOR_Y + 2, -24], [50, FLOOR_Y + 8, 0]].map(([x, y, r], i) => (
        <rect key={i} x={(x as number) - 14} y={(y as number) - 3} width={28} height={6} rx={3} fill="#4a2e18" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <Flame cx={50} cy={FLOOR_Y - 4} w={30} h={34} />
    </svg>
  );
}

function Torch({ base }: { base: string }) {
  const c = tones(base);
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 4} rx={12} />
      <IsoCylinder cx={50} cy={FLOOR_Y} w={8} h={40} c={c} />
      <Flame cx={50} cy={FLOOR_Y - 44} w={20} h={22} />
    </svg>
  );
}

function Hearth({ base }: { base: string }) {
  const c = tones(base);
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 6} rx={30} />
      <IsoBox cx={50} cy={FLOOR_Y} w={64} h={42} depth={20} c={c} />
      <IsoBox cx={50} cy={FLOOR_Y - 2} w={30} h={22} depth={8} c={tones("#1a1008")} />
      <Flame cx={50} cy={FLOOR_Y - 2} w={20} h={20} />
    </svg>
  );
}

function Tree({ base, canopy }: { base: string; canopy: string }) {
  const trunk = tones(base);
  const c1 = tones(canopy);
  const c2 = tones(shade(canopy, 0.12));
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 8} rx={26} />
      <IsoCylinder cx={50} cy={FLOOR_Y + 2} w={10} h={20} c={trunk} />
      <IsoCone cx={50} cy={FLOOR_Y - 8} w={54} h={34} c={c1} />
      <IsoCone cx={50} cy={FLOOR_Y - 24} w={40} h={26} c={c2} />
    </svg>
  );
}

function Bush({ base }: { base: string }) {
  const c1 = tones(base);
  const c2 = tones(shade(base, 0.1));
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 6} rx={28} />
      <IsoCone cx={34} cy={FLOOR_Y} w={30} h={18} c={c1} />
      <IsoCone cx={64} cy={FLOOR_Y} w={30} h={18} c={c1} />
      <IsoCone cx={50} cy={FLOOR_Y - 2} w={32} h={22} c={c2} />
    </svg>
  );
}

function RockCluster({ base, big = false }: { base: string; big?: boolean }) {
  const c1 = tones(base);
  const c2 = tones(shade(base, -0.1));
  const c3 = tones(shade(base, 0.14));
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + (big ? 10 : 6)} rx={big ? 34 : 22} />
      <polygon points={`26,${FLOOR_Y} 40,${FLOOR_Y - (big ? 40 : 20)} 54,${FLOOR_Y - 4} 44,${FLOOR_Y + 4}`} fill={c1.left} stroke={c1.line} strokeWidth={0.6} />
      <polygon points={`44,${FLOOR_Y + 4} 54,${FLOOR_Y - 4} 66,${FLOOR_Y - (big ? 30 : 14)} 78,${FLOOR_Y}`} fill={c2.right} stroke={c2.line} strokeWidth={0.6} />
      <polygon points={`40,${FLOOR_Y - (big ? 40 : 20)} 54,${FLOOR_Y - 4} 66,${FLOOR_Y - (big ? 30 : 14)} 52,${FLOOR_Y - (big ? 46 : 24)}`} fill={c3.top} stroke={c3.line} strokeWidth={0.6} />
    </svg>
  );
}

function Chasm() {
  return (
    <svg viewBox={VB}>
      <ellipse cx={50} cy={FLOOR_Y + 2} rx={38} ry={17} fill="#5a4025" />
      <ellipse cx={50} cy={FLOOR_Y + 2} rx={30} ry={12} fill="#0c0805" />
      <ellipse cx={42} cy={FLOOR_Y - 2} rx={12} ry={4} fill="#000" opacity={0.5} />
    </svg>
  );
}

function Table({ base }: { base: string }) {
  const c = tones(base);
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 6} rx={30} />
      {[[26, FLOOR_Y + 6], [74, FLOOR_Y + 6], [26, FLOOR_Y - 6], [74, FLOOR_Y - 6]].map(([x, y], i) => (
        <rect key={i} x={(x as number) - 2} y={y as number} width={4} height={16} fill={shade(base, -0.35)} />
      ))}
      <IsoBox cx={50} cy={FLOOR_Y - 6} w={62} h={6} depth={30} c={c} />
    </svg>
  );
}

function Chair({ base }: { base: string }) {
  const c = tones(base);
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 8} rx={18} />
      <rect x={64} y={FLOOR_Y - 40} width={6} height={30} fill={shade(base, -0.3)} />
      <rect x={64} y={FLOOR_Y - 40} width={18} height={6} fill={shade(base, -0.15)} />
      <IsoBox cx={48} cy={FLOOR_Y} w={30} h={8} depth={24} c={c} />
      {[[36, FLOOR_Y + 6], [60, FLOOR_Y + 6]].map(([x, y], i) => (
        <rect key={i} x={(x as number) - 2} y={y as number} width={4} height={12} fill={shade(base, -0.35)} />
      ))}
    </svg>
  );
}

function Chest({ base }: { base: string }) {
  const c = tones(base);
  const metal = tones("#c99a4a");
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 6} rx={24} />
      <IsoBox cx={50} cy={FLOOR_Y} w={44} h={22} depth={26} c={c} />
      <IsoBox cx={50} cy={FLOOR_Y - 22} w={44} h={8} depth={26} c={tones(shade(base, -0.08))} />
      <rect x={46} y={FLOOR_Y - 26} width={8} height={10} rx={1.5} fill={metal.right} stroke={metal.line} strokeWidth={0.5} />
    </svg>
  );
}

function Bed({ base }: { base: string }) {
  const frame = tones(shade(base, -0.25));
  const linen = tones("#e8dcc0");
  return (
    <svg viewBox={VB}>
      <GroundShadow cx={50} cy={FLOOR_Y + 8} rx={34} />
      <IsoBox cx={50} cy={FLOOR_Y} w={70} h={10} depth={34} c={frame} />
      <IsoBox cx={50} cy={FLOOR_Y - 8} w={62} h={6} depth={28} c={linen} />
      <IsoBox cx={30} cy={FLOOR_Y - 12} w={16} h={8} depth={22} c={tones("#8fa8c9")} />
    </svg>
  );
}

function WaterPool() {
  const c = tones("#2e6f7a");
  return (
    <svg viewBox={VB}>
      <IsoGround cx={50} cy={FLOOR_Y + 2} rx={34} c={c} ring="#6b4a2a" />
    </svg>
  );
}

function Mud() {
  const c = tones("#5a4530");
  return (
    <svg viewBox={VB}>
      <IsoGround cx={50} cy={FLOOR_Y + 2} rx={34} c={c} />
      <ellipse cx={40} cy={FLOOR_Y - 2} rx={5} ry={2.4} fill="#3a2a1c" opacity={0.6} />
      <ellipse cx={60} cy={FLOOR_Y + 6} rx={4} ry={2} fill="#3a2a1c" opacity={0.6} />
    </svg>
  );
}

function Trap() {
  return (
    <svg viewBox={VB}>
      <IsoGround cx={50} cy={FLOOR_Y + 2} rx={30} c={tones("#8a7a5a")} />
      <g stroke="#3a2a1c" strokeWidth={1.4} opacity={0.85}>
        <line x1={30} y1={FLOOR_Y - 6} x2={70} y2={FLOOR_Y + 10} />
        <line x1={70} y1={FLOOR_Y - 6} x2={30} y2={FLOOR_Y + 10} />
        <line x1={50} y1={FLOOR_Y - 14} x2={50} y2={FLOOR_Y + 18} />
      </g>
      <text x={50} y={FLOOR_Y - 16} textAnchor="middle" fontSize={16} fill="#a8321f">
        ⚠
      </text>
    </svg>
  );
}

/** Mapa id do cenário → ilustração isométrica. Sem entrada aqui = usa o emoji como reserva. */
export const SCENERY_ART: Record<string, (item: SceneryDef) => React.ReactElement> = {
  parede: (it) => <Wall base={it.color} />,
  "muro-pedra": (it) => <RockCluster base={it.color} />,
  "cerca-madeira": (it) => <Fence base={it.color} />,
  porta: (it) => <Door base={it.color} />,
  estante: (it) => <Shelf base={it.color} />,
  fogueira: () => <Campfire />,
  tocha: (it) => <Torch base={it.color} />,
  lareira: (it) => <Hearth base={it.color} />,
  arvore: (it) => <Tree base="#6b4a2a" canopy={it.color} />,
  arbusto: (it) => <Bush base={it.color} />,
  rocha: (it) => <RockCluster base={it.color} />,
  montanha: (it) => <RockCluster base={it.color} big />,
  desfiladeiro: () => <Chasm />,
  mesa: (it) => <Table base={it.color} />,
  cadeira: (it) => <Chair base={it.color} />,
  bau: (it) => <Chest base={it.color} />,
  cama: (it) => <Bed base={it.color} />,
  "poco-agua": () => <WaterPool />,
  lama: () => <Mud />,
  armadilha: () => <Trap />,
};

/** Ilustração de uma peça de cenário, pronta pra usar num token do mapa ou numa lista. */
export function SceneryIcon({ item, className }: { item: SceneryDef; className?: string }) {
  const render = SCENERY_ART[item.id];
  if (!render) {
    return (
      <span className={className} aria-hidden>
        {item.icon}
      </span>
    );
  }
  return <div className={className}>{render(item)}</div>;
}
