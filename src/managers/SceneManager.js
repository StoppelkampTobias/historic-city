import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraManager } from './CameraManager.js';

/**
 * SceneManager - Verwaltet die Three.js Grundkomponenten
 * Verantwortlichkeiten:
 * - Scene, Camera, Renderer Setup
 * - Camera Controls (OrbitControls)
 * - Window Resize Handling
 * - Render Loop Koordination
 */
export class SceneManager {
    constructor(canvasId = 'webgl-canvas') {
        this.scene = null;
        this.cameraManager = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            throw new Error(`Canvas mit ID "${canvasId}" nicht gefunden`);
        }
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupRenderer();
        this.setupCameraManager();
        this.setupEventListeners();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Himmelblau
        
        // Fog für Atmosphäre
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    
    setupCameraManager() {
        this.cameraManager = new CameraManager(this.renderer);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // CameraManager über Resize informieren
        this.cameraManager.resize(width, height);
        
        // Renderer aktualisieren
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    resetCamera() {
        // Reset für aktuellen Kamera-Modus
        const currentMode = this.cameraManager.getCurrentMode();
        const modes = this.cameraManager.getModes();
        
        if (currentMode === modes.DRONE) {
            // Drohnen-Kamera zurücksetzen
            this.cameraManager.droneCamera.position.set(0, 10, 10);
            this.cameraManager.droneYaw = 0;
            this.cameraManager.dronePitch = 0;
            
            // Quaternion korrekt zurücksetzen
            const euler = new THREE.Euler(0, 0, 0, 'YXZ');
            this.cameraManager.droneCamera.quaternion.setFromEuler(euler);
        } else if (currentMode === modes.PERSON) {
            // Personen-Kamera zurücksetzen
            this.cameraManager.personCamera.position.set(0, this.cameraManager.personHeight, 5);
            this.cameraManager.personYaw = 0;
            this.cameraManager.personPitch = 0;
            
            // Quaternion korrekt zurücksetzen
            const euler = new THREE.Euler(0, 0, 0, 'YXZ');
            this.cameraManager.personCamera.quaternion.setFromEuler(euler);
        }
    }
    
    update() {
        const deltaTime = this.clock.getDelta();
        this.cameraManager.update(deltaTime);
        return deltaTime;
    }
    
    render() {
        const activeCamera = this.cameraManager.getActiveCamera();
        this.renderer.render(this.scene, activeCamera);
    }
    
    // Getter für externe Module
    getScene() {
        return this.scene;
    }
    
    getCamera() {
        return this.cameraManager.getActiveCamera();
    }
    
    getCameraManager() {
        return this.cameraManager;
    }
    
    getRenderer() {
        return this.renderer;
    }
    
    // Utility methods
    add(object) {
        this.scene.add(object);
    }
    
    remove(object) {
        this.scene.remove(object);
    }
    
    // Cleanup
    dispose() {
        if (this.cameraManager) {
            // CameraManager hat eigene Dispose-Logik falls nötig
        }
        this.renderer.dispose();
        window.removeEventListener('resize', () => this.onWindowResize());
    }
}