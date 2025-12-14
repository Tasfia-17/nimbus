#!/bin/bash

# Agent Platform Quick Start Script
# This script starts all required services for the platform

set -e

echo "🚀 Starting Agent Platform..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Start Kestra (if not already running)
echo -e "${BLUE}📦 Starting Kestra...${NC}"
if ! docker ps | grep -q kestra; then
    docker run -d --name kestra --rm -p 8080:8080 kestra/kestra:latest server local
    echo -e "${GREEN}✅ Kestra started on http://localhost:8080${NC}"
else
    echo -e "${GREEN}✅ Kestra is already running${NC}"
fi

# Wait for Kestra to be ready
echo -e "${BLUE}⏳ Waiting for Kestra to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8080/api/v1/flows > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Kestra is ready!${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
fi

# Generate Prisma client if needed
echo -e "${BLUE}🗄️  Checking database...${NC}"
npx prisma generate > /dev/null 2>&1

# Start the Next.js development server
echo -e "${BLUE}🎨 Starting Next.js development server...${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Agent Platform is running!${NC}"
echo ""
echo -e "  ${BLUE}Dashboard:${NC}     http://localhost:3000/dashboard"
echo -e "  ${BLUE}Create Agent:${NC}  http://localhost:3000/agents/new"
echo -e "  ${BLUE}Kestra UI:${NC}     http://localhost:8080"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

npm run dev
