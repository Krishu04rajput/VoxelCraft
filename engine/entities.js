// entities.js

import * as THREE from 'three';

export class Animal {
    constructor(type, scene, position) {
        this.type = type;

        // primitive body (to be replaced w/ models later)
        const geometry = new THREE.BoxGeometry(1, 1, 2);
        const material = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.copy(position);
        scene.add(this.mesh);

        this.speed = 0.015;
        this.direction = new THREE.Vector3(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
        ).normalize();
    }

    update(delta) {
        // wander movement
        this.mesh.position.x += this.direction.x * this.speed * delta;
        this.mesh.position.z += this.direction.z * this.speed * delta;

        // chance to switch direction
        if (Math.random() < 0.001) {
            this.direction.set(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
        }
    }
}

export class Hostile {
    constructor(type, scene, position, target) {
        this.type = type;
        this.target = target;

        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0x444444 });
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.position.copy(position);
        scene.add(this.mesh);

        this.speed = 0.03;
    }

    update(delta) {
        // chase player
        const dir = new THREE.Vector3().subVectors(
            this.target.position,
            this.mesh.position
        ).normalize();

        this.mesh.position.x += dir.x * this.speed * delta;
        this.mesh.position.z += dir.z * this.speed * delta;
    }
}

export class EntityManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.entities = [];
    }

    addAnimal(type, position) {
        this.entities.push(new Animal(type, this.scene, position));
    }

    addHostile(type, position) {
        this.entities.push(new Hostile(type, this.scene, position, this.player.mesh));
    }

    update(delta) {
        for (let e of this.entities) {
            e.update(delta);
        }
    }
}
