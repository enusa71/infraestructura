import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'SERVICIOS-GLOBAL.json');
    const contenido = await readFile(filePath, 'utf-8');
    const config = JSON.parse(contenido);

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error leyendo SERVICIOS-GLOBAL.json:', error);
    return NextResponse.json(
      { error: 'No se pudo leer SERVICIOS-GLOBAL.json', details: String(error) },
      { status: 500 }
    );
  }
}
