// world.js
import * as THREE from 'three';
import { noise2D, noise3D } from './noise.js';

export class World {
    constructor() {
        this.chunkSize = 16;
        this.chunkHeight = 128;
        this.renderDistance = 6; // 6 chunks radius
        this.blocks = new Map();
    }

    getKey(x, y, z) {
        return `${x},${y},${z}`;
    }

    getBlockAt(x, y, z) {
        return this.blocks.get(this.getKey(x, y, z));
    }

    setBlock(x, y, z, type) {
        this.blocks.set(this.getKey(x, y, z), type);
    }

    generateChunk(cx, cz) {
        const s = this.chunkSize;

        for (let x = 0; x < s; x++) {
            for (let z = 0; z < s; z++) {

                // global coordinates
                let wx = cx * s + x;
                let wz = cz * s + z;

                // mountain terrain
                let h = Math.floor(
                    noise2D(wx * 0.01, wz * 0.01) * 20 + // big mountains
                    noise2D(wx * 0.05, wz * 0.05) * 8 +   // rolling hills
                    64                                    // sea level
                );

                // fill dirt + stone
                for (let y = 0; y < h; y++) {
                    if (y < h - 5) this.setBlock(wx, y, wz, 'stone');
                    else this.setBlock(wx, y, wz, 'dirt');
                }

                // grass on top
                this.setBlock(wx, h, wz, 'grass');

                // caves
                for (let y = 5; y < h; y++) {
                    let c = noise3D(wx * 0.03, y * 0.03, wz * 0.03);
                    if (c > 0.6) this.setBlock(wx, y, wz, null);
                }

                // trees (simple)
                if (noise2D(wx * 0.02, wz * 0.02) > 0.65 && h > 60) {
                    this._placeTree(wx, h + 1, wz);
                }
            }
        }
    }

    _placeTree(x, y, z) {
        // trunk
        for (let i = 0; i < 5; i++) {
            this.setBlock(x, y + i, z, 'log');
        }
        // leaves — simple ball
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 3; dy <= 5; dy++) {
                    if (dx * dx + dz * dz + (dy - 4) * (dy - 4) < 6) {
                        this.setBlock(x + dx, y + dy, z + dz, 'leaves');
                    }
                }
            }
        }
    }

    generateAround(playerX, playerZ) {
        const cx = Math.floor(playerX / this.chunkSize);
        const cz = Math.floor(playerZ / this.chunkSize);

        for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
            for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
                this.generateChunk(cx + x, cz + z);
            }
        }
    }

    getAllBlocks() {
        return this.blocks;
    }
}
