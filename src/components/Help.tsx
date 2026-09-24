"use client";

import { useEffect, useId, useRef, useState } from "react";

type Tip = { left: number; top: number; width: number; below: boolean };

/**
 * Selo "?" de ajuda para iniciantes.
 * - Com mouse: passar por cima mostra um balão.
 * - Ao clicar/tocar (celular): abre uma janela com a explicação completa.
 */
export function Help({
  title,
  children,
  paragraphs,
  className = "",
}: {
  title: string;
  /** Texto fixo (parágrafos) */
  paragraphs?: readonly string[];
  /** Conteúdo extra, como a conta do valor atual */
  children?: React.ReactNode;
  className?: string;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const tipId = useId();

  useEffect(() => {
    if (!tip) return;
    const hide = () => setTip(null);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [tip]);

  function showTip() {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(320, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 8));
    const below = r.top < window.innerHeight * 0.5;
    setTip({ left, width, below, top: below ? r.bottom + 10 : r.top - 10 });
  }

  function openDialog() {
    setTip(null);
    dialogRef.current?.showModal();
  }

  const body = (
    <>
      {paragraphs?.map((p) => <p key={p}>{p}</p>)}
      {children}
    </>
  );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`help-seal ${className}`}
        aria-label={`O que é ${title}?`}
        aria-describedby={tip ? tipId : undefined}
        onPointerEnter={(e) => e.pointerType === "mouse" && showTip()}
        onPointerLeave={() => setTip(null)}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && showTip()}
        onBlur={() => setTip(null)}
        onClick={openDialog}
      >
        ?
      </button>

      {tip && (
        <div
          id={tipId}
          role="tooltip"
          className="help-tip"
          style={{ left: tip.left, top: tip.top, width: tip.width, transform: tip.below ? "none" : "translateY(-100%)" }}
        >
          <p className="mb-1.5 font-display text-lg font-bold text-brass-light">{title}</p>
          <div className="space-y-1.5">{body}</div>
          <p className="mt-2 text-xs text-foam/60">Clique para ler com calma.</p>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="help-dialog"
        aria-label={title}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      >
        <div className="p-6">
          <p className="text-sm font-semibold text-brass-deep">Dica da taverna</p>
          <h3 className="mb-3 font-display text-2xl font-bold">{title}</h3>
          <div className="space-y-3 leading-relaxed">{body}</div>
          <button type="button" className="btn btn-primary mt-6 w-full" onClick={() => dialogRef.current?.close()}>
            Entendi
          </button>
        </div>
      </dialog>
    </>
  );
}

/** Linha de conta destacada dentro de uma ajuda ("por que esse número?") */
export function HelpCalc({ children }: { children: React.ReactNode }) {
  return <p className="help-calc">{children}</p>;
}
