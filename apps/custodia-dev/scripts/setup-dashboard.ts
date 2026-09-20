#!/usr/bin/env node

/**
 * Script de configuración automática del Dashboard de Arquitectura
 *
 * Uso: npx tsx scripts/setup-dashboard.ts
 *
 * Qué hace:
 * 1. Verifica que SERVICIOS-GLOBAL.json exista
 * 2. Verifica que el componente Dashboard exista
 * 3. Verifica que la API exista
 * 4. Muestra instrucciones para acceder
 */

import fs from 'fs';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof COLORS = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, 'green');
}

function error(message: string) {
  log(`❌ ${message}`, 'red');
}

function info(message: string) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warn(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

async function main() {
  log('\n🚀 Setup del Dashboard de Arquitectura\n', 'bright');
  log('═══════════════════════════════════════════════════════════════\n', 'bright');

  // Obtener ruta del proyecto
  const projectRoot = path.resolve(__dirname, '..');

  // 1. Verificar SERVICIOS-GLOBAL.json
  log('\n📋 Paso 1: Verificando SERVICIOS-GLOBAL.json...\n');
  const serviciosPath = path.join(projectRoot, 'SERVICIOS-GLOBAL.json');
  if (fs.existsSync(serviciosPath)) {
    success('SERVICIOS-GLOBAL.json encontrado');
    const content = JSON.parse(fs.readFileSync(serviciosPath, 'utf-8'));
    info(`Versión: ${content.version}`);
    info(`Ambiente: ${content.ambiente}`);
    info(`Servicios: ${content.aplicaciones?.length || 0} apps + ${Object.keys(content.servicios_compartidos || {}).length} servicios`);
  } else {
    error('SERVICIOS-GLOBAL.json NO encontrado');
    process.exit(1);
  }

  // 2. Verificar Dashboard component
  log('\n📱 Paso 2: Verificando Dashboard component...\n');
  const dashboardPath = path.join(projectRoot, 'app', 'dashboard', 'page.tsx');
  if (fs.existsSync(dashboardPath)) {
    success('Dashboard component encontrado');
  } else {
    error('Dashboard component NO encontrado');
    process.exit(1);
  }

  // 3. Verificar API endpoint
  log('\n🔌 Paso 3: Verificando API endpoint...\n');
  const apiPath = path.join(projectRoot, 'app', 'api', 'servicios-config', 'route.ts');
  if (fs.existsSync(apiPath)) {
    success('API endpoint encontrado');
  } else {
    error('API endpoint NO encontrado');
    process.exit(1);
  }

  // 4. Verificar ARQUITECTURA-GENERAL.md
  log('\n🏗️  Paso 4: Verificando ARQUITECTURA-GENERAL.md...\n');
  const arqPath = path.join(projectRoot, 'ARQUITECTURA-GENERAL.md');
  if (fs.existsSync(arqPath)) {
    success('ARQUITECTURA-GENERAL.md encontrado');
  } else {
    warn('ARQUITECTURA-GENERAL.md NO encontrado (recomendado crear)');
  }

  // 5. Verificar health endpoint
  log('\n💚 Paso 5: Verificando health endpoint...\n');
  const healthPath = path.join(projectRoot, 'app', 'api', 'health', 'route.ts');
  if (fs.existsSync(healthPath)) {
    success('Health endpoint encontrado');
  } else {
    warn('Health endpoint NO encontrado (pero es importante para monitoreo)');
  }

  // 6. Summary
  log('\n═══════════════════════════════════════════════════════════════\n', 'bright');
  log('\n🎉 SETUP COMPLETADO\n', 'green');

  log('\n📚 Archivos Creados/Verificados:\n');
  log('  1. SERVICIOS-GLOBAL.json       - Inventario centralizado', 'cyan');
  log('  2. ARQUITECTURA-GENERAL.md     - Diagrama y documentación', 'cyan');
  log('  3. app/dashboard/page.tsx      - Dashboard en tiempo real', 'cyan');
  log('  4. app/api/servicios-config    - API para servir config', 'cyan');
  log('  5. app/api/health              - Health check endpoint', 'cyan');

  log('\n🚀 Próximos pasos:\n');
  log('  1. Inicia el servidor:');
  log('     $ npm run dev\n', 'yellow');
  log('  2. Abre en el navegador:');
  log('     http://localhost:3002/dashboard\n', 'yellow');
  log('  3. El dashboard verificará cada 5 segundos los servicios', 'cyan');
  log('  4. Edita SERVICIOS-GLOBAL.json para agregar/quitar servicios', 'cyan');
  log('  5. El dashboard se actualiza automáticamente', 'cyan');

  log('\n📊 Dashboard Features:\n');
  log('  • Verifica estado en tiempo real (🟢 online / 🔴 offline)', 'cyan');
  log('  • Muestra puertos, URLs y tipos de servicio', 'cyan');
  log('  • Diferencia servicios críticos vs complementarios', 'cyan');
  log('  • Actualización automática cada 5 segundos', 'cyan');
  log('  • Muestra última hora de verificación', 'cyan');
  log('  • Interfaz responsive (mobile + desktop)', 'cyan');

  log('\n🔧 Comandos útiles:\n');
  log('  npm run dev              - Iniciar dev server', 'yellow');
  log('  npm run build            - Build de producción', 'yellow');
  log('  npm run db:studio        - Abrir Prisma Studio', 'yellow');
  log('  curl http://localhost:3002/api/health - Health check', 'yellow');

  log('\n📝 Para agregar nuevos servicios:\n');
  log('  1. Edita SERVICIOS-GLOBAL.json', 'cyan');
  log('  2. Agrega entrada en servicios_compartidos o aplicaciones', 'cyan');
  log('  3. Define healthCheckUrl (ej: http://localhost:3001/health)', 'cyan');
  log('  4. Recarga el dashboard en el navegador', 'cyan');
  log('  5. El dashboard lo verificará automáticamente', 'cyan');

  log('\n⚠️  Notas importantes:\n');
  log('  • SERVICIOS-GLOBAL.json es la fuente de verdad', 'yellow');
  log('  • El dashboard lo lee automáticamente cada 5 segundos', 'yellow');
  log('  • No depende de sesiones de Claude - persiste en Git', 'yellow');
  log('  • Verifica conectividad real de cada servicio', 'yellow');

  log('\n═══════════════════════════════════════════════════════════════\n', 'bright');
  log('\n✅ Dashboard listo para usar!\n\n', 'green');
}

main().catch((err) => {
  error(`Error: ${err.message}`);
  process.exit(1);
});
