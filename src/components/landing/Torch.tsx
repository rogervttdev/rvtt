"use client";

/** Tocha de parede com chama tremeluzente (CSS puro) — ladeando o letreiro de entrada. */
export function Torch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 140" className={className} aria-hidden>
      <rect x="22" y="60" width="16" height="70" rx="3" fill="#5a3a24" stroke="#2a1c12" strokeWidth="2" />
      <rect x="18" y="56" width="24" height="12" rx="3" fill="#3a2a1c" stroke="#1a1008" strokeWidth="2" />
      <g className="torch-flame">
        <path d="M30 8 C44 24 44 40 30 52 C16 40 16 24 30 8 Z" fill="#e6862a" />
        <path d="M30 20 C38 30 38 40 30 48 C22 40 22 30 30 20 Z" fill="#f7c948" />
      </g>
    </svg>
  );
}
