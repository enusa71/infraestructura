'use server';

import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

const STORAGE_DIR = process.env.STORAGE_DIR || '/opt/custodia/fotos';

export async function guardarFoto(
  dataUrl: string,
  custodiaId: string,
  tipo: 'contratista' | 'herramienta' | 'grupo' | 'salida'
): Promise<string> {
  try {
    // Crear carpeta si no existe
    await fs.mkdir(STORAGE_DIR, { recursive: true });

    // Generar nombre único
    const timestamp = Date.now();
    const filename = `${custodiaId}_${tipo}_${timestamp}.jpg`;
    const filepath = path.join(STORAGE_DIR, filename);

    // Extraer base64 del dataUrl
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');

    // Comprimir imagen con sharp
    const comprimida = await sharp(buffer)
      .resize(1600, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Guardar archivo
    await fs.writeFile(filepath, comprimida);

    return filename;
  } catch (error) {
    console.error('Error guardando foto:', error);
    throw error;
  }
}

export async function leerFoto(filename: string): Promise<Buffer> {
  try {
    const filepath = path.join(STORAGE_DIR, filename);
    return await fs.readFile(filepath);
  } catch (error) {
    console.error('Error leyendo foto:', error);
    throw error;
  }
}

export async function eliminarFoto(filename: string): Promise<void> {
  try {
    const filepath = path.join(STORAGE_DIR, filename);
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Error eliminando foto:', error);
    throw error;
  }
}
