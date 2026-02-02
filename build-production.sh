#!/bin/bash

# OBUDMS Production Build Script
# This script prepares the application for production deployment

echo "========================================="
echo "OBUDMS Production Build"
echo "========================================="
echo ""

# Check if we're in the project root
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Backend Build
echo "📦 Installing backend dependencies..."
cd backend
npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"
cd ..

# Frontend Build
echo ""
echo "📦 Building frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend built successfully (output in frontend/dist)"
cd ..

echo ""
echo "========================================="
echo "✅ Production build completed!"
echo "========================================="
echo ""
echo "Next Steps:"
echo "1. Configure environment variables (.env files)"
echo "2. Deploy backend to your hosting platform"
echo "3. Deploy frontend/dist to static hosting"
echo "4. Update API URLs in frontend code if needed"
echo ""
echo "See deployment_guide.md for detailed instructions"
