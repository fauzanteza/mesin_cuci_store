#!/bin/bash

# Backup Script for Mesin Cuci Store

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="mesin_cuci_db"
DB_NAME="mesin_cuci_store"
DB_USER="root"
# DB_PASSWORD should be set in environment or handled securely

mkdir -p $BACKUP_DIR

echo "Starting backup at $TIMESTAMP..."

# 1. Backup Database
echo "Backing up database..."
docker exec $DB_CONTAINER mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# 2. Backup Uploads (if any, e.g., in a volume)
# echo "Backing up uploads..."
# tar -czf "$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz" ./uploads

# 3. Rotate backups (keep last 7 days)
find $BACKUP_DIR -name "db_backup_*" -mtime +7 -delete

echo "Backup completed!"
