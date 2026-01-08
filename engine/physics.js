export default class Physics {
    constructor() {
        this.player = {
            x: 100,
            y: 100,
            vy: 0,
            grounded: false
        };
    }

    move(dx, dy) {
        this.player.x += dx;
        this.player.y += dy;
    }

    jump() {
        if (this.player.grounded) {
            this.player.vy = -12;
            this.player.grounded = false;
        }
    }

    update(dt) {
        this.player.vy += 30 * dt; // gravity

        this.player.y += this.player.vy;

        // simple ground collision
        if (this.player.y >= 300) {
            this.player.y = 300;
            this.player.vy = 0;
            this.player.grounded = true;
        }
    }
}
