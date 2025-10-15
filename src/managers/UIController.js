/**
 * UIController - Verwaltet UI-Events und Interface-Logik
 * Verantwortlichkeiten:
 * - DOM Event Handling
 * - UI State Management
 * - Keyboard/Mouse Interactions
 * - Loading Screen Management
 * - Control Panel Updates
 */
export class UIController {
    constructor(lightingManager, sceneManager) {
        this.lightingManager = lightingManager;
        this.sceneManager = sceneManager;
        this.cameraManager = null; // Wird später gesetzt
        
        // UI Elements
        this.elements = {
            timeSlider: document.getElementById('time-slider'),
            timeDisplay: document.getElementById('time-display'),
            seasonSelect: document.getElementById('season-select'),
            fullscreenBtn: document.getElementById('fullscreen-btn'),
            resetCameraBtn: document.getElementById('reset-camera'),
            loadingScreen: document.getElementById('loading-screen')
        };
        
        // Event State
        this.isFullscreen = false;
        this.keyStates = {};
        this.debugVisible = false; // Debug Toggle State
        
        // Callbacks für externe Module
        this.onTimeChangeCallback = null;
        this.onSeasonChangeCallback = null;
        this.onCameraResetCallback = null;
        
        this.init();
    }
    
    init() {
        this.validateElements();
        this.setupEventListeners();
        this.updateUI();
    }
    
    validateElements() {
        // Überprüfe, ob alle UI-Elemente vorhanden sind
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element) {
                console.warn(`UI Element nicht gefunden: ${key}`);
            }
        });
    }
    
    setupEventListeners() {
        this.setupTimeControls();
        this.setupSeasonControls();
        this.setupCameraControls();
        this.setupKeyboardControls();
        this.setupFullscreenControls();
        this.setupWindowEvents();
    }
    
    setupTimeControls() {
        if (this.elements.timeSlider) {
            this.elements.timeSlider.addEventListener('input', (e) => {
                const time = parseFloat(e.target.value);
                this.lightingManager.setTime(time);
                this.updateTimeDisplay();
                
                if (this.onTimeChangeCallback) {
                    this.onTimeChangeCallback(time);
                }
            });
        }
    }
    
    setupSeasonControls() {
        if (this.elements.seasonSelect) {
            this.elements.seasonSelect.addEventListener('change', (e) => {
                const season = e.target.value;
                this.lightingManager.setSeason(season);
                
                if (this.onSeasonChangeCallback) {
                    this.onSeasonChangeCallback(season);
                }
            });
        }
    }
    
    setupCameraControls() {
        if (this.elements.resetCameraBtn) {
            this.elements.resetCameraBtn.addEventListener('click', () => {
                this.sceneManager.resetCamera();
                
                if (this.onCameraResetCallback) {
                    this.onCameraResetCallback();
                }
            });
        }
    }
    
    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }
    
    setupFullscreenControls() {
        if (this.elements.fullscreenBtn) {
            this.elements.fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Fullscreen change event
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            this.updateFullscreenButton();
        });
    }
    
    setupWindowEvents() {
        // Window Events werden vom SceneManager gehandelt,
        // aber UI kann darauf reagieren
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }
    
    onKeyDown(event) {
        this.keyStates[event.code] = true;
        
        switch (event.code) {
            case 'KeyF':
                event.preventDefault();
                this.toggleFullscreen();
                break;
                
            case 'KeyR':
                event.preventDefault();
                this.sceneManager.resetCamera();
                break;
                
            case 'KeyT':
                event.preventDefault();
                this.toggleDayNight();
                break;
                
            case 'Space':
                event.preventDefault();
                this.pauseTimeAnimation();
                break;
                
            case 'Escape':
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                break;
                
            case 'KeyI':
                event.preventDefault();
                this.toggleDebugInfo();
                break;
                
            case 'KeyC':
                event.preventDefault();
                this.toggleCameraMode();
                break;
        }
    }
    
    onKeyUp(event) {
        this.keyStates[event.code] = false;
    }
    
    onWindowResize() {
        // UI-spezifische Resize-Logik
        this.updateControlPanelPosition();
    }
    
    // UI Update Methods
    updateTimeDisplay() {
        if (this.elements.timeDisplay) {
            this.elements.timeDisplay.textContent = this.lightingManager.getTimeString();
        }
    }
    
    updateTimeSlider() {
        if (this.elements.timeSlider) {
            this.elements.timeSlider.value = this.lightingManager.getCurrentTime();
        }
    }
    
    updateSeasonSelect() {
        if (this.elements.seasonSelect) {
            this.elements.seasonSelect.value = this.lightingManager.getCurrentSeason();
        }
    }
    
    updateFullscreenButton() {
        if (this.elements.fullscreenBtn) {
            this.elements.fullscreenBtn.textContent = this.isFullscreen ? 'Vollbild verlassen' : 'Vollbild';
        }
    }
    
    updateControlPanelPosition() {
        // Responsive Control Panel Position
        const controlPanel = document.getElementById('controls-panel');
        if (controlPanel && window.innerWidth < 768) {
            controlPanel.style.position = 'fixed';
            controlPanel.style.bottom = '1rem';
            controlPanel.style.left = '1rem';
            controlPanel.style.right = '1rem';
            controlPanel.style.top = 'auto';
        }
    }
    
    updateUI() {
        this.updateTimeDisplay();
        this.updateTimeSlider();
        this.updateSeasonSelect();
        this.updateFullscreenButton();
    }
    
    // Action Methods
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Fullscreen nicht möglich:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
    
    toggleDayNight() {
        const currentTime = this.lightingManager.getCurrentTime();
        const newTime = currentTime < 12 ? 18 : 6; // Abend oder Morgen
        
        this.lightingManager.setTime(newTime);
        this.updateUI();
    }
    
    pauseTimeAnimation() {
        // Implementierung für Time Animation Pause
        console.log('Time Animation Toggle');
    }
    
    // Loading Screen Management
    showLoadingScreen(text = 'Lade historische Stadt...') {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = 'flex';
            this.elements.loadingScreen.classList.remove('hidden');
            
            const loadingText = this.elements.loadingScreen.querySelector('p');
            if (loadingText) {
                loadingText.textContent = text;
            }
        }
    }
    
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    updateLoadingProgress(progress, text = null) {
        if (this.elements.loadingScreen) {
            let progressText = `Lade Assets: ${progress.toFixed(1)}%`;
            if (text) {
                progressText = text;
            }
            
            const loadingText = this.elements.loadingScreen.querySelector('p');
            if (loadingText) {
                loadingText.textContent = progressText;
            }
        }
    }
    
    // Error Handling
    showError(message, duration = 5000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, duration);
    }
    
    // Callback Registration
    setOnTimeChange(callback) {
        this.onTimeChangeCallback = callback;
    }
    
    setOnSeasonChange(callback) {
        this.onSeasonChangeCallback = callback;
    }
    
    setOnCameraReset(callback) {
        this.onCameraResetCallback = callback;
    }
    
    // Utility Methods
    isKeyPressed(keyCode) {
        return !!this.keyStates[keyCode];
    }
    
    getUIState() {
        return {
            currentTime: this.lightingManager.getCurrentTime(),
            currentSeason: this.lightingManager.getCurrentSeason(),
            isFullscreen: this.isFullscreen,
            isLoading: !this.elements.loadingScreen?.classList.contains('hidden')
        };
    }
    
    // Debug Info
    toggleDebugInfo() {
        this.debugVisible = !this.debugVisible;
        
        if (this.debugVisible) {
            console.log('🐛 Debug Info aktiviert');
        } else {
            this.hideDebugInfo();
            console.log('🐛 Debug Info deaktiviert');
        }
    }
    
    showDebugInfo(info) {
        if (!this.debugVisible) return;
        
        let debugDiv = document.querySelector('.webgl-info');
        if (!debugDiv) {
            debugDiv = document.createElement('div');
            debugDiv.className = 'webgl-info';
            document.body.appendChild(debugDiv);
        }
        
        debugDiv.innerHTML = `
            <strong>🐛 Debug Info</strong><br>
            ${Object.entries(info).map(([key, value]) => `${key}: ${value}`).join('<br>')}
        `;
    }
    
    hideDebugInfo() {
        const debugDiv = document.querySelector('.webgl-info');
        if (debugDiv) {
            debugDiv.remove();
        }
        this.debugVisible = false;
    }
    
    isDebugVisible() {
        return this.debugVisible;
    }
    
    // Camera Management
    setCameraManager(cameraManager) {
        this.cameraManager = cameraManager;
        this.createCameraControls();
        this.updateCameraUI();
    }
    
    createCameraControls() {
        // Prüfen ob bereits vorhanden
        if (document.querySelector('.camera-controls')) return;
        
        // Kamera-Steuerelemente erstellen
        const cameraPanel = document.createElement('div');
        cameraPanel.className = 'camera-controls';
        cameraPanel.innerHTML = `
            <div class="camera-buttons">
                <button id="droneMode" class="camera-btn active">🚁 Freie Kamera</button>
                <button id="personMode" class="camera-btn">🚶 Person</button>
            </div>
            <div class="camera-info">
                <span id="cameraStatus">Drohnen-Modus aktiv</span>
                <div id="cameraHelp" class="camera-help">
                    <small>WASD: In Blickrichtung | ←→↑↓: Schauen | Space/Shift: Vertikal</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(cameraPanel);
        
        // Event Listener für Kamera-Buttons
        document.getElementById('droneMode').addEventListener('click', () => {
            this.switchToMode('drone');
        });
        
        document.getElementById('personMode').addEventListener('click', () => {
            this.switchToMode('person');
        });
    }
    
    switchToMode(mode) {
        if (!this.cameraManager) return;
        
        const modes = this.cameraManager.getModes();
        
        if (mode === 'drone') {
            this.cameraManager.switchMode(modes.DRONE);
        } else if (mode === 'person') {
            this.cameraManager.switchMode(modes.PERSON);
        }
        
        this.updateCameraUI();
    }
    
    updateCameraUI() {
        if (!this.cameraManager) return;
        
        const currentMode = this.cameraManager.getCurrentMode();
        const modes = this.cameraManager.getModes();
        
        // Button-Status aktualisieren
        const droneBtn = document.getElementById('droneMode');
        const personBtn = document.getElementById('personMode');
        const statusSpan = document.getElementById('cameraStatus');
        const helpDiv = document.getElementById('cameraHelp');
        
        if (droneBtn && personBtn && statusSpan) {
            droneBtn.classList.toggle('active', currentMode === modes.DRONE);
            personBtn.classList.toggle('active', currentMode === modes.PERSON);
            
            // Status-Text und Hilfe aktualisieren
            if (currentMode === modes.DRONE) {
                statusSpan.textContent = 'Freie Kamera aktiv';
                if (helpDiv) helpDiv.innerHTML = '<small>WASD: In Blickrichtung fliegen | ←→↑↓: Schauen | Space/Shift: Hoch/Runter</small>';
            } else {
                statusSpan.textContent = 'Personen-Modus aktiv';
                if (helpDiv) helpDiv.innerHTML = '<small>WASD: Gehen | ←→↑↓: Umschauen | Shift/Strg: Rennen</small>';
            }
        }
    }
    
    toggleCameraMode() {
        if (!this.cameraManager) return;
        
        const currentMode = this.cameraManager.getCurrentMode();
        const modes = this.cameraManager.getModes();
        
        // Zwischen den Modi wechseln
        const newMode = currentMode === modes.DRONE ? modes.PERSON : modes.DRONE;
        this.cameraManager.switchMode(newMode);
        this.updateCameraUI();
        
        console.log(`Kamera-Modus gewechselt zu: ${newMode} (Taste C)`);
    }
    
    // Cleanup
    dispose() {
        // Remove all event listeners
        window.removeEventListener('keydown', (e) => this.onKeyDown(e));
        window.removeEventListener('keyup', (e) => this.onKeyUp(e));
        window.removeEventListener('resize', () => this.onWindowResize());
        
        Object.values(this.elements).forEach(element => {
            if (element) {
                element.removeEventListener('input', () => {});
                element.removeEventListener('change', () => {});
                element.removeEventListener('click', () => {});
            }
        });
    }
}