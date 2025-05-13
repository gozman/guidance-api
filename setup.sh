#!/bin/bash

# Guidance API Setup Script

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Guidance API Setup ===${NC}"
echo "This script will help you set up the Guidance API."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js (v14 or higher) from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ $NODE_MAJOR_VERSION -lt 14 ]; then
    echo -e "${YELLOW}Warning: You are using Node.js v$NODE_VERSION.${NC}"
    echo "Guidance API recommends Node.js v14 or higher."
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup aborted."
        exit 1
    fi
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    echo "npm should be included with Node.js. Please reinstall Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}Node.js v$NODE_VERSION and npm are installed.${NC}"

# Install dependencies
echo -e "\n${GREEN}Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install dependencies.${NC}"
    exit 1
fi

echo -e "${GREEN}Dependencies installed successfully!${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "\n${GREEN}Creating .env file from example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env file created. Please update it with your Browserbase API key.${NC}"
    echo -e "${YELLOW}Note: If you don't have a Browserbase API key, the API will fall back to using a local browser.${NC}"
fi

# Success message
echo -e "\n${GREEN}=== Setup Complete! ===${NC}"
echo "You can now start the server with:"
echo -e "${YELLOW}npm start${NC}"
echo ""
echo "Or for development with auto-restart:"
echo -e "${YELLOW}npm run dev${NC}"
echo ""
echo "API will be available at: http://localhost:3000"
echo -e "Web client example: ${YELLOW}open examples/instructions-client.html${NC}"

# Ask if user wants to start the server
echo ""
read -p "Do you want to start the server now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Starting server...${NC}"
    npm start
fi
