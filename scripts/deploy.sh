                    #!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment of Mesin Cuci Store...${NC}"

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    echo -e "${YELLOW}📋 Loading environment variables...${NC}"
    source .env
else
    echo -e "${RED}❌ .env file not found. Please create one from .env.example${NC}"
    exit 1
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Build and start new containers
echo -e "${YELLOW}🔨 Building and starting containers...${NC}"
docker-compose up -d --build

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Run database migrations
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
docker-compose exec backend npm run migrate

# Seed database if needed
if [ "$SEED_DATABASE" = "true" ]; then
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    docker-compose exec backend npm run seed
fi

# Check service health
echo -e "${YELLOW}🏥 Checking service health...${NC}"
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

if [ "$FRONTEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
fi

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${YELLOW}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}🔧 Backend API: http://localhost:5000${NC}"
echo -e "${YELLOW}📊 Admin: http://localhost:3000/admin${NC}"
