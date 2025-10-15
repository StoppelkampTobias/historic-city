import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * AssetLoader - Verwaltet das Laden von 3D-Assets
 * Verantwortlichkeiten:
 * - GLTF/GLB Model Loading mit LoadingManager
 * - DRACO Kompression Support
 * - Texture Loading
 * - Progress Tracking
 * - Error Handling
 * - Asset Caching
 */
export class AssetLoader {
    constructor() {
        this.loadingManager = new THREE.LoadingManager();
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.dracoLoader = new DRACOLoader();
        
        // Asset Cache für Performance
        this.modelCache = new Map();
        this.textureCache = new Map();
        
        // Loading State
        this.isLoading = false;
        this.loadedItems = 0;
        this.totalItems = 0;
        
        // Event Callbacks
        this.onLoadCallback = null;
        this.onProgressCallback = null;
        this.onErrorCallback = null;
        
        this.init();
    }
    
    init() {
        this.setupDracoLoader();
        this.setupLoadingManager();
    }
    
    setupDracoLoader() {
        // DRACO Loader für komprimierte Geometrien
        this.dracoLoader.setDecoderPath('/draco/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
    }
    
    setupLoadingManager() {
        this.loadingManager.onLoad = () => {
            this.isLoading = false;
            console.log('Alle Assets geladen');
            if (this.onLoadCallback) {
                this.onLoadCallback();
            }
        };
        
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.loadedItems = itemsLoaded;
            this.totalItems = itemsTotal;
            const progress = (itemsLoaded / itemsTotal) * 100;
            console.log(`Lade Assets: ${progress.toFixed(1)}% (${itemsLoaded}/${itemsTotal})`);
            
            if (this.onProgressCallback) {
                this.onProgressCallback(progress, itemsLoaded, itemsTotal, url);
            }
        };
        
        this.loadingManager.onError = (url) => {
            console.error('Fehler beim Laden:', url);
            if (this.onErrorCallback) {
                this.onErrorCallback(url);
            }
        };
    }
    
    // Event Listener setzen
    setOnLoad(callback) {
        this.onLoadCallback = callback;
    }
    
    setOnProgress(callback) {
        this.onProgressCallback = callback;
    }
    
    setOnError(callback) {
        this.onErrorCallback = callback;
    }
    
    // GLTF Model laden
    async loadModel(path, options = {}) {
        return new Promise((resolve, reject) => {
            // Cache Check
            if (this.modelCache.has(path)) {
                console.log(`Model aus Cache geladen: ${path}`);
                resolve(this.modelCache.get(path).clone());
                return;
            }
            
            this.isLoading = true;
            
            this.gltfLoader.load(
                path,
                (gltf) => {
                    // Model konfigurieren
                    this.configureModel(gltf, options);
                    
                    // In Cache speichern
                    this.modelCache.set(path, gltf);
                    
                    console.log(`Model geladen: ${path}`);
                    resolve(gltf);
                },
                (progress) => {
                    // Wird durch LoadingManager gehandelt
                },
                (error) => {
                    console.error(`Fehler beim Laden von ${path}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    configureModel(gltf, options = {}) {
        const { 
            castShadow = true, 
            receiveShadow = true,
            scale = 1,
            position = { x: 0, y: 0, z: 0 }
        } = options;
        
        // Schatten für alle Meshes aktivieren
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = castShadow;
                child.receiveShadow = receiveShadow;
                
                // Material Optimierung
                if (child.material) {
                    child.material.needsUpdate = true;
                }
            }
        });
        
        // Transform anwenden
        gltf.scene.scale.setScalar(scale);
        gltf.scene.position.set(position.x, position.y, position.z);
    }
    
    // Texture laden
    async loadTexture(path) {
        return new Promise((resolve, reject) => {
            // Cache Check
            if (this.textureCache.has(path)) {
                console.log(`Texture aus Cache geladen: ${path}`);
                resolve(this.textureCache.get(path));
                return;
            }
            
            this.textureLoader.load(
                path,
                (texture) => {
                    // Texture konfigurieren
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.colorSpace = THREE.SRGBColorSpace;
                    
                    // In Cache speichern
                    this.textureCache.set(path, texture);
                    
                    console.log(`Texture geladen: ${path}`);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Fehler beim Laden von Texture ${path}:`, error);
                    reject(error);
                }
            );
        });
    }
    
    // Mehrere Models gleichzeitig laden
    async loadModels(modelPaths, options = {}) {
        const promises = modelPaths.map(path => 
            typeof path === 'string' 
                ? this.loadModel(path, options)
                : this.loadModel(path.path, { ...options, ...path.options })
        );
        
        try {
            const models = await Promise.all(promises);
            console.log(`${models.length} Models erfolgreich geladen`);
            return models;
        } catch (error) {
            console.error('Fehler beim Laden von Models:', error);
            throw error;
        }
    }
    
    // Fortschritt abrufen
    getLoadingProgress() {
        if (this.totalItems === 0) return 0;
        return (this.loadedItems / this.totalItems) * 100;
    }
    
    isCurrentlyLoading() {
        return this.isLoading;
    }
    
    // Vordefinierte Asset-Sets
    async loadCityAssets() {
        // TODO: Echte Assets später hinzufügen
        console.log('ℹ️ Externe City Assets noch nicht verfügbar - verwende prozedurale Generierung');
        return [];
        
        /* Für später, wenn Modelle verfügbar sind:
        const cityAssets = [
            '/models/buildings/house_medieval.gltf',
            '/models/buildings/tower.gltf',
            '/models/buildings/church.gltf',
            '/models/environment/tree_oak.gltf',
            '/models/environment/fountain.gltf'
        ];
        
        try {
            return await this.loadModels(cityAssets);
        } catch (error) {
            console.warn('Einige City Assets konnten nicht geladen werden:', error);
            return [];
        }
        */
    }
    
    async loadEnvironmentAssets() {
        // TODO: Echte Assets später hinzufügen
        console.log('ℹ️ Environment Assets noch nicht verfügbar - verwende prozedurale Generierung');
        return [];
        
        /* Für später, wenn Modelle verfügbar sind:
        const envAssets = [
            '/models/terrain/ground.gltf',
            '/models/terrain/rocks.gltf',
            '/models/vegetation/grass.gltf'
        ];
        
        try {
            return await this.loadModels(envAssets);
        } catch (error) {
            console.warn('Einige Environment Assets konnten nicht geladen werden:', error);
            return [];
        }
        */
    }
    
    // Cache Management
    clearCache() {
        this.modelCache.clear();
        this.textureCache.clear();
        console.log('Asset Cache geleert');
    }
    
    getCacheInfo() {
        return {
            models: this.modelCache.size,
            textures: this.textureCache.size,
            totalSize: this.modelCache.size + this.textureCache.size
        };
    }
    
    // Cleanup
    dispose() {
        this.clearCache();
        this.dracoLoader.dispose();
    }
}