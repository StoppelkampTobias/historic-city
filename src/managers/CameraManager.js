import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene = null;
        
        // Camera modes
        this.modes = {
            DRONE: 'drone',
            PERSON: 'person'
        };
        this.currentMode = this.modes.DRONE;
        
        // Cameras
        this.droneCamera = null;
        this.personCamera = null;
        this.activeCamera = null;
        
        // Controls
        this.orbitControls = null;
        
        // Movement state for both modes
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,      // Für freie Kamera
            down: false,    // Für freie Kamera
            rotateLeft: false,   // Kamera links drehen
            rotateRight: false,  // Kamera rechts drehen
            lookUp: false,      // Nach oben schauen (beide Modi)
            lookDown: false     // Nach unten schauen (beide Modi)
        };
        
        // Movement settings
        this.walkSpeed = 5.0;
        this.runSpeed = 10.0;
        this.flySpeed = 8.0;
        this.rotationSpeed = 1.5; // Rotationsgeschwindigkeit für Pfeiltasten
        this.isRunning = false;
        
        // Person camera settings
        this.personHeight = 1.7; // Augenhöhe in Metern
        
        // Camera rotation for both modes
        this.droneYaw = 0;
        this.dronePitch = 0; // Drohne kann jetzt auch hoch/runter schauen
        this.personYaw = 0;
        this.personPitch = 0; // Nur Person kann hoch/runter schauen
        
        this.init();
        this.setupKeyboardControls();
    }
    
    init() {
        const aspect = window.innerWidth / window.innerHeight;
        
        // Drohnen-Kamera (frei fliegend)
        this.droneCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.droneCamera.position.set(0, 10, 10);
        this.droneCamera.rotation.order = 'YXZ'; // Verhindert Gimbal Lock
        
        // Personen-Kamera (Augenhöhe)
        this.personCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.personCamera.position.set(0, this.personHeight, 5);
        this.personCamera.rotation.order = 'YXZ'; // Verhindert Gimbal Lock
        
        // Standard: Drohnen-Modus
        this.activeCamera = this.droneCamera;
        
        // Keine OrbitControls mehr - freie Kamera
        this.orbitControls = null;
    }
    
    setupKeyboardControls() {
        // WASD für Bewegung, Links/Rechts Pfeiltasten für Horizontal-Rotation, Hoch/Runter für Vertikal-Schauen
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                // Bewegung
                case 'KeyW':
                    this.moveState.forward = true;
                    break;
                case 'KeyS':
                    this.moveState.backward = true;
                    break;
                case 'KeyA':
                    this.moveState.left = true;
                    break;
                case 'KeyD':
                    this.moveState.right = true;
                    break;
                
                // Horizontale Kamera-Rotation (beide Modi)
                case 'ArrowLeft':
                    this.moveState.rotateLeft = true;
                    break;
                case 'ArrowRight':
                    this.moveState.rotateRight = true;
                    break;
                
                // Vertikales Schauen (beide Modi)
                case 'ArrowUp':
                    this.moveState.lookUp = true;
                    break;
                case 'ArrowDown':
                    this.moveState.lookDown = true;
                    break;
                
                // Hoch/Runter für freie Kamera (Drohne)
                case 'Space':
                    this.moveState.up = true;
                    break;
                case 'ShiftLeft':
                    // Shift für Runter bei Drohne, für Rennen bei Person
                    if (this.currentMode === this.modes.DRONE) {
                        this.moveState.down = true;
                    } else {
                        this.isRunning = true;
                    }
                    break;
                case 'ControlLeft':
                    // Strg nur für Person als Rennen-Alternative
                    if (this.currentMode === this.modes.PERSON) {
                        this.isRunning = true;
                    }
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch(event.code) {
                // Bewegung
                case 'KeyW':
                    this.moveState.forward = false;
                    break;
                case 'KeyS':
                    this.moveState.backward = false;
                    break;
                case 'KeyA':
                    this.moveState.left = false;
                    break;
                case 'KeyD':
                    this.moveState.right = false;
                    break;
                
                // Kamera-Rotation
                case 'ArrowLeft':
                    this.moveState.rotateLeft = false;
                    break;
                case 'ArrowRight':
                    this.moveState.rotateRight = false;
                    break;
                case 'ArrowUp':
                    this.moveState.lookUp = false;
                    break;
                case 'ArrowDown':
                    this.moveState.lookDown = false;
                    break;
                
                // Hoch/Runter
                case 'Space':
                    this.moveState.up = false;
                    break;
                case 'ShiftLeft':
                    if (this.currentMode === this.modes.DRONE) {
                        this.moveState.down = false;
                    } else {
                        this.isRunning = false;
                    }
                    break;
                case 'ControlLeft':
                    if (this.currentMode === this.modes.PERSON) {
                        this.isRunning = false;
                    }
                    break;
            }
        });
    }
    
    switchMode(mode) {
        if (mode === this.currentMode) return;
        
        this.currentMode = mode;
        
        if (mode === this.modes.DRONE) {
            // Wechsel zu freier Kamera
            this.activeCamera = this.droneCamera;
            
        } else if (mode === this.modes.PERSON) {
            // Wechsel zu Personen-Modus
            this.activeCamera = this.personCamera;
            
            // Kamera auf Augenhöhe setzen
            this.personCamera.position.y = this.personHeight;
        }
        
        console.log(`Kamera-Modus gewechselt zu: ${mode}`);
    }
    
    updatePersonCamera(deltaTime) {
        if (this.currentMode !== this.modes.PERSON) return;
        
        // Bewegungsgeschwindigkeit
        const speed = this.isRunning ? this.runSpeed : this.walkSpeed;
        const velocity = speed * deltaTime;
        
        // Kamera-Rotation: Horizontal und Vertikal getrennt
        const rotationSpeed = this.rotationSpeed * deltaTime;
        
        // Horizontale Rotation (Yaw)
        if (this.moveState.rotateLeft) {
            this.personYaw += rotationSpeed;
        }
        if (this.moveState.rotateRight) {
            this.personYaw -= rotationSpeed;
        }
        
        // Vertikale Rotation (Pitch) - nur für Person-Modus
        if (this.moveState.lookUp) {
            this.personPitch += rotationSpeed;
        }
        if (this.moveState.lookDown) {
            this.personPitch -= rotationSpeed;
        }
        
        // Pitch begrenzen (verhindert Überdrehung)
        this.personPitch = Math.max(-Math.PI * 0.4, Math.min(Math.PI * 0.4, this.personPitch));
        
        // Bewegungsrichtung basierend nur auf Yaw (nicht Pitch!)
        // Das bedeutet: Bewegung ist immer horizontal, egal wohin man schaut
        const horizontalDirection = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        // Nur Yaw für Bewegungsrichtung verwenden
        horizontalDirection.set(0, 0, -1);
        horizontalDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.personYaw);
        right.set(1, 0, 0);
        right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.personYaw);
        
        // Forward/Backward (immer horizontal)
        if (this.moveState.forward) {
            this.personCamera.position.add(horizontalDirection.multiplyScalar(velocity));
        }
        if (this.moveState.backward) {
            this.personCamera.position.add(horizontalDirection.multiplyScalar(-velocity));
        }
        
        // Left/Right (Strafing)
        if (this.moveState.left) {
            this.personCamera.position.add(right.multiplyScalar(-velocity));
        }
        if (this.moveState.right) {
            this.personCamera.position.add(right.multiplyScalar(velocity));
        }
        
        // Kamera-Rotation korrekt anwenden - Mit Quaternionen für stabiles Verhalten
        const euler = new THREE.Euler(this.personPitch, this.personYaw, 0, 'YXZ');
        this.personCamera.quaternion.setFromEuler(euler);
        
        // Höhe konstant halten (Augenhöhe)
        this.personCamera.position.y = this.personHeight;
    }
    
    updateDroneCamera(deltaTime) {
        if (this.currentMode !== this.modes.DRONE) return;
        
        // Freie Kamera-Bewegung
        const speed = this.isRunning ? this.flySpeed * 2 : this.flySpeed;
        const velocity = speed * deltaTime;
        
        // Kamera-Rotation: Horizontal und Vertikal
        const rotationSpeed = this.rotationSpeed * deltaTime;
        
        // Horizontale Rotation (Yaw)
        if (this.moveState.rotateLeft) {
            this.droneYaw += rotationSpeed;
        }
        if (this.moveState.rotateRight) {
            this.droneYaw -= rotationSpeed;
        }
        
        // Vertikale Rotation (Pitch) - jetzt auch für Drohne
        if (this.moveState.lookUp) {
            this.dronePitch += rotationSpeed;
        }
        if (this.moveState.lookDown) {
            this.dronePitch -= rotationSpeed;
        }
        
        // Pitch begrenzen (verhindert Überdrehung)
        this.dronePitch = Math.max(-Math.PI * 0.4, Math.min(Math.PI * 0.4, this.dronePitch));
        
        // WASD - horizontale Bewegung in Blickrichtung (aber ohne Höhenänderung)
        const horizontalDirection = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        // Nur Yaw für horizontale Bewegungsrichtung verwenden (nicht Pitch!)
        horizontalDirection.set(0, 0, -1);
        horizontalDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.droneYaw);
        right.set(1, 0, 0);
        right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.droneYaw);
        
        // Forward/Backward (in horizontaler Blickrichtung)
        if (this.moveState.forward) {
            this.droneCamera.position.add(horizontalDirection.multiplyScalar(velocity));
        }
        if (this.moveState.backward) {
            this.droneCamera.position.add(horizontalDirection.multiplyScalar(-velocity));
        }
        
        // Left/Right (Strafing horizontal)
        if (this.moveState.left) {
            this.droneCamera.position.add(right.multiplyScalar(-velocity));
        }
        if (this.moveState.right) {
            this.droneCamera.position.add(right.multiplyScalar(velocity));
        }
        
        // Space/Shift - reine vertikale Bewegung (unabhängig von Blickrichtung)
        const worldUp = new THREE.Vector3(0, 1, 0);
        
        if (this.moveState.up) {
            this.droneCamera.position.add(worldUp.multiplyScalar(velocity));
        }
        if (this.moveState.down) {
            this.droneCamera.position.add(worldUp.multiplyScalar(-velocity));
        }
        
        // Kamera-Rotation korrekt anwenden - Mit Quaternionen für stabiles Verhalten
        const euler = new THREE.Euler(this.dronePitch, this.droneYaw, 0, 'YXZ');
        this.droneCamera.quaternion.setFromEuler(euler);
    }
    
    update(deltaTime) {
        if (this.currentMode === this.modes.DRONE) {
            this.updateDroneCamera(deltaTime);
        } else if (this.currentMode === this.modes.PERSON) {
            this.updatePersonCamera(deltaTime);
        }
    }
    
    resize(width, height) {
        const aspect = width / height;
        
        this.droneCamera.aspect = aspect;
        this.droneCamera.updateProjectionMatrix();
        
        this.personCamera.aspect = aspect;
        this.personCamera.updateProjectionMatrix();
    }
    
    getActiveCamera() {
        return this.activeCamera;
    }
    
    getCurrentMode() {
        return this.currentMode;
    }
    
    getModes() {
        return this.modes;
    }
}