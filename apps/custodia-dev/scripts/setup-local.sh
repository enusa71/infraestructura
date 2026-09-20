#!/bin/bash

set -e

echo "🚀 Setup de Custodia en Local"
echo "=============================="
echo ""

# 1. Verificar dependencias
echo "✅ Step 1: Verificando dependencias..."
if ! command -v docker &> /dev/null; then
  echo "❌ Docker no instalado. Por favor instala Docker Desktop"
  exit 1
fi
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no instalado. Por favor instala Node.js"
  exit 1
fi
echo "   Docker: $(docker --version)"
echo "   Node: $(node --version)"
echo ""

# 2. Copiar .env
echo "✅ Step 2: Configurando .env..."
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo "   .env.local creado (edita con tus credenciales si es necesario)"
else
  echo "   .env.local ya existe"
fi
echo ""

# 3. Instalar dependencias npm
echo "✅ Step 3: Instalando dependencias npm..."
npm install --legacy-peer-deps
echo "   ✓ npm install completo"
echo ""

# 4. Iniciar BD
echo "✅ Step 4: Iniciando PostgreSQL + Gotenberg..."
docker-compose up -d postgres gotenberg
echo "   Esperando a que PostgreSQL esté listo..."
sleep 5
echo "   ✓ Servicios iniciados"
echo ""

# 5. Ejecutar migraciones
echo "✅ Step 5: Ejecutando migraciones..."
npm run db:migrate:dev
echo "   ✓ Migraciones aplicadas"
echo ""

# 6. Sembrar datos
echo "✅ Step 6: Sembrando datos de ejemplo..."
npm run db:seed
echo "   ✓ Datos iniciales cargados"
echo ""

# 7. Compilar
echo "✅ Step 7: Compilando la app..."
npm run build
echo "   ✓ Build completado"
echo ""

echo "🎉 Setup completado!"
echo ""
echo "Para iniciar el servidor de desarrollo:"
echo "   npm run dev"
echo ""
echo "La app estará en: http://localhost:3000"
echo ""
echo "Credenciales de ejemplo:"
echo "  - Contratista 1: Cédula 1098765432"
echo "  - Contratista 2: Cédula 1087654321"
echo "  - Contratista 3: Cédula 1076543210"
echo ""
echo "Para ver datos en la BD:"
echo "   npm run db:studio"
echo ""
