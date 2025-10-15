# 3D Models Directory

Dieses Verzeichnis ist für zukünftige 3D-Modelle vorgesehen.

## Geplante Struktur:
```
models/
├── buildings/          # Gebäude-Modelle
│   ├── house_medieval.gltf
│   ├── tower.gltf
│   └── church.gltf
├── environment/        # Umgebungs-Objekte  
│   ├── tree_oak.gltf
│   ├── fountain.gltf
│   └── textures/
└── terrain/           # Terrain-Objekte
    ├── ground.gltf
    ├── rocks.gltf
    └── grass.gltf
```

## Blender Export Settings:
- Format: GLTF/GLB
- Include: Animations, Materials, Textures
- Transform: +Y Up
- Compression: DRACO (optional)

## Aktuelle Implementation:
Die App verwendet aktuell **prozedurale Generierung** und läuft ohne externe Modelle.
Sobald Modelle verfügbar sind, werden sie automatisch geladen.