'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function registrarAuditoria(tabla: string, accion: string, recordId: string, cambios: any) {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'SISTEMA';
    const userEmail = session?.user?.email || 'sistema@custodia.local';

    await prisma.auditLog.create({
      data: {
        table: tabla,
        action: accion,
        recordId,
        changes: cambios,
        userId,
        userEmail,
      },
    });
  } catch (err) {
    console.error('Error registrando auditoría:', err);
  }
}

async function generarNumeroCustodia(zonaFranca: string = 'ZFB'): Promise<string> {
  try {
    // Obtener la configuración actual del consecutivo
    let config = await prisma.configuracionConsecutivo.findUnique({
      where: { zona: zonaFranca },
    });

    // Si no existe, crear la configuración
    if (!config) {
      config = await prisma.configuracionConsecutivo.create({
        data: {
          zona: zonaFranca,
          proximoNumero: 1,
        },
      });
    }

    // Generar el número con el formato ZONA-000001
    const numero = `${zonaFranca}-${config.proximoNumero.toString().padStart(6, '0')}`;

    // Incrementar el próximo número
    await prisma.configuracionConsecutivo.update({
      where: { zona: zonaFranca },
      data: { proximoNumero: config.proximoNumero + 1 },
    });

    return numero;
  } catch (error) {
    console.error('Error generando número de custodia:', error);
    throw new Error('No se pudo generar el número de custodia');
  }
}

export async function crearCustodia(
  cedula: string,
  nombre: string,
  items: Array<{ herramientaId: string; cantidad: number }>,
  empresa?: string,
  zonaFranca: string = 'ZFB',
  puerta: string = 'Principal',
  placa?: string | null,
  firmaContratistaDatos?: string,
  firmaAuxiliarDatos?: string,
  auxiliarNombre?: string,
  auxiliarCedula?: string
) {
  try {
    let contratista = await prisma.contratista.findUnique({
      where: { cedula },
    });

    if (!contratista) {
      contratista = await prisma.contratista.create({
        data: { cedula, nombre, empresa },
      });
    }

    // Generar numero UNICAMENTE en el momento de guardar (con zona franca)
    const numeroConsecutivo = await generarNumeroCustodia(zonaFranca);

    const custodia = await prisma.custodia.create({
      data: {
        numeroConsecutivo,
        contratistaId: contratista.id,
        fechaEntrada: new Date(),
        estado: 'ACTIVA',
        puerta,
        zonaFranca,
        placa: placa || undefined,
        items: {
          create: items.map((item) => ({
            herramientaId: item.herramientaId,
            cantidad: item.cantidad,
          })),
        },
      },
      include: { items: { include: { herramienta: true } } },
    });

    // Crear registro de CustodiaIngreso con firmas
    if (firmaContratistaDatos || firmaAuxiliarDatos || auxiliarNombre || auxiliarCedula) {
      await prisma.custodiaIngreso.create({
        data: {
          custodiaId: custodia.id,
          firmaContratistaDatos: firmaContratistaDatos || null,
          firmaAuxiliarDatos: firmaAuxiliarDatos || null,
          auxiliarNombre: auxiliarNombre || null,
          auxiliarCedula: auxiliarCedula || null,
        },
      });
    }

    // Registrar auditoría
    await registrarAuditoria('Custodia', 'CREAR', custodia.id, {
      numeroConsecutivo,
      contratista: `${contratista.cedula} - ${contratista.nombre}`,
      cantidadItems: items.length,
      totalherramientas: items.reduce((sum, i) => sum + i.cantidad, 0),
    });

    return { success: true, custodia };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error creando custodia:', errorMsg, error);
    return { success: false, custodia: null, error: errorMsg };
  }
}

export async function buscarCustodia(numeroConsecutivoOId: string) {
  try {
    let custodia;

    // Intentar buscar por numeroConsecutivo primero
    custodia = await prisma.custodia.findUnique({
      where: { numeroConsecutivo: numeroConsecutivoOId },
      include: {
        contratista: true,
        ingreso: {
          select: {
            id: true,
            auxiliarNombre: true,
            auxiliarCedula: true,
            firmaAuxiliarDatos: true,
            firmaContratistaDatos: true,
          },
        },
        items: {
          include: { herramienta: true },
        },
        salidas: {
          select: {
            id: true,
            fechaSalida: true,
            esParcial: true,
            cedulaRetira: true,
            nombreRetira: true,
            auxiliarCedula: true,
            auxiliarNombre: true,
            empresaRetira: true,
            firmaRetiraDatos: true,
            firmaAuxiliarDatos: true,
            firmaRetiraBlobUrl: true,
            firmaAuxiliarBlobUrl: true,
            items: { include: { item: { include: { herramienta: true } } } },
          },
          orderBy: { fechaSalida: 'desc' },
        },
      },
    });

    // Si no encuentra por número, buscar por ID
    if (!custodia) {
      custodia = await prisma.custodia.findUnique({
        where: { id: numeroConsecutivoOId },
        include: {
          contratista: true,
          ingreso: {
            select: {
              id: true,
              auxiliarNombre: true,
              auxiliarCedula: true,
              firmaAuxiliarDatos: true,
              firmaContratistaDatos: true,
            },
          },
          items: {
            include: { herramienta: true },
          },
          salidas: {
            select: {
              id: true,
              fechaSalida: true,
              esParcial: true,
              cedulaRetira: true,
              nombreRetira: true,
              auxiliarCedula: true,
              auxiliarNombre: true,
              empresaRetira: true,
              firmaRetiraDatos: true,
              firmaAuxiliarDatos: true,
              firmaRetiraBlobUrl: true,
              firmaAuxiliarBlobUrl: true,
              items: { include: { item: { include: { herramienta: true } } } },
            },
            orderBy: { fechaSalida: 'desc' },
          },
        },
      });
    }

    if (!custodia) {
      return { success: false, custodia: null, error: 'Custodia no encontrada' };
    }

    return { success: true, custodia };
  } catch (error) {
    console.error('❌ Error en buscarCustodia:', error);
    return { success: false, custodia: null, error: 'Error buscando custodia' };
  }
}

export async function crearSalida(
  custodiaId: string,
  salidas: Array<{ itemId: string; cantidadSalida: number }>,
  datosRetira?: {
    retiraNombre?: string;
    retiraCedula?: string;
    retiraEmpresa?: string;
    auxiliarNombre?: string;
    auxiliarCedula?: string;
    firmaRetiraDatos?: string;
    firmaRetiraTimestamp?: string;
    firmaAuxiliarDatos?: string;
  }
) {
  try {
    console.log('🔐 crearSalida recibido:', {
      custodiaId,
      hasRetiraDatos: !!datosRetira?.firmaRetiraDatos,
      retiraDatosLen: datosRetira?.firmaRetiraDatos?.length || 0,
      hasAuxiliarDatos: !!datosRetira?.firmaAuxiliarDatos,
      auxiliarDatosLen: datosRetira?.firmaAuxiliarDatos?.length || 0,
    });

    const custodia = await prisma.custodia.findUnique({
      where: { id: custodiaId },
      include: { items: true },
    });

    if (!custodia) {
      return { success: false, error: 'Custodia no encontrada' };
    }

    // Verificar si es salida parcial
    const totalIngresado = custodia.items.reduce((sum: number, item: any) => sum + item.cantidad, 0);
    const totalSalida = salidas.reduce((sum: number, s: any) => sum + s.cantidadSalida, 0);
    const esParcial = totalSalida < totalIngresado;

    // Crear registro de salida con items
    const salida = await prisma.custodiaSalida.create({
      data: {
        custodiaId,
        esParcial,
        fechaSalida: new Date(),
        nombreRetira: datosRetira?.retiraNombre || '',
        cedulaRetira: datosRetira?.retiraCedula || '',
        empresaRetira: datosRetira?.retiraEmpresa || '',
        auxiliarNombre: datosRetira?.auxiliarNombre || '',
        auxiliarCedula: datosRetira?.auxiliarCedula || '',
        firmaRetiraDatos: datosRetira?.firmaRetiraDatos || null,
        firmaAuxiliarDatos: datosRetira?.firmaAuxiliarDatos || null,
        items: {
          create: salidas
            .filter(s => s.cantidadSalida > 0)
            .map(s => ({
              itemId: s.itemId,
              cantidadSalida: s.cantidadSalida,
            })),
        },
      },
      include: { items: true },
    });

    console.log('✅ Salida creada:', { id: salida.id, guardóRetira: !!salida.firmaRetiraDatos, guardóAuxiliar: !!salida.firmaAuxiliarDatos });

    // Actualizar estado de custodia
    const nuevoEstado = esParcial ? 'PARCIAL' : 'CERRADA';
    const custodiaAntes = custodia;
    const custodiaActualizada = await prisma.custodia.update({
      where: { id: custodiaId },
      data: {
        estado: nuevoEstado,
        fechaSalida: new Date(),
      },
    });

    // Registrar auditoría
    await registrarAuditoria('Custodia', 'SALIDA', custodiaId, {
      estadoAnterior: custodiaAntes.estado,
      estadoNuevo: nuevoEstado,
      tipo: esParcial ? 'PARCIAL' : 'COMPLETA',
      totalSalida: totalSalida,
      cantidadItems: salidas.length,
    });

    return { success: true, salida };
  } catch (error) {
    console.error('Error creando salida:', error);
    return { success: false, error: 'Error registrando salida' };
  }
}
