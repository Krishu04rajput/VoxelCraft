// physics.js
import * as THREE from 'three';

export class PhysicsController {
    constructor(world) {
        this.world = world;

        this.velocity = new THREE.Vector3(0, 0, 0);
        this.gravity = -9.8;
        this.jumpForce = 5;
        this.onGround = false;

        this.playerWidth = 0.3;   // A = 0.6 block width total
        this.playerHeight = 2.0;  // requested
        this.friction = 6.0;
        this.maxFallSpeed = -40;
    }

    update(playerPosition, input, delta) {
        // apply gravity
        this.velocity.y += this.gravity * delta;
        if (this.velocity.y < this.maxFallSpeed) {
            this.velocity.y = this.maxFallSpeed;
        }

        // handle movement
        let speed = input.running ? 5 : 3;

        let forward = new THREE.Vector3(0, 0, -1).applyEuler(input.rotation).normalize();
        let right = new THREE.Vector3(1, 0, 0).applyEuler(input.rotation).normalize();

        let move = new THREE.Vector3(0, 0, 0);
        if (input.forward) move.add(forward);
        if (input.backward) move.sub(forward);
        if (input.right) move.add(right);
        if (input.left) move.sub(right);

        if (move.length() > 0) move.normalize().multiplyScalar(speed * delta);
        this.velocity.x = move.x;
        this.velocity.z = move.z;

        // xp, yp, zp proposed
        let nextPos = new THREE.Vector3(
            playerPosition.x + this.velocity.x,
            playerPosition.y + this.velocity.y * delta,
            playerPosition.z + this.velocity.z
        );

        // collide separately for stability
        nextPos = this._collideX(playerPosition, nextPos);
        nextPos = this._collideY(playerPosition, nextPos);
        nextPos = this._collideZ(playerPosition, nextPos);

        return nextPos;
    }

    jump() {
        if (this.onGround) {
            this.velocity.y = this.jumpForce;
            this.onGround = false;
        }
    }

    // ---- collision helpers ----

    _collideX(prev, next) {
        if (this._hitsBlocks(next.x, prev.y, prev.z)) {
            next.x = prev.x;
            this.velocity.x = 0;
        }
        return next;
    }

    _collideY(prev, next) {
        if (this._hitsBlocks(prev.x, next.y, prev.z)) {
            if (this.velocity.y < 0) this.onGround = true;
            this.velocity.y = 0;
            next.y = prev.y;
        } else {
            this.onGround = false;
        }
        return next;
    }

    _collideZ(prev, next) {
        if (this._hitsBlocks(prev.x, prev.y, next.z)) {
            next.z = prev.z;
            this.velocity.z = 0;
        }
        return next;
    }

    _hitsBlocks(x, y, z) {
        // check capsule (player)
        for (let dx of [-this.playerWidth, this.playerWidth]) {
            for (let dz of [-this.playerWidth, this.playerWidth]) {
                for (let dy = 0; dy < this.playerHeight; dy += 0.5) {
                    if (this.world.getBlockAt(
                        Math.floor(x + dx),
                        Math.floor(y + dy),
                        Math.floor(z + dz)
                    )) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
