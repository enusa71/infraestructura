import { prisma } from './prisma';

export async function generarNumeroCustodia(): Promise<string> {
  let numero: string;
  let existe = true;
  let intentos = 0;
  const maxIntentos = 10;

  while (existe && intentos < maxIntentos) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    numero = `${timestamp}${random}`;

    const check = await prisma.custodia.findUnique({
      where: { numeroConsecutivo: numero },
    });
    existe = !!check;
    intentos++;
  }

  if (existe) {
    throw new Error('No se pudo generar un número único de custodia');
  }

  return numero!;
}

export async function crearCustodia(data: {
  contratistaId: string;
  items: Array<{ descripcion: string; cantidad: number }>;
}) {
  const numeroConsecutivo = await generarNumeroCustodia();

  const custodia = await prisma.custodia.create({
    data: {
      numeroConsecutivo,
      contratistaId: data.contratistaId,
      fechaEntrada: new Date(),
      estado: 'ACTIVA',
      items: {
        create: data.items,
      },
    },
    include: {
      items: true,
      contratista: true,
    },
  });

  return custodia;
}

export async function buscarCustodia(numero: string) {
  const custodia = await prisma.custodia.findUnique({
    where: { numeroConsecutivo: numero },
    include: {
      items: true,
      ingreso: true,
      salidas: true,
      contratista: true,
    },
  });

  return custodia;
}

export async function registrarSalida(custodiaId: string, cantidades: Record<string, number>) {
  const custodia = await prisma.custodia.findUnique({
    where: { id: custodiaId },
    include: { items: true },
  });

  if (!custodia) throw new Error('Custodia no encontrada');

  const totalIngresado = custodia.items.reduce((sum: number, item: any) => sum + item.cantidad, 0);
  const totalSalida = Object.values(cantidades).reduce((a: any, b: any) => a + b, 0);
  const esParcial = totalSalida < totalIngresado;

  const salida = await prisma.custodiaSalida.create({
    data: {
      custodiaId,
      esParcial,
    },
  });

  // Actualizar estado de custodia
  await prisma.custodia.update({
    where: { id: custodiaId },
    data: {
      estado: esParcial ? 'PARCIAL' : 'CERRADA',
      fechaSalida: new Date(),
    },
  });

  return salida;
}

export async function listarCustodiasActivas() {
  return prisma.custodia.findMany({
    where: {
      estado: 'ACTIVA',
    },
    include: {
      items: true,
      contratista: true,
    },
    orderBy: {
      fechaEntrada: 'desc',
    },
  });
}

export async function obtenerEstadisticas() {
  const total = await prisma.custodia.count();
  const activas = await prisma.custodia.count({
    where: { estado: 'ACTIVA' },
  });
  const cerradas = await prisma.custodia.count({
    where: { estado: 'CERRADA' },
  });
  const parciales = await prisma.custodia.count({
    where: { estado: 'PARCIAL' },
  });

  return { total, activas, cerradas, parciales };
}
