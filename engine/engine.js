import Camera from "./camera.js";
import Input from "./input.js";
import Physics from "./physics.js";

export default class Engine {
    constructor() {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");

        this.input = new Input();
        this.physics = new Physics();
        this.camera = new Camera(this.physics.player);

        window.addEventListener("resize", () => this.resize());
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    update(dt) {
        this.input.update(dt, this.physics);
        this.physics.update(dt);
        this.camera.update(dt);
    }

    render() {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.fillStyle = "skyblue";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        // TEMP ground
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(0, this.canvas.height-100, this.canvas.width, 100);
    }

    start() {
        let last = performance.now();
        const loop = now => {
            const dt = (now - last) / 1000;
            last = now;
            this.update(dt);
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}
