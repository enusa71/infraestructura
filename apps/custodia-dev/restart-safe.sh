#!/bin/bash
set -e

cd /opt/custodia-new

echo "🔧 Parando servicios..."
sudo docker compose stop

echo "🧹 Eliminando contenedor de app (sin perder BD)..."
sudo docker container rm -f custodia-app || true

echo "📦 Eliminando contenedor de gotenberg..."
sudo docker container rm -f custodia-gotenberg || true

echo "⬆️  Actualizando código..."
git pull origin main

echo "🚀 Iniciando servicios..."
sudo docker compose up -d

echo "✅ Listo. Esperando a que compile..."
sleep 10

echo "📊 Estado:"
sudo docker compose ps

echo "📝 Logs de app (últimas 20 líneas):"
sudo docker compose logs app --tail 20
