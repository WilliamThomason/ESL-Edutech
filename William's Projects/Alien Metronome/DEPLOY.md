# Alien Metronome — Store Deployment Guide

## Quick Start

```bash
cd "/home/irieb/site/William's Projects/Alien Metronome"
./build.sh
```

## What's Included

- `index.html` — The complete metronome app (single file, ~1450 lines)
- `manifest.json` — PWA manifest for installability
- `sw.js` — Service worker for offline support
- `capacitor.config.json` — Capacitor config for native builds
- `build.sh` — Build script
- `generate-icons.js` — Icon generation script
- `store-metadata.json` — App Store / Play Store listing text
- `ios-config.json` — iOS-specific Xcode settings
- `android-config.json` — Android-specific Gradle settings

## Deployment Options

### Option 1: PWA (Web) — Easiest
Upload all files to any HTTPS-enabled web server. Users can "Add to Home Screen" from their browser.

**Requirements:** HTTPS, service worker, manifest.json

### Option 2: iOS App Store (requires macOS + Xcode)

```bash
npm install
./build.sh
npx cap open ios
```

Then in Xcode:
1. Set your Development Team (Signing & Capabilities)
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload

**Requirements:**
- macOS 13+
- Xcode 15+
- Apple Developer account ($99/year)
- App Store Connect setup

### Option 3: Google Play Store (requires Android Studio)

```bash
npm install
./build.sh
npx cap open android
```

Then in Android Studio:
1. Build → Generate Signed Bundle/APK
2. Upload AAB to Play Console

**Requirements:**
- Android Studio
- Google Play Developer account ($25 one-time)
- Play Console setup

## App Store Submission Checklist

### iOS (App Store Connect)
- [ ] Create new App record (Bundle ID: com.eloquenta.alienmetronome)
- [ ] Upload screenshots (6.7", 6.5", 5.5" iPhone + 12.9" iPad)
- [ ] Write description (use store-metadata.json)
- [ ] Set keywords
- [ ] Upload app archive from Xcode
- [ ] Complete App Review information
- [ ] Submit for review

### Android (Play Console)
- [ ] Create new app (Package: com.eloquenta.alienmetronome)
- [ ] Upload feature graphic (1024x500)
- [ ] Upload screenshots (phone + tablet)
- [ ] Write description (use store-metadata.json)
- [ ] Upload AAB from Android Studio
- [ ] Complete content rating questionnaire
- [ ] Submit for review

## File Structure for Distribution

```
dist/
├── index.html          (main app — all JS/CSS inline)
├── manifest.json       (PWA manifest)
├── sw.js               (service worker)
├── icon-192.png        (PWA icon)
├── icon-512.png        (PWA icon)
└── apple-touch-icon.png (iOS home screen icon — optional)
```

## Important Notes

1. **All audio is generated via Web Audio API** — no audio files needed
2. **No external dependencies** — completely self-contained
3. **No network required after install** — works fully offline
4. **No data collection** — no analytics, no tracking, no permissions needed
5. **Safe for all ages** — content rating 4+

## Icon Generation

If you have a design tool, create icons at these sizes:
- 192x192 (Android PWA)
- 512x512 (Android splash)
- 180x180 (iOS home screen)
- 1024x1024 (App Store listing)
- Various splash screen sizes for iOS devices

Or use the included `generate-icons.js` (requires Node.js + sharp):
```bash
npm install sharp
node generate-icons.js
```
