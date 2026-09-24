"use client";

import { useRef, useState } from "react";
import { ACCEPTED_TYPES, deleteAvatar, uploadAvatar } from "@/lib/avatar";
import { initials } from "@/lib/dnd";

type Props = {
  url: string | null;
  name: string;
  userId: string;
  characterId: string;
  /** Chamado com a nova URL (ou null ao remover) depois que o arquivo foi salvo */
  onChange: (url: string | null) => Promise<void>;
};

/** Retrato do herói numa moldura de madeira com filete de latão. */
export function PortraitUploader({ url, name, userId, characterId, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const newUrl = await uploadAvatar(file, userId, characterId);
      const old = url;
      await onChange(newUrl);
      deleteAvatar(old).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível enviar a imagem.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removePortrait() {
    if (!url || !confirm("Remover o retrato deste personagem?")) return;
    setBusy(true);
    setError("");
    try {
      await onChange(null);
      deleteAvatar(url).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível remover.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        disabled={busy}
        className={`portrait-frame group ${dragging ? "is-dragging" : ""}`}
        aria-label={url ? `Trocar retrato de ${name}` : `Adicionar retrato de ${name}`}
      >
        <span className="portrait-inner">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={`Retrato de ${name}`} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
              <span className="font-display text-4xl font-bold text-brass-deep/70">{initials(name || "?")}</span>
              <span className="px-2 text-xs font-semibold leading-tight text-dim">Adicionar retrato</span>
            </span>
          )}
          <span className="portrait-hover">{busy ? "Enviando…" : url ? "Trocar retrato" : "Escolher imagem"}</span>
          {busy && <span className="portrait-busy" aria-hidden />}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {url && !busy && (
        <button type="button" className="text-xs font-semibold text-blood hover:underline" onClick={removePortrait}>
          Remover retrato
        </button>
      )}
      {!url && !busy && <span className="text-xs text-dim">PNG, JPG ou WEBP</span>}
      {error && (
        <p className="max-w-[12rem] text-center text-xs text-blood" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
