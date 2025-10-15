# Copilot Instructions

## Project Overview
A WebGL-based 3D historic city visualization using Three.js, Vite, and modern web technologies. The app creates an interactive 3D environment with dynamic lighting, day/night cycles, and camera controls for exploring a procedurally generated historic cityscape.

**Tech Stack**: HTML5, CSS3, JavaScript ES6+, WebGL, Three.js, Vite build system
**Architecture**: Single-page application with modular class-based structure in `src/main.js`

## Development Workflow
```bash
npm install          # Install dependencies  
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

**Debugging**: Use browser DevTools for WebGL debugging. Three.js provides built-in performance monitoring via `renderer.info`. Check console for asset loading errors.

## Code Conventions
- **Class-based architecture**: Main app in `HistoricCityApp` class with clear method separation
- **Three.js object lifecycle**: Always dispose geometries/materials to prevent memory leaks
- **Asset loading**: Use `LoadingManager` for coordinated asset loading with progress tracking
- **Event handling**: Centralized in `setupEventListeners()` method
- **German UI**: Interface labels in German, code comments/variables in English

## Key Files and Directories
- `src/main.js`: Core application class with 3D scene setup, lighting, and interaction logic
- `src/styles/main.css`: Responsive UI styling with WebGL-specific classes and backdrop filters
- `vite.config.js`: Build configuration with aliases and dev server settings
- `public/`: Static assets directory for 3D models, textures, and icons
- `index.html`: Single HTML entry point with canvas element and control panels

## Integration Points
- **Three.js Loaders**: GLTFLoader, DRACOLoader for 3D model imports from Blender
- **WebGL Rendering**: Anti-aliasing enabled, shadow mapping with PCFSoftShadowMap
- **Browser APIs**: Fullscreen API, ResizeObserver for responsive rendering
- **Asset Pipeline**: Vite handles ES module imports, Three.js examples via `three/examples/jsm/`

## 3D Development Patterns
- **Scene Management**: Organized groups for buildings, terrain, vegetation
- **Lighting System**: Ambient + Directional light with time-based positioning and color
- **Controls**: OrbitControls with damping, distance limits, and polar angle constraints
- **Performance**: Use `requestAnimationFrame` loop, enable frustum culling, dispose unused objects