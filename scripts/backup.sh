#!/bin/bash

# ETAPA 8 - Script de Backup
# Realiza backup de PostgreSQL, volúmenes y configuración

set -e

BACKUP_DIR=~/infraestructura/backups/$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "📦 Iniciando backup..."

# 1. Backup de PostgreSQL
echo "💾 Backup de PostgreSQL..."
docker exec laboratorio-postgres pg_dump -U custodia custodia_dev > $BACKUP_DIR/custodia_db.sql

# 2. Backup de volúmenes
echo "📁 Backup de volúmenes..."
mkdir -p $BACKUP_DIR/volumes
docker run --rm -v laboratorio_postgres-data:/data -v $BACKUP_DIR/volumes:/backup alpine tar czf /backup/postgres-data.tar.gz -C /data .
docker run --rm -v laboratorio_portainer-data:/data -v $BACKUP_DIR/volumes:/backup alpine tar czf /backup/portainer-data.tar.gz -C /data .

# 3. Backup de .env
echo "🔐 Backup de configuración..."
cp ~/infraestructura/apps/custodia-dev/.env $BACKUP_DIR/.env
cp ~/infraestructura/compose/laboratorio/docker-compose.yml $BACKUP_DIR/docker-compose.yml

# 4. Crear archivo de metadata
cat > $BACKUP_DIR/BACKUP_INFO.txt << 'EOF'
Backup realizado: $(date)
Contenido:
- custodia_db.sql (PostgreSQL dump)
- volumes/postgres-data.tar.gz (datos PostgreSQL)
- volumes/portainer-data.tar.gz (datos Portainer)
- .env (configuración)
- docker-compose.yml (servicios)

Para restaurar:
  bash ~/infraestructura/scripts/restore.sh $BACKUP_DIR
EOF

echo "✅ Backup completado en: $BACKUP_DIR"
echo "📍 Ubicación: $BACKUP_DIR"
