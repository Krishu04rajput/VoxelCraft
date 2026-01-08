export default class Input {
    constructor() {
        this.keys = {};

        window.addEventListener("keydown", e => this.keys[e.code] = true);
        window.addEventListener("keyup", e => this.keys[e.code] = false);
    }

    update(dt, physics) {
        const speed = 5;
        if (this.keys["KeyW"]) physics.move(0, -speed);
        if (this.keys["KeyS"]) physics.move(0, speed);
        if (this.keys["KeyA"]) physics.move(-speed, 0);
        if (this.keys["KeyD"]) physics.move(speed, 0);
        if (this.keys["Space"]) physics.jump();
    }
}
