import Image from "next/image";

/** Logo oficial da Taverna Inicial: caneca-d20 com espuma. Proporção original 614 × 640. */
export function TavernLogo({
  size = 40,
  className = "",
  priority = false,
}: {
  /** Altura em pixels; a largura acompanha a proporção. */
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-taverna.png"
      alt="Taverna Inicial"
      width={Math.round((size * 614) / 640)}
      height={size}
      priority={priority}
      className={`h-auto select-none ${className}`}
      style={{ width: "auto", height: size }}
    />
  );
}
