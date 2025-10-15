import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            throw new Error(`Canvas mit ID "${canvasId}" nicht gefunden`);
        }
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupEventListeners();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Himmelblau
        
        // Fog für Atmosphäre
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 20, 30);
        this.camera.lookAt(0, 0, 0);
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
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 100;
        this.controls.minDistance = 5;
        this.controls.maxPolarAngle = Math.PI / 2.2; // Verhindert Blick unter den Boden
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    resetCamera() {
        this.camera.position.set(0, 20, 30);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }
    
    update() {
        const deltaTime = this.clock.getDelta();
        this.controls.update();
        return deltaTime;
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    // Getter für externe Module
    getScene() {
        return this.scene;
    }
    
    getCamera() {
        return this.camera;
    }
    
    getRenderer() {
        return this.renderer;
    }
    
    getControls() {
        return this.controls;
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
        this.controls.dispose();
        this.renderer.dispose();
        window.removeEventListener('resize', () => this.onWindowResize());
    }
}