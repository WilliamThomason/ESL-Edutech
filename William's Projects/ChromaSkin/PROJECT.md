# ChromaSkin — Project Plan

## Vision
A Winamp-style color theme engine for web apps. One CSS variable (`--hue`) controls the entire color palette. Users can pick from presets, use a hue slider, save custom themes, and export CSS/JSON for use in other projects.

## Architecture
```
ChromaSkin/
├── index.html          ← Main app (theme engine + preview)
├── chromaskin.css      ← Standalone CSS library (drop-in for any project)
├── chromaskin.js       ← Standalone JS library (theme switcher logic)
├── themes/             ← Theme preset collections
│   ├── winamp-classic.json
│   ├── muted-io.json
│   └── user-saved.json
└── README.md           ← Documentation
```

## Core Features (MVP — Done)
- [x] 20 preset themes (Midnight, Sunset, Neon Pink, Electric Blue, Emerald, etc.)
- [x] Hue slider (0-360°) with live preview
- [x] Saturation slider (0-100%)
- [x] Lightness slider (10-90%)
- [x] Quick color swatches
- [x] Save/load custom themes (localStorage)
- [x] Export CSS variables
- [x] Export JSON
- [x] Live preview with UI components
- [x] Responsive layout

## Task List

### Phase 1: Core Engine ✅
- [x] HSL-based color system (--hue, --sat, --lit)
- [x] Derived palette (accent, bg, text, borders, semantic colors)
- [x] Preset theme grid
- [x] Hue/sat/lit sliders
- [x] Custom theme save/load (localStorage)
- [x] CSS/JSON export
- [x] Live preview (cards, buttons, forms, fretboard)

### Phase 2: ChromaSkin Library (NEXT)
- [ ] Extract engine into standalone `chromaskin.css`
- [ ] Extract logic into standalone `chromaskin.js`
- [ ] NPM package structure
- [ ] Framework adapters (React, Vue, Svelte)
- [ ] Tailwind plugin

### Phase 3: Theme Collections
- [ ] Winamp classic skins (29 preset replicas)
- [ ] muted.io theme export
- [ ] Eloquenta theme export
- [ ] Forest Friends theme export
- [ ] OobzoO theme export
- [ ] Community theme sharing

### Phase 4: Integration with Existing Projects
- [ ] Apply to Guitar Scales app
- [ ] Apply to Metronome app
- [ ] Apply to Forest Friends
- [ ] Apply to Eloquenta landing
- [ ] Apply to OobzoO DAW
- [ ] Apply to DAW

### Phase 5: Advanced Features
- [ ] Theme scheduler (auto-switch by time of day)
- [ ] Audio-reactive themes (beat-synced color shifts)
- [ ] Per-section themes (different hues for different page areas)
- [ ] Gradient themes (multi-hue)
- [ ] Import from image (extract dominant colors)
- [ ] Accessibility checker (contrast ratios)
- [ ] Theme marketplace/store
- [ ] Winamp skin file (.wsz) import
- [ ] Visual theme editor (drag-drop zones)
- [ ] Dark/Light mode toggle
- [ ] Export as CSS, SCSS, JSON, Tailwind config

### Phase 6: Polish
- [ ] Smooth theme transition animations
- [ ] Keyboard shortcuts
- [ ] URL parameter loading (?theme=sunset)
- [ ] Embed code generator
- [ ] Documentation site
- [ ] Demo gallery

## Technical Notes
- Single `--hue` variable drives entire palette via HSL
- Saturation and lightness are secondary controls
- All derived colors use `hsl(var(--hue), var(--sat), var(--lit))` pattern
- No external dependencies — pure CSS + vanilla JS
- localStorage for persistence
- Works as drop-in CSS override for any project

## Color Philosophy
- Hue: 0-360 (full color wheel)
- Sat: 0-100% (gray to vivid)
- Lit: 10-90% (dark to light)
- Derived palette maintains perceptual consistency
- Semantic colors (success, warning, danger) are hue-shifted, not hardcoded
