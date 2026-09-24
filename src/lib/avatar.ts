import { supabase } from "./supabase";

/** Bucket público do Supabase Storage onde ficam os retratos */
export const AVATAR_BUCKET = "characters";
/** Bucket usado em versões anteriores (para conseguir apagar retratos antigos) */
const LEGACY_BUCKETS = ["avatars"];
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_UPLOAD_MB = 10;

/**
 * Reduz a imagem no próprio navegador (máx. 640 px no maior lado) antes de enviar.
 * Fotos de celular com vários MB viram arquivos leves, e a ficha carrega rápido na mesa.
 */
async function shrink(file: File, maxSide = 640): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Não foi possível ler essa imagem."));
      el.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    // PNG mantém transparência; foto vira JPEG leve
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.86));
    return blob && blob.size < file.size ? blob : file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Bucket e caminho do arquivo a partir da URL pública (para apagar o antigo). */
function locate(url: string) {
  for (const bucket of [AVATAR_BUCKET, ...LEGACY_BUCKETS]) {
    const marker = `/object/public/${bucket}/`;
    const i = url.indexOf(marker);
    if (i >= 0) return { bucket, path: decodeURIComponent(url.slice(i + marker.length).split("?")[0]) };
  }
  return null;
}

/**
 * Envia o retrato para `characters/<user_id>/<character_id>-<data>.<ext>` e devolve a URL pública.
 * A primeira pasta ser o user_id é o que as políticas de segurança do Storage conferem.
 */
export async function uploadAvatar(file: File, userId: string, characterId: string) {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error("Use uma imagem PNG, JPG ou WEBP.");
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`A imagem passa de ${MAX_UPLOAD_MB} MB. Escolha uma menor.`);

  const blob = await shrink(file);
  const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${characterId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) {
    if (/bucket not found/i.test(error.message))
      throw new Error("O espaço de imagens ainda não existe no Supabase. Rode o supabase/schema.sql atualizado.");
    if (/row-level security|unauthorized|403/i.test(error.message))
      throw new Error("Sem permissão para enviar a imagem. Rode o supabase/schema.sql atualizado.");
    throw new Error(error.message);
  }
  return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Remove um retrato antigo do Storage (se falhar, não atrapalha o jogador). */
export async function deleteAvatar(url: string | null | undefined) {
  const found = url ? locate(url) : null;
  if (found) await supabase.storage.from(found.bucket).remove([found.path]);
}
