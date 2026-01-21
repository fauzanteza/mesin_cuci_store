#!/bin/bash

# Deployment Script for Mesin Cuci Store

echo "Starting deployment process..."

# 1. Pull latest changes (if using git on server)
# git pull origin main

# 2. Build and start containers
echo "Building and starting Docker containers..."
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Clean up unused images
echo "Cleaning up unused Docker images..."
docker image prune -f

echo "Deployment completed successfully!"
