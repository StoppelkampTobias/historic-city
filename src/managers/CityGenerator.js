import * as THREE from 'three';

/**
 * CityGenerator - Generiert prozedurale 3D-Stadtstrukturen
 * Verantwortlichkeiten:
 * - Prozedurale Gebäude-Generierung
 * - Terrain/Boden-Erstellung
 * - Vegetation (Bäume, Büsche)
 * - Straßen und Plätze
 * - Layout-Algorithmen
 */
export class CityGenerator {
    constructor(scene) {
        this.scene = scene;
        this.cityModels = [];
        this.buildings = [];
        this.vegetation = [];
        this.terrain = null;
        
        // Generierungs-Parameter
        this.cityConfig = {
            size: { width: 80, depth: 80 },
            buildingCount: 15,
            treeCount: 20,
            buildingStyles: ['medieval', 'tower', 'house'],
            colors: {
                buildings: [0x8B7355, 0xA0522D, 0xCD853F, 0xDEB887],
                roofs: [0x8B4513, 0x654321, 0x2F4F4F],
                vegetation: [0x228B22, 0x32CD32, 0x006400]
            }
        };
    }
    
    // Hauptmethode zur Stadtgenerierung
    generateCity() {
        this.clearCity();
        this.createSimpleScene();
        
        console.log('🎯 Einfache Szene erstellt: Grid-Fläche + Test-Box');
    }
    
    clearCity() {
        // Alte Stadt entfernen
        [...this.cityModels].forEach(model => {
            this.scene.remove(model);
            this.disposeModel(model);
        });
        
        this.cityModels = [];
        this.buildings = [];
        this.vegetation = [];
    }
    
    createSimpleScene() {
        // 1. Grid-Fläche erstellen
        this.createGridGround();
        
        // 2. Eine einfache Test-Box
        this.createTestBox();
    }
    
    createGridGround() {
        // Hauptboden mit Grid-Pattern
        const groundSize = 50;
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        
        // Grid-Material erstellen
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x606060,
            transparent: true,
            opacity: 0.8
        });
        
        this.terrain = new THREE.Mesh(groundGeometry, groundMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.terrain.name = 'grid-ground';
        
        this.scene.add(this.terrain);
        this.cityModels.push(this.terrain);
        
        // Grid-Linien hinzufügen
        this.createGridLines(groundSize);
    }
    
    createGridLines(size) {
        const gridHelper = new THREE.GridHelper(size, 20, 0x444444, 0x444444);
        gridHelper.name = 'grid-helper';
        gridHelper.position.y = 0.01; // Leicht über dem Boden
        
        this.scene.add(gridHelper);
        this.cityModels.push(gridHelper);
    }
    
    createTestBox() {
        // Eine einfache Box in der Mitte
        const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
        const boxMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00aaff 
        });
        
        const testBox = new THREE.Mesh(boxGeometry, boxMaterial);
        testBox.position.set(0, 1, 0); // Mittig, 1 Einheit über dem Boden
        testBox.castShadow = true;
        testBox.receiveShadow = true;
        testBox.name = 'test-box';
        
        this.scene.add(testBox);
        this.cityModels.push(testBox);
        this.buildings.push(testBox); // Als "Gebäude" zählen
    }
    
    
    // Utility methods
    getCityModels() {
        return this.cityModels;
    }
    
    getBuildings() {
        return this.buildings;
    }
    
    getVegetation() {
        return this.vegetation;
    }
    
    updateCityConfig(config) {
        this.cityConfig = { ...this.cityConfig, ...config };
    }
    
    // Box-Animation für Demonstration
    animateTestBox() {
        const testBox = this.scene.getObjectByName('test-box');
        if (testBox) {
            // Einfache Rotation
            testBox.rotation.y += 0.01;
        }
    }
    
    disposeModel(model) {
        model.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
    
    // Cleanup
    dispose() {
        this.clearCity();
    }
}