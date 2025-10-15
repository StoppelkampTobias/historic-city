# Historic City - 3D WebGL Experience

Ein interaktives 3D-Weberlebnis einer historischen Stadt mit modernen Web-Technologien.

## 🎯 Aktueller Status

Grundgerüst mit minimaler Szene:
- ✅ Grid-Fläche mit Koordinatensystem
- ✅ Test-Box mit Animation und Schatten
- ✅ Vollständiges Tag/Nacht-System
- ✅ Interaktive Kamera-Steuerung
- ✅ Modulare Architektur (SoC)

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **3D Graphics**: WebGL, Three.js
- **Build Tool**: Vite
- **Package Manager**: npm
- **Architecture**: Modular Manager Pattern

## 🚀 Quick Start

```bash
# Installation
npm install

# Development Server
npm run dev

# Build für Produktion
npm run build

# Preview Build
npm run preview
```

## 📁 Projekt Struktur

```
historic-city/
├── src/
│   ├── main.js              # App Orchestrierung
│   ├── managers/            # Modulare Manager (SoC)
│   │   ├── SceneManager.js  # 3D Scene, Camera, Renderer
│   │   ├── LightingManager.js # Tag/Nacht-System
│   │   ├── AssetLoader.js   # 3D Model Loading
│   │   ├── CityGenerator.js # Szene Generierung
│   │   └── UIController.js  # Event Handling
│   └── styles/
│       └── main.css         # Responsive UI Styling
├── public/
│   └── models/              # 3D Assets (geplant)
├── index.html               # Single Page App
└── vite.config.js           # Build Konfiguration
```

## 🎮 Bedienung

### Maus-Steuerung
- **Linke Maustaste + Ziehen**: Kamera rotieren
- **Mausrad**: Zoom
- **Rechte Maustaste + Ziehen**: Kamera verschieben

### Tastatur-Shortcuts
- **F**: Vollbild umschalten
- **R**: Kamera zurücksetzen
- **T**: Tag/Nacht umschalten
- **I**: Debug-Info anzeigen

### UI-Controls
- **Tageszeit-Slider**: Kontinuierliche Zeitänderung (0-24h)
- **Jahreszeiten-Auswahl**: Saisonale Lichteffekte

## 🏗️ Architektur

### Manager Pattern (Separation of Concerns)
Jeder Manager hat eine spezifische Verantwortlichkeit:

- **SceneManager**: Three.js Grundlagen, Kamera, Renderer
- **LightingManager**: Dynamische Beleuchtung, Atmosphäre
- **AssetLoader**: 3D-Model Loading, Caching
- **CityGenerator**: Szenen-/Stadt-Generierung
- **UIController**: DOM Events, Interface Logic

### Development Features
- **Hot Reload**: Automatisches Neuladen bei Änderungen
- **Debug Mode**: Performance-Monitoring und Render-Stats
- **Console Commands**: `regenerateCity()`, `toggleDebug()`

## 🎨 Geplante Features

- [ ] Blender 3D-Model Integration
- [ ] Prozedurale Stadtgenerierung
- [ ] Particle Systems (Feuer, Rauch, Wasser)
- [ ] Post-Processing Effects
- [ ] Sound Design & Ambient Audio
- [ ] VR/AR Support
- [ ] Multiplayer Exploration

## 🔧 Entwicklung

### 3D-Model Integration
```javascript
// Für später - Blender Assets
const loader = new GLTFLoader();
loader.load('/models/building.gltf', (gltf) => {
    scene.add(gltf.scene);
});
```

### Performance Optimierung
- LOD (Level of Detail)
- Frustum Culling
- Instanced Rendering
- DRACO Compression

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📦 Dependencies

### Production
- `three`: ^0.158.0 - 3D Graphics Library

### Development  
- `vite`: ^5.0.0 - Build Tool & Dev Server

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Öffne einen Pull Request

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 🔗 Links

- [Three.js Dokumentation](https://threejs.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

---

**Status**: 🚧 Early Development - Grundgerüst implementiert