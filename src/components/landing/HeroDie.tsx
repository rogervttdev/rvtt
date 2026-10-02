"use client";

/**
 * D20 decorativo da entrada: gira devagar e pulsa um brilho âmbar, só pra dar
 * aquele clima de "mesa de RPG" na hora. SVG puro, sem bibliotecas pesadas —
 * o dado 3D "de verdade" (com física) fica só na mesa, onde ele importa.
 */
export function HeroDie({ className }: { className?: string }) {
  return (
    <div className={`hero-die-wrap ${className ?? ""}`}>
      <div className="hero-die-glow" aria-hidden />
      <svg viewBox="0 0 200 200" className="hero-die-svg" aria-hidden>
        <defs>
          <linearGradient id="hd-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0d9a8" />
            <stop offset="100%" stopColor="#c39a4e" />
          </linearGradient>
          <linearGradient id="hd-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bb542c" />
            <stop offset="100%" stopColor="#8f3717" />
          </linearGradient>
          <linearGradient id="hd-right" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c2e13" />
            <stop offset="100%" stopColor="#4a180a" />
          </linearGradient>
        </defs>
        <g className="hero-die-spin" transform="translate(100 104)">
          {/* Dado losangular (fachada icosaédrica simplificada), 3 faces visíveis */}
          <polygon points="0,-92 80,-46 80,46 0,92 -80,46 -80,-46" fill="#2a1c12" opacity="0.001" />
          <polygon points="0,-92 80,-46 0,0 -80,-46" fill="url(#hd-top)" stroke="#5a3a1a" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="-80,-46 0,0 0,92 -80,46" fill="url(#hd-left)" stroke="#3a1c0a" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="80,-46 0,0 0,92 80,46" fill="url(#hd-right)" stroke="#2a1008" strokeWidth="3" strokeLinejoin="round" />
          <line x1="0" y1="-92" x2="0" y2="0" stroke="#3a1c0a" strokeWidth="2" opacity="0.5" />
          <text x="-2" y="42" textAnchor="middle" fontFamily="var(--font-display)" fontSize="64" fontWeight="700" fill="#fbeed3" stroke="#2a1008" strokeWidth="2" paintOrder="stroke">
            20
          </text>
        </g>
      </svg>
    </div>
  );
}
