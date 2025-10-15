import * as THREE from 'three';

/**
 * LightingManager - Verwaltet die dynamische Beleuchtung
 * Verantwortlichkeiten:
 * - Ambient und Directional Light Setup
 * - Tag/Nacht-Zyklus mit dynamischen Farben
 * - Sonnenposition basierend auf Tageszeit
 * - Schatten-Konfiguration
 * - Atmosphärische Effekte (Fog, Background)
 */
export class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.ambientLight = null;
        this.directionalLight = null;
        this.currentTime = 12.0; // 12:00 Uhr
        this.currentSeason = 'summer';
        
        // Licht-Konfiguration für verschiedene Tageszeiten
        this.lightConfig = {
            night: {
                directionalColor: 0x404080,
                directionalIntensity: 0.3,
                ambientIntensity: 0.1,
                backgroundColor: 0x000033,
                fogColor: 0x000033
            },
            dawn: {
                directionalColor: 0xFF6600,
                directionalIntensity: 0.7,
                ambientIntensity: 0.3,
                backgroundColor: 0x664400,
                fogColor: 0x664400
            },
            day: {
                directionalColor: 0xFFFFAA,
                directionalIntensity: 1.0,
                ambientIntensity: 0.4,
                backgroundColor: 0x87CEEB,
                fogColor: 0x87CEEB
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupLights();
        this.updateLighting();
    }
    
    setupLights() {
        // Ambient Light für allgemeine Helligkeit
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.ambientLight);
        
        // Directional Light als Sonne
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(50, 50, 25);
        this.directionalLight.castShadow = true;
        
        // Shadow Map Konfiguration
        this.setupShadows();
        
        this.scene.add(this.directionalLight);
    }
    
    setupShadows() {
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.1;
        this.directionalLight.shadow.camera.far = 200;
        this.directionalLight.shadow.camera.left = -50;
        this.directionalLight.shadow.camera.right = 50;
        this.directionalLight.shadow.camera.top = 50;
        this.directionalLight.shadow.camera.bottom = -50;
    }
    
    setTime(time) {
        this.currentTime = Math.max(0, Math.min(24, time));
        this.updateLighting();
    }
    
    setSeason(season) {
        this.currentSeason = season;
        this.updateLighting();
    }
    
    updateLighting() {
        this.updateSunPosition();
        this.updateLightColors();
        this.updateAtmosphere();
    }
    
    updateSunPosition() {
        // Berechne Sonnenposition basierend auf Tageszeit
        const sunAngle = (this.currentTime / 24) * Math.PI * 2 - Math.PI / 2;
        const sunHeight = Math.sin(sunAngle) * 50;
        const sunDistance = Math.cos(sunAngle) * 50;
        
        this.directionalLight.position.set(
            sunDistance, 
            Math.max(sunHeight, 5), 
            25
        );
    }
    
    updateLightColors() {
        const config = this.getCurrentLightConfig();
        
        // Directional Light (Sonne/Mond)
        this.directionalLight.color.setHex(config.directionalColor);
        this.directionalLight.intensity = config.directionalIntensity;
        
        // Ambient Light
        this.ambientLight.intensity = config.ambientIntensity;
    }
    
    updateAtmosphere() {
        const config = this.getCurrentLightConfig();
        
        // Hintergrundfarbe
        this.scene.background.setHex(config.backgroundColor);
        
        // Fog Farbe
        if (this.scene.fog) {
            this.scene.fog.color.setHex(config.fogColor);
        }
    }
    
    getCurrentLightConfig() {
        // Bestimme Konfiguration basierend auf Tageszeit
        if (this.currentTime < 6 || this.currentTime > 20) {
            return this.lightConfig.night;
        } else if (this.currentTime < 8 || this.currentTime > 18) {
            return this.lightConfig.dawn;
        } else {
            return this.lightConfig.day;
        }
    }
    
    getTimeString() {
        const hours = Math.floor(this.currentTime);
        const minutes = Math.floor((this.currentTime - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    getCurrentTime() {
        return this.currentTime;
    }
    
    getCurrentSeason() {
        return this.currentSeason;
    }
    
    // Advance time for automatic day/night cycle
    advanceTime(deltaMinutes = 1) {
        this.currentTime += deltaMinutes / 60; // Convert minutes to hours
        if (this.currentTime >= 24) {
            this.currentTime -= 24;
        }
        this.updateLighting();
    }
    
    // Seasonal light adjustments
    getSeasonalModifier() {
        const modifiers = {
            spring: { warmth: 1.1, intensity: 1.0 },
            summer: { warmth: 1.2, intensity: 1.1 },
            autumn: { warmth: 0.9, intensity: 0.9 },
            winter: { warmth: 0.8, intensity: 0.8 }
        };
        
        return modifiers[this.currentSeason] || modifiers.summer;
    }
    
    // Cleanup
    dispose() {
        if (this.ambientLight) {
            this.scene.remove(this.ambientLight);
        }
        if (this.directionalLight) {
            this.scene.remove(this.directionalLight);
        }
    }
}