// Manager Imports
import { SceneManager } from './managers/SceneManager.js';
import { LightingManager } from './managers/LightingManager.js';
import { AssetLoader } from './managers/AssetLoader.js';
import { CityGenerator } from './managers/CityGenerator.js';
import { UIController } from './managers/UIController.js';

/**
 * HistoricCityApp - Hauptapplication nach SoC-Prinzipien
 * Verantwortlichkeiten:
 * - Orchestrierung aller Manager-Module
 * - App-Lifecycle Management
 * - Manager-Kommunikation
 * - Animation Loop Koordination
 */
class HistoricCityApp {
    constructor() {
        // Manager Instanzen
        this.sceneManager = null;
        this.lightingManager = null;
        this.assetLoader = null;
        this.cityGenerator = null;
        this.uiController = null;
        
        // App State
        this.isInitialized = false;
        this.isRunning = false;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🏛️ Historic City App wird initialisiert...');
            
            // 1. Scene Manager - Grundlage für alles
            this.sceneManager = new SceneManager('webgl-canvas');
            
            // 2. Lighting Manager - Benötigt Scene
            this.lightingManager = new LightingManager(this.sceneManager.getScene());
            
            // 3. Asset Loader - Für 3D-Modelle
            this.assetLoader = new AssetLoader();
            this.setupAssetLoader();
            
            // 4. City Generator - Erstellt die Stadt
            this.cityGenerator = new CityGenerator(this.sceneManager.getScene());
            
            // 5. UI Controller - Event Handling
            this.uiController = new UIController(this.lightingManager, this.sceneManager);
            this.setupUICallbacks();
            
            // 6. Stadt generieren
            await this.generateCity();
            
            // 7. Animation starten
            this.startAnimation();
            
            this.isInitialized = true;
            console.log('✅ Historic City App erfolgreich initialisiert');
            
        } catch (error) {
            console.error('❌ Fehler bei der App-Initialisierung:', error);
            this.handleInitError(error);
        }
    }
    
    setupAssetLoader() {
        // Asset Loader Callbacks konfigurieren
        this.assetLoader.setOnProgress((progress, loaded, total, url) => {
            this.uiController.updateLoadingProgress(progress, `Lade: ${url}`);
        });
        
        this.assetLoader.setOnLoad(() => {
            console.log('🎨 Alle Assets geladen');
            this.uiController.hideLoadingScreen();
        });
        
        this.assetLoader.setOnError((url) => {
            console.warn('⚠️ Asset Ladefehler:', url);
            this.uiController.showError(`Fehler beim Laden: ${url}`);
        });
    }
    
    setupUICallbacks() {
        // UI Event Callbacks registrieren
        this.uiController.setOnTimeChange((time) => {
            console.log(`🕐 Zeit geändert: ${time}`);
        });
        
        this.uiController.setOnSeasonChange((season) => {
            console.log(`🍂 Jahreszeit geändert: ${season}`);
            // Hier könnten saisonale Änderungen in der Stadt implementiert werden
        });
        
        this.uiController.setOnCameraReset(() => {
            console.log('📷 Kamera zurückgesetzt');
        });
    }
    
    async generateCity() {
        console.log('🏗️ Generiere historische Stadt...');
        
        // Loading Screen anzeigen
        this.uiController.showLoadingScreen('Erstelle historische Stadt...');
        
        try {
            // Optional: Versuche echte 3D-Modelle zu laden
            await this.loadCityAssets();
            
            // Fallback: Prozedurale Stadt generieren
            this.cityGenerator.generateCity();
            
        } catch (error) {
            console.warn('⚠️ Asset Loading Fehler, verwende prozedurale Generierung:', error);
            this.cityGenerator.generateCity();
        }
        
        console.log('🏛️ Stadt erfolgreich generiert');
        this.uiController.hideLoadingScreen();
    }
    
    async loadCityAssets() {
        try {
            // Versuche externe 3D-Modelle zu laden (optional)
            const cityModels = await this.assetLoader.loadCityAssets();
            
            if (cityModels && cityModels.length > 0) {
                console.log(`📦 ${cityModels.length} externe City Assets geladen`);
                
                // Füge geladene Modelle zur Szene hinzu
                cityModels.forEach((model, index) => {
                    if (model && model.scene) {
                        const position = this.calculateModelPosition(index, cityModels.length);
                        model.scene.position.set(position.x, position.y, position.z);
                        this.sceneManager.add(model.scene);
                    }
                });
                
                return true;
            } else {
                console.log('ℹ️ Keine externen Assets - verwende prozedurale Stadt');
                return false;
            }
        } catch (error) {
            console.log('ℹ️ Asset Loading übersprungen:', error.message);
            return false;
        }
    }
    
    calculateModelPosition(index, total) {
        // Berechne Positionen für geladene Modelle
        const radius = 20;
        const angle = (index / total) * Math.PI * 2;
        
        return {
            x: Math.cos(angle) * radius,
            y: 0,
            z: Math.sin(angle) * radius
        };
    }
    
    startAnimation() {
        this.isRunning = true;
        this.animate();
        console.log('🎬 Animation gestartet');
    }
    
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        // Update alle Manager
        const deltaTime = this.sceneManager.update();
        
        // Animiere die Test-Box
        if (this.cityGenerator) {
            this.cityGenerator.animateTestBox();
        }
        
        // Render die Szene
        this.sceneManager.render();
        
        // Debug Info (optional)
        if (this.shouldShowDebugInfo()) {
            this.updateDebugInfo();
        }
    }
    
    shouldShowDebugInfo() {
        // Debug Info nur in Development Mode anzeigen
        return this.uiController.isKeyPressed('KeyI') || 
               window.location.search.includes('debug=true');
    }
    
    updateDebugInfo() {
        const renderer = this.sceneManager.getRenderer();
        const scene = this.sceneManager.getScene();
        
        const debugInfo = {
            'Geometries': renderer.info.memory.geometries,
            'Textures': renderer.info.memory.textures,
            'Draw Calls': renderer.info.render.calls,
            'Triangles': renderer.info.render.triangles,
            'Scene Objects': scene.children.length,
            'Time': this.lightingManager.getTimeString(),
            'Season': this.lightingManager.getCurrentSeason()
        };
        
        this.uiController.showDebugInfo(debugInfo);
    }
    
    handleInitError(error) {
        const errorMessage = `Initialisierungsfehler: ${error.message}`;
        
        // Zeige Fehlermeldung im UI
        if (this.uiController) {
            this.uiController.showError(errorMessage, 10000);
            this.uiController.hideLoadingScreen();
        } else {
            // Fallback für schwere Fehler
            alert(errorMessage);
        }
    }
    
    // Public API für externe Erweiterungen
    getManagers() {
        return {
            scene: this.sceneManager,
            lighting: this.lightingManager,
            assets: this.assetLoader,
            city: this.cityGenerator,
            ui: this.uiController
        };
    }
    
    // Regenerate Stadt
    regenerateCity() {
        if (this.cityGenerator) {
            console.log('🔄 Regeneriere Stadt...');
            this.uiController.showLoadingScreen('Regeneriere Stadt...');
            
            setTimeout(() => {
                this.cityGenerator.generateCity();
                this.uiController.hideLoadingScreen();
            }, 100);
        }
    }
    
    // App Lifecycle
    pause() {
        this.isRunning = false;
        console.log('⏸️ App pausiert');
    }
    
    resume() {
        if (this.isInitialized && !this.isRunning) {
            this.startAnimation();
            console.log('▶️ App fortgesetzt');
        }
    }
    
    stop() {
        this.isRunning = false;
        console.log('⏹️ App gestoppt');
    }
    
    // Cleanup
    dispose() {
        this.stop();
        
        // Dispose alle Manager in umgekehrter Reihenfolge
        if (this.uiController) this.uiController.dispose();
        if (this.cityGenerator) this.cityGenerator.dispose();
        if (this.assetLoader) this.assetLoader.dispose();
        if (this.lightingManager) this.lightingManager.dispose();
        if (this.sceneManager) this.sceneManager.dispose();
        
        console.log('🧹 App Ressourcen freigegeben');
    }
}

// Globale App-Instanz für Debugging
let app = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new HistoricCityApp();
    
    // Globale Referenz für Console-Debugging
    window.historicCityApp = app;
    
    // Cleanup bei Page Unload
    window.addEventListener('beforeunload', () => {
        if (app) {
            app.dispose();
        }
    });
});

// Development Helper Functions
if (typeof window !== 'undefined') {
    window.regenerateCity = () => app?.regenerateCity();
    window.toggleDebug = () => app?.uiController?.showDebugInfo({ Debug: 'Enabled' });
}