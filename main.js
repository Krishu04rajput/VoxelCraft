// main.js

import { Player } from './engine/Player.js';
import { World } from './engine/World.js';
import { DayNight } from './engine/DayNight.js';

export class Game {
    constructor() {
        this.clock = new THREE.Clock();

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);

        // Camera (FPS style)
        this.camera = new THREE.PerspectiveCamera(
            70, window.innerWidth / window.innerHeight, 0.1, 1000
        );

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Lighting
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(100, 200, 100);
        this.scene.add(this.sunLight);

        // Sky + day/night handler
        this.dayNight = new DayNight(this.scene, this.sunLight);

        // Player
        this.player = new Player(this.scene, this.camera);

        // World
        this.world = new World(this.scene);

        // Resize handling
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.update();
    }

    update() {
        requestAnimationFrame(() => this.update());

        const dt = this.clock.getDelta();

        this.player.update(dt);
        this.world.update(dt, this.player);
        this.dayNight.update(dt);

        this.renderer.render(this.scene, this.camera);
    }
}
