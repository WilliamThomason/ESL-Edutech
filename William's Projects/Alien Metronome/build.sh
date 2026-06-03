#!/bin/bash
set -e

echo "═══ Alien Metronome — Store Build Script ═══"
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm required"; exit 1; }

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate icons
echo "Generating app icons..."
node generate-icons.js

# Build dist
echo "Building distribution..."
mkdir -p dist
cp index.html dist/
cp manifest.json dist/
cp sw.js dist/
cp icon-192.png dist/ 2>/dev/null || echo "Warning: icon-192.png not found"
cp icon-512.png dist/ 2>/dev/null || echo "Warning: icon-512.png not found"

# Capacitor native builds (if installed)
if command -v npx >/dev/null 2>&1; then
    echo ""
    echo "═══ Capacitor Native Builds ═══"
    echo ""
    
    # Check if capacitor is installed
    if [ ! -d "node_modules/@capacitor" ]; then
        echo "Installing Capacitor..."
        npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
        npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/haptics @capacitor/keyboard
    fi
    
    # Add iOS platform
    if [ -d "ios" ]; then
        echo "iOS platform already exists, syncing..."
        npx cap sync ios
    else
        echo "Adding iOS platform..."
        npx cap add ios
    fi
    
    # Add Android platform
    if [ -d "android" ]; then
        echo "Android platform already exists, syncing..."
        npx cap sync android
    else
        echo "Adding Android platform..."
        npx cap add android
    fi
    
    echo ""
    echo "═══ Build Instructions ═══"
    echo ""
    echo "iOS (requires macOS + Xcode):"
    echo "  npx cap open ios"
    echo "  Then in Xcode: Product → Archive → Distribute App"
    echo ""
    echo "Android (requires Android Studio):"
    echo "  npx cap open android"
    echo "  Then in Android Studio: Build → Generate Signed Bundle/APK"
    echo ""
fi

echo "═══ Build Complete ═══"
echo ""
echo "Output: dist/"
echo "Files:"
ls -la dist/
