// engine/Player.js

import { Input } from './Input.js';
import { Physics } from './Physics.js';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // 2 block tall player
        this.height = 2.0; // y height
        this.radius = 0.3; // width ~0.6 total (Minecraft-like)

        // Position
        this.position = new THREE.Vector3(0, 20, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);

        // Movement config
        this.speed = 5;    // walking
        this.jumpPower = 6;
        this.onGround = false;

        // Camera pitch/yaw
        this.pitch = 0;
        this.yaw = 0;
        this.mouseSensitivity = 0.002;

        // Attach input + physics
        this.input = new Input();
        this.physics = new Physics(this);

        // Attach camera to player
        this.updateCameraTransform();
    }

    updateCameraTransform() {
        this.camera.position.set(
            this.position.x,
            this.position.y + this.height * 0.85,
            this.position.z
        );
        this.camera.rotation.set(this.pitch, this.yaw, 0);
    }

    updateMouse(dt) {
        if (!document.pointerLockElement) return;

        const mx = this.input.mouse.dx;
        const my = this.input.mouse.dy;

        this.yaw -= mx * this.mouseSensitivity;
        this.pitch -= my * this.mouseSensitivity;

        // Limit pitch
        const maxPitch = Math.PI / 2 - 0.1;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

        this.input.mouse.dx = 0;
        this.input.mouse.dy = 0;
    }

    updateMovement(dt) {
        const dir = new THREE.Vector3();

        if (this.input.keys['KeyW']) dir.z -= 1;
        if (this.input.keys['KeyS']) dir.z += 1;
        if (this.input.keys['KeyA']) dir.x -= 1;
        if (this.input.keys['KeyD']) dir.x += 1;

        if (dir.lengthSq() > 0) dir.normalize();

        const angle = this.yaw;
        const forward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));

        const right = new THREE.Vector3(forward.z, 0, -forward.x);

        const move = new THREE.Vector3();
        move.addScaledVector(forward, dir.z);
        move.addScaledVector(right, dir.x);

        move.normalize().multiplyScalar(this.speed);

        this.velocity.x = move.x;
        this.velocity.z = move.z;

        if (this.input.keys['Space'] && this.onGround) {
            this.velocity.y = this.jumpPower;
            this.onGround = false;
        }
    }

    update(dt) {
        this.updateMouse(dt);
        this.updateMovement(dt);
        this.physics.update(dt);
        this.updateCameraTransform();
    }
}
