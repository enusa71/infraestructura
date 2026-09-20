#!/bin/bash

# Script de Setup para Producción - Custodia Salidas Parciales
# Ejecutar en srv-lab: cd /opt/custodia-new && bash setup-produccion.sh

set -e

echo "🚀 Setup Producción - Custodia Salidas Parciales"
echo "=================================================="
echo ""

# 1. Actualizar código desde GitHub
echo "📥 Paso 1: Actualizando código desde GitHub..."
git pull origin main
echo "✅ Código actualizado"
echo ""

# 2. Instalar dependencias
echo "📦 Paso 2: Instalando dependencias..."
npm install
echo "✅ Dependencias instaladas"
echo ""

# 3. Ejecutar migraciones Prisma
echo "🔄 Paso 3: Ejecutando migraciones de BD..."
npm run db:migrate
echo "✅ Migraciones completadas"
echo ""

# 4. Build de Next.js
echo "🔨 Paso 4: Compilando aplicación..."
npm run build
echo "✅ Compilación completada"
echo ""

# 5. Mostrar status
echo "📊 Paso 5: Verificando status..."
echo ""
echo "✓ Código: $(git rev-parse --short HEAD)"
echo "✓ Rama: $(git branch --show-current)"
echo "✓ Node: $(node --version)"
echo "✓ NPM: $(npm --version)"
echo ""

echo "🎉 Setup completado exitosamente"
echo ""
echo "Próximos pasos:"
echo "1. Reiniciar el servidor: npm run dev (o usar pm2 en producción)"
echo "2. Verificar: curl http://localhost:3000/api/health"
echo "3. Probar flujo de salida: http://10.1.9.250:3000/salida"
echo ""
