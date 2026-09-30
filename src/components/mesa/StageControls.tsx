"use client";

type Props = {
  cell: number;
  onChange: (cell: number) => void;
  onFit: () => void;
};

const MIN = 30;
const MAX = 100;

/** Zoom do mapa com botões grandes (−, +) e "Ajustar" para caber inteiro na tela. */
export function StageControls({ cell, onChange, onFit }: Props) {
  const clamp = (n: number) => Math.max(MIN, Math.min(MAX, Math.round(n)));
  return (
    <div className="mesa-zoom" role="group" aria-label="Zoom do mapa">
      <button className="mesa-zoom-btn" onClick={() => onChange(clamp(cell - 6))} aria-label="Diminuir o mapa" title="Diminuir o mapa">
        −
      </button>
      <span className="mesa-zoom-label">{Math.round((cell / 50) * 100)}%</span>
      <button className="mesa-zoom-btn" onClick={() => onChange(clamp(cell + 6))} aria-label="Aumentar o mapa" title="Aumentar o mapa">
        +
      </button>
      <button className="mesa-zoom-btn text-xs" onClick={onFit} title="Ajustar o mapa para caber inteiro na tela">
        Ajustar
      </button>
    </div>
  );
}
