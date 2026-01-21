#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Starting tests for Mesin Cuci Store...${NC}"

# Test Backend
echo -e "${YELLOW}🔧 Testing Backend...${NC}"
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Run backend tests
echo -e "${YELLOW}🚀 Running backend tests...${NC}"
npm test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend tests passed${NC}"
else
    echo -e "${RED}❌ Backend tests failed${NC}"
    exit 1
fi

cd ..

# Test Frontend
echo -e "${YELLOW}🎨 Testing Frontend...${NC}"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Run frontend tests
echo -e "${YELLOW}🚀 Running frontend tests...${NC}"
npm test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests passed${NC}"
else
    echo -e "${RED}❌ Frontend tests failed${NC}"
    exit 1
fi

cd ..

# Run E2E tests
echo -e "${YELLOW}🌐 Running E2E tests...${NC}"
if [ -f "cypress.config.js" ]; then
    npx cypress run
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ E2E tests passed${NC}"
    else
        echo -e "${RED}❌ E2E tests failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️ E2E tests not configured${NC}"
fi

echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
