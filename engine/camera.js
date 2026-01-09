// camera.js
import * as THREE from 'three';

export class CameraController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        this.pitch = 0;     // up/down rotation
        this.yaw = 0;       // left/right rotation

        this.sensitivity = 0.002;
        this.maxPitch = Math.PI / 2 - 0.1;

        this._initPointerLock();
        this._initMouseControls();
    }

    _initPointerLock() {
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.domElement;
        });
    }

    _initMouseControls() {
        window.addEventListener('mousemove', (e) => {
            if (!this.pointerLocked) return;

            this.yaw -= e.movementX * this.sensitivity;
            this.pitch -= e.movementY * this.sensitivity;

            // clamp vertical look
            this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch));
        });
    }

    update(playerPosition) {
        // camera always follows player at eye height
        this.camera.position.set(
            playerPosition.x,
            playerPosition.y + 1.6,
            playerPosition.z
        );

        this.camera.rotation.set(this.pitch, this.yaw, 0);
    }

    getDirection() {
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyEuler(new THREE.Euler(this.pitch, this.yaw, 0));
        return dir.normalize();
    }
}
