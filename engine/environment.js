// environment.js

import * as THREE from 'three';

export default class Environment {
    constructor(scene) {
        this.scene = scene;

        // Sun Light (for day)
        this.sun = new THREE.DirectionalLight(0xffffff, 1);
        this.sun.position.set(50, 100, 50);
        this.scene.add(this.sun);

        // Moon Light (for night)
        this.moon = new THREE.DirectionalLight(0x88aaff, 0.6);
        this.moon.position.set(-50, 80, -50);
        this.scene.add(this.moon);

        this.time = 0; // 0 = morning, 1 = night
        this.skyColor = new THREE.Color(0x87ceeb); // day sky blue
        this.nightColor = new THREE.Color(0x0b0e3d); // night dark blue

        this.fogDay = new THREE.Fog(0x87ceeb, 10, 200);
        this.fogNight = new THREE.Fog(0x0b0e3d, 10, 200);

        scene.fog = this.fogDay;
    }

    update(delta) {
        // time cycle speed
        this.time += delta * 0.02;

        const cycle = (Math.sin(this.time) + 1) / 2; // 0 to 1 smooth

        this.sun.intensity = cycle;        // brighter day
        this.moon.intensity = (1 - cycle); // brighter night

        // change sky color
        const curColor = this.skyColor.clone().lerp(this.nightColor, 1 - cycle);
        this.scene.background = curColor;

        // fog matching
        this.scene.fog = cycle > 0.5 ? this.fogDay : this.fogNight;
    }
}
