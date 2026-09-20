/**
 * Storage module for Cloudflare R2
 * Handles photo uploads and retrieval
 */

export async function guardarFoto(
  dataUrl: string,
  custodiaId: string,
  tipo: string
): Promise<string> {
  // TODO: Implement Cloudflare R2 upload
  // For now, return a placeholder filename
  const timestamp = Date.now();
  const filename = `${custodiaId}-${tipo}-${timestamp}.jpg`;
  return filename;
}

export async function leerFoto(filename: string): Promise<string> {
  // TODO: Implement Cloudflare R2 download
  // For now, return empty string
  return '';
}

export async function obtenerUrlFoto(filename: string): Promise<string> {
  // TODO: Implement Cloudflare R2 URL generation
  if (!filename) return '';
  return `https://r2.example.com/${filename}`;
}
