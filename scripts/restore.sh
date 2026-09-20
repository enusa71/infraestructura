#!/bin/bash
set -e
if [ -z "$1" ]; then
  echo "Uso: $0 /ruta/al/backup"
  exit 1
fi
BACKUP_DIR=$1
if [ ! -d "$BACKUP_DIR" ]; then
  echo "Error: Directorio no existe"
  exit 1
fi
echo "Restaurando PostgreSQL..."
docker exec -i laboratorio-postgres psql -U custodia < $BACKUP_DIR/custodia_db.sql
echo "Restaurando volúmenes..."
docker run --rm -v laboratorio_postgres-data:/data -v $BACKUP_DIR/volumes:/backup alpine tar xzf /backup/postgres-data.tar.gz -C /data
docker run --rm -v laboratorio_portainer-data:/data -v $BACKUP_DIR/volumes:/backup alpine tar xzf /backup/portainer-data.tar.gz -C /data
echo "✅ Restauración completada"
