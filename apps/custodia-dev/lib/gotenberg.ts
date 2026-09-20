const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://localhost:3001';

interface GenerarPDFParams {
  html: string;
  nombreArchivo: string;
}

export async function generarPDFConGotenberg({ html, nombreArchivo }: GenerarPDFParams): Promise<Buffer> {
  try {
    const formData = new FormData();
    formData.append('files', new Blob([html], { type: 'text/html' }), 'index.html');
    formData.append('paperWidth', '8.27');
    formData.append('paperHeight', '11.7');
    formData.append('marginTop', '0.5');
    formData.append('marginBottom', '0.5');
    formData.append('marginLeft', '0.5');
    formData.append('marginRight', '0.5');

    const response = await fetch(`${GOTENBERG_URL}/forms/libreoffice/convert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Gotenberg error: ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error('Error generando PDF con Gotenberg:', error);
    throw error;
  }
}

export function generarHTMLFormatoCustodia(datos: any): string {
  const {
    numeroConsecutivo,
    fechaEntrada,
    zonaFranca,
    puerta,
    placa,
    contratista,
    itemsEntrada,
    salidas = [],
    firmaEntradaAuxiliar = '',
    auxiliarNombre = 'Seguridad',
    auxiliarCedula = '',
  } = datos;

  const formatoFecha = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatoHora = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatoFechaHora = (date: string | Date) => {
    return `${formatoFecha(date)} ${formatoHora(date)}`;
  };

  const totalIngresado = itemsEntrada.reduce((sum: number, item: any) => sum + item.cantidad, 0);
  const totalSalido = salidas.reduce((sum: number, s: any) => sum + (s.items?.reduce((itemSum: number, item: any) => itemSum + item.cantidadSalida, 0) || 0), 0);
  const totalPendiente = totalIngresado - totalSalido;
  const esCerrada = totalPendiente === 0;
  const fechaCierre = salidas.length > 0 ? salidas[salidas.length - 1].fechaSalida : null;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custodia ${numeroConsecutivo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A3A52; background: white; line-height: 1.4; font-size: 11px; }
    .page { width: 100%; padding: 30px; max-width: 1000px; margin: 0 auto; }

    /* Header */
    .header { display: grid; grid-template-columns: 1fr auto auto; gap: 20px; align-items: start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #1A3A52; }
    .logo-title { font-size: 20px; font-weight: 700; color: #1A3A52; letter-spacing: 0.5px; line-height: 1.2; }
    .logo-subtitle { font-size: 10px; color: #6B7280; margin-top: 3px; }
    .doc-info { text-align: right; font-size: 10px; }
    .doc-number { font-weight: 700; color: #1A3A52; }
    .doc-date { color: #6B7280; margin-top: 2px; }
    .qr-box { text-align: center; font-size: 9px; color: #6B7280; }

    /* Barra título principal */
    .title-bar { background: #1A3A52; color: white; padding: 10px 15px; margin: 15px 0; font-weight: 600; font-size: 12px; text-align: center; }

    /* Grid info 4 columnas */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; }
    .info-box { border: 1px solid #D1D5DB; padding: 12px; background: #F9FAFB; }
    .info-label { font-weight: 600; font-size: 9px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.3px; }
    .info-value { font-size: 13px; font-weight: 700; color: #1A3A52; margin-top: 6px; }

    /* Sección Contratista */
    .section-header { background: #E8F0F7; border-left: 4px solid #1A3A52; padding: 8px 12px; margin-bottom: 12px; font-weight: 600; font-size: 11px; color: #1A3A52; }
    .contractor-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; padding: 12px; background: white; border: 1px solid #E5E7EB; }
    .contractor-field { border-bottom: 1px solid #D1D5DB; padding-bottom: 8px; }
    .contractor-label { font-weight: 600; font-size: 9px; color: #6B7280; display: flex; gap: 4px; align-items: center; text-transform: uppercase; letter-spacing: 0.3px; }
    .contractor-value { font-size: 12px; margin-top: 4px; color: #1A3A52; font-weight: 500; }

    /* Tablas */
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
    th { background: #E8F5E9; border: 1px solid #D1D5DB; padding: 8px; text-align: left; font-weight: 600; color: #2E7D32; }
    td { border: 1px solid #D1D5DB; padding: 8px; color: #1A3A52; }
    tr:nth-child(even) { background: #FAFBFC; }
    tr:nth-child(odd) { background: white; }

    /* Firmas dentro de tabla */
    .signature-cell { text-align: center; font-size: 9px; }
    .signature-img { max-height: 40px; max-width: 100%; object-fit: contain; margin: 2px 0; }
    .signature-header { font-weight: 600; color: #6B7280; padding: 4px 0; font-size: 8px; }

    /* Totales texto */
    .totals-text { font-weight: 600; font-size: 10px; margin: 10px 0; color: #1A3A52; }

    /* Historial de salidas */
    .historial-header { background: #FFE4B5 !important; color: #FF9800 !important; font-weight: 600; }
    .historial-header th { background: #FFE4B5; color: #FF9800; }
    .badge-partial { background: #FF9800; color: white; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: 500; }
    .badge-final { background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: 500; }

    /* Conciliación */
    .conciliacion-header { background: #3B82F6 !important; color: white !important; font-weight: 600; }
    .conciliacion-header th { background: #3B82F6; color: white; }
    .conciliacion-total { background: #3B82F6; color: white; font-weight: 600; }
    .conciliacion-total td { border-color: #3B82F6; color: white; }
    .pending-zero { color: #10B981; font-weight: 600; }
    .pending-active { color: #FF9800; font-weight: 600; }

    /* Resultado */
    .resultado { background: #E8F5E9; padding: 20px; text-align: center; border: 1px solid #C8E6C9; margin: 15px 0; }
    .resultado-badge { display: inline-block; width: 60px; height: 60px; border-radius: 50%; background: #10B981; color: white; font-size: 32px; line-height: 60px; font-weight: 700; margin-bottom: 10px; }
    .resultado-badge.warning { background: #FF9800; }
    .resultado-text { font-weight: 700; font-size: 16px; color: #1A3A52; margin: 10px 0; }
    .resultado-desc { font-size: 10px; color: #6B7280; line-height: 1.5; }
    .resultado-info { font-size: 9px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #C8E6C9; color: #6B7280; }

    /* Observaciones */
    .observations-header { background: #E8E8E8; color: #666; }
    .observations-header th { background: #E8E8E8; color: #666; }
    .observations { border: 1px solid #D1D5DB; padding: 12px; background: #FAFBFC; font-size: 10px; color: #6B7280; }

    /* Footer */
    .footer { border-top: 1px solid #D1D5DB; padding-top: 15px; margin-top: 20px; display: grid; grid-template-columns: 1fr auto; gap: 15px; align-items: center; }
    .footer-left { font-size: 9px; }
    .footer-logo { font-weight: 700; color: #1A3A52; }
    .footer-tagline { font-size: 8px; color: #6B7280; margin-top: 2px; }
    .footer-right { text-align: right; font-size: 9px; font-weight: 600; color: #10B981; }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="logo-title">ZONA. FRANCA<br>BARRANQUILLA</div>
        <div class="logo-subtitle">CONTROL DE HERRAMIENTAS Y EQUIPOS</div>
      </div>
      <div class="doc-info">
        <div class="doc-number">No. ${numeroConsecutivo}</div>
        <div class="doc-date">Fecha de generación: ${formatoFechaHora(new Date())}</div>
        <div class="doc-date">Página 1 de 1</div>
      </div>
      <div class="qr-box">
        📱 QR<br>Código de seguimiento
      </div>
    </div>

    <!-- Barra título -->
    <div class="title-bar">REGISTRO DE ENTRADA Y SALIDA DE HERRAMIENTAS Y EQUIPOS</div>

    <!-- Grid info 4 columnas -->
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Radicado:</div>
        <div class="info-value">${numeroConsecutivo}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Fecha de ingreso:</div>
        <div class="info-value">${formatoFecha(fechaEntrada)} ${formatoHora(fechaEntrada)}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Estado:</div>
        <div style="margin-top: 6px;">
          <span style="display: inline-block; background: ${esCerrada ? '#10B981' : '#FF9800'}; color: white; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 10px;">
            ${esCerrada ? '✓ CERRADO' : '⚠ ACTIVO'}
          </span>
        </div>
      </div>
      <div class="info-box">
        <div class="info-label">Fecha de cierre:</div>
        <div class="info-value">${fechaCierre ? formatoFecha(fechaCierre) + ' ' + formatoHora(fechaCierre) : '-'}</div>
      </div>
    </div>

    <!-- Datos Contratista -->
    <div class="section-header">👤 DATOS DEL CONTRATISTA / PORTADOR</div>
    <div class="contractor-grid">
      <div class="contractor-field">
        <div class="contractor-label">👤 Nombre:</div>
        <div class="contractor-value">${contratista.nombre}</div>
      </div>
      <div class="contractor-field">
        <div class="contractor-label">🆔 C.C.:</div>
        <div class="contractor-value">${contratista.cedula}</div>
      </div>
      <div class="contractor-field">
        <div class="contractor-label">🏢 Empresa / Destino:</div>
        <div class="contractor-value">${contratista.empresa || '-'}</div>
      </div>
    </div>

    <!-- Ingreso de Herramientas -->
    <div class="section-header">🟢 INGRESO DE HERRAMIENTAS Y EQUIPOS</div>
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: 65%;">Herramienta / Equipo</th>
          <th style="width: 10%;">Cantidad</th>
          <th colspan="2" style="text-align: center;">FIRMAS DE INGRESO</th>
        </tr>
        <tr style="background: white; border-bottom: none;">
          <th style="width: 5%; border: none;"></th>
          <th style="width: 65%; border: none;"></th>
          <th style="width: 10%; border: none;"></th>
          <th style="width: 10%; border: 1px solid #D1D5DB; text-align: center; color: #6B7280; font-weight: 400; font-size: 8px;">Portador</th>
          <th style="width: 10%; border: 1px solid #D1D5DB; text-align: center; color: #6B7280; font-weight: 400; font-size: 8px;">Seguridad</th>
        </tr>
      </thead>
      <tbody>
        ${itemsEntrada.map((item: any, idx: number) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${item.herramienta?.nombre || item.descripcion}</td>
            <td style="text-align: center;">${item.cantidad}</td>
            <td class="signature-cell" style="text-align: center;">
              ${firmaEntradaAuxiliar ? `<img src="data:image/png;base64,${firmaEntradaAuxiliar}" class="signature-img">` : ''}
            </td>
            <td class="signature-cell" style="text-align: center;">

            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals-text">
      Total de tipos de herramientas: <strong>${itemsEntrada.length}</strong> &nbsp;&nbsp;&nbsp;&nbsp;
      Total de unidades: <strong>${totalIngresado}</strong>
    </div>

    <!-- Firmas principales -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 20px 0;">
      <div style="text-align: center;">
        <div style="font-weight: 600; font-size: 10px; margin-bottom: 8px;">Portador / Contratista</div>
        <div style="border-top: 2px solid #1A3A52; min-height: 50px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 8px;">
          ${firmaEntradaAuxiliar ? `<img src="data:image/png;base64,${firmaEntradaAuxiliar}" class="signature-img" style="max-height: 45px;">` : ''}
        </div>
        <div style="font-weight: 600; font-size: 10px;">${contratista.nombre}</div>
        <div style="font-size: 9px; color: #6B7280;">C.C.: ${contratista.cedula}</div>
      </div>
      <div style="text-align: center;">
        <div style="font-weight: 600; font-size: 10px; margin-bottom: 8px;">Seguridad</div>
        <div style="border-top: 2px solid #1A3A52; min-height: 50px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 8px;"></div>
        <div style="font-weight: 600; font-size: 10px;">${auxiliarNombre}</div>
        <div style="font-size: 9px; color: #6B7280;">C.C.: ${auxiliarCedula || '-'}</div>
      </div>
    </div>

    ${salidas.length > 0 ? `
      <div class="section">
        <table class="historial-header">
          <thead class="historial-header">
            <tr class="historial-header">
              <th>#</th>
              <th>Fecha / Hora</th>
              <th>Tipo</th>
              <th>Herramientas retiradas</th>
              <th>Cant.</th>
              <th>Retira</th>
              <th>Seguridad</th>
              <th>Firmas</th>
            </tr>
          </thead>
          <tbody>
            ${salidas.map((s: any, idx: number) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${formatoFecha(s.fechaSalida)}</strong><br>${formatoHora(s.fechaSalida)}</td>
                <td style="text-align: center;"><span class="badge-${s.esParcial ? 'partial' : 'final'}">${s.esParcial ? 'Parcial' : 'Final'}</span></td>
                <td>${s.items?.map((item: any) => `• ${item.item?.herramienta?.nombre || item.descripcion} (${item.cantidadSalida})`).join('<br>') || '-'}</td>
                <td style="text-align: center;">${s.items?.reduce((sum: number, item: any) => sum + item.cantidadSalida, 0) || 0}</td>
                <td>${s.nombreRetira || contratista.nombre}</td>
                <td>${s.auxiliarNombre || auxiliarNombre}</td>
                <td style="text-align: center;">✓</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}

    <!-- Conciliación -->
    <table class="conciliacion-header">
      <thead class="conciliacion-header">
        <tr class="conciliacion-header">
          <th>#</th>
          <th>Herramienta / Equipo</th>
          <th>Ingresó</th>
          <th>Retiró</th>
          <th>Pendiente</th>
        </tr>
      </thead>
      <tbody>
        ${itemsEntrada.map((item: any, idx: number) => {
          const retirado = salidas.reduce((sum: number, s: any) => {
            const sItem = s.items?.find((si: any) => si.item?.herramientaId === item.herramientaId);
            return sum + (sItem?.cantidadSalida || 0);
          }, 0);
          const pendiente = item.cantidad - retirado;
          return `
            <tr>
              <td>${idx + 1}</td>
              <td>${item.herramienta?.nombre || item.descripcion}</td>
              <td style="text-align: center;">${item.cantidad}</td>
              <td style="text-align: center;">${retirado}</td>
              <td style="text-align: center;"><span class="${pendiente === 0 ? 'pending-zero' : 'pending-active'}">${pendiente}</span></td>
            </tr>
          `;
        }).join('')}
        <tr class="conciliacion-total">
          <td colspan="2" style="text-align: right;">TOTALES</td>
          <td style="text-align: center;">${totalIngresado}</td>
          <td style="text-align: center;">${totalSalido}</td>
          <td style="text-align: center;">${totalPendiente}</td>
        </tr>
      </tbody>
    </table>

    <!-- Resultado -->
    <div class="resultado">
      <div class="resultado-badge ${esCerrada ? '' : 'warning'}">${esCerrada ? '✓' : '⚠'}</div>
      <div class="resultado-text">${esCerrada ? 'CERRADO' : 'PENDIENTE'}</div>
      <div class="resultado-desc">
        ${esCerrada ? 'Todas las herramientas y equipos registrados fueron retirados.' : `${totalPendiente} unidade(s) pendiente(s) de retiro.`}
      </div>
      <div class="resultado-info">
        Total de tipos: ${itemsEntrada.length} | Total de unidades: ${totalIngresado}<br>
        Fecha de cierre: ${fechaCierre ? formatoFechaHora(fechaCierre) : 'Pendiente'}
      </div>
    </div>

    <!-- Observaciones -->
    <table class="observations-header">
      <thead class="observations-header">
        <tr class="observations-header">
          <th>📝 OBSERVACIONES</th>
        </tr>
      </thead>
    </table>
    <div class="observations">Sin observaciones registradas.</div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">
        <div class="footer-logo">ZONA FRANCA</div>
        <div class="footer-tagline">Control • Seguridad • Cumplimiento</div>
      </div>
      <div class="footer-right">
        ♻️ Cero papel,<br>más seguridad
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}
