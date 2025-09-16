#!/bin/bash

# This script is used to prepare the build for deployment on Render

# First, run the standard build command
echo "Running standard build..."
npm run build

# Create the necessary directory structure
echo "Creating proper directory structure for deployment..."

# Ensure we have the client directory structure
mkdir -p dist/client

# Check if we have the expected build output
if [ -d "dist/assets" ]; then
  echo "Copying assets to client folder..."
  mkdir -p dist/client/assets
  cp -R dist/assets/* dist/client/assets/
fi

# Copy index.html to client folder
if [ -f "dist/index.html" ]; then
  echo "Copying index.html to client folder..."
  cp dist/index.html dist/client/
fi

# Create an info.txt file to help with debugging
echo "Build completed at $(date)" > dist/client/info.txt
echo "NODE_ENV: $NODE_ENV" >> dist/client/info.txt
echo "PWD: $(pwd)" >> dist/client/info.txt
echo "Files in dist: $(ls -la dist)" >> dist/client/info.txt
echo "Files in dist/client: $(ls -la dist/client)" >> dist/client/info.txt

# Create data directory with proper permissions
echo "Creating data directory with proper permissions..."
mkdir -p data
chmod 777 data
echo "Data directory created and permissions set"

echo "Deployment preparation complete!"