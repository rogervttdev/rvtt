/** Caneco de taverna com espuma — marca da Taverna Inicial */
export function TankardIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M7 10h14v15a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3z" fill="#8a5a33" stroke="#2a1c12" strokeWidth="1.3" />
      <path d="M7 15h14M7 22h14" stroke="#c39a4e" strokeWidth="1.6" />
      <path d="M21 13h3a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-3" fill="none" stroke="#2a1c12" strokeWidth="2.2" />
      <path d="M21 13h3a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-3" fill="none" stroke="#c39a4e" strokeWidth="1" />
      <path
        d="M6 10.5c-1-2.6 1.2-4.6 3.4-3.8.6-2.4 4.2-3 5.4-.8 1.4-1.5 4.4-1 4.9 1.1 2.2-.3 3.3 2 2.3 3.5z"
        fill="#fbeed3"
        stroke="#2a1c12"
        strokeWidth="1.2"
      />
    </svg>
  );
}
