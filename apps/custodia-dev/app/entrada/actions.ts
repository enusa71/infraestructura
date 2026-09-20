'use server';

import { auth } from '@/auth';
import { crearCustodia, generarNumeroCustodia } from '../custodia/actions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const EntradaSchema = z.object({
  contratistaCedula: z.string().min(5),
  contratistaEmpresa: z.string().optional(),
  herramientas: z.array(
    z.object({
      descripcion: z.string().min(3),
      cantidad: z.number().min(1),
    })
  ),
});

type EntradaInput = z.infer<typeof EntradaSchema>;

export async function registrarEntrada(data: EntradaInput) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error('No autorizado');
    }

    const validado = EntradaSchema.parse(data);

    let contratista = await prisma.contratista.findUnique({
      where: { cedula: validado.contratistaCedula },
    });

    if (!contratista) {
      contratista = await prisma.contratista.create({
        data: {
          cedula: validado.contratistaCedula,
          nombre: validado.contratistaCedula,
          empresa: validado.contratistaEmpresa,
        },
      });
    }

    const numeroConsecutivo = await generarNumeroCustodia();
    if (!numeroConsecutivo) {
      throw new Error('Error generando número');
    }

    const items = await Promise.all(
      validado.herramientas.map(async (h) => {
        let herramienta = await prisma.herramienta.findFirst({
          where: { nombre: h.descripcion },
        });

        if (!herramienta) {
          herramienta = await prisma.herramienta.create({
            data: { nombre: h.descripcion },
          });
        }

        return { herramientaId: herramienta.id, cantidad: h.cantidad };
      })
    );

    const result = await crearCustodia(
      validado.contratistaCedula,
      contratista.nombre,
      items,
      validado.contratistaEmpresa
    );

    if (!result.success || !result.custodia) {
      throw new Error('Error creando custodia');
    }

    return {
      success: true,
      custodiaId: result.custodia.id,
      numero: result.custodia.numeroConsecutivo,
    };
  } catch (error) {
    console.error('Error registrando entrada:', error);
    throw error;
  }
}

export async function obtenerCustodia(numero: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error('No autorizado');
    }

    const custodia = await prisma.custodia.findUnique({
      where: { numeroConsecutivo: numero },
      include: {
        items: true,
        contratista: true,
      },
    });

    if (!custodia) {
      throw new Error('Custodia no encontrada');
    }

    return custodia;
  } catch (error) {
    console.error('Error obteniendo custodia:', error);
    throw error;
  }
}
