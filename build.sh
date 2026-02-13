#!/bin/bash
# Vercel build script with proper permissions

echo "Installing dependencies..."
npm install

echo "Building with Vite..."
npx vite build

echo "Build complete!"
