// Simple Noise Generator (Simplex/Perlin-like logic)
// Based on a simple 2D noise implementation for procedural generation

export class Noise {
    perm: number[] = [];

    constructor(seed = Math.random()) {
        this.perm = new Array(512);
        const p = new Array(256);
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        // Shuffle
        for (let i = 255; i > 0; i--) {
            // Psuedo shuffle - actually just need random permutation
            // Better shuffle with seed:
            // Simple LCG
            seed = (seed * 1664525 + 1013904223) % 4294967296;
            const randIndex = Math.floor((seed / 4294967296) * (i + 1));
            [p[i], p[randIndex]] = [p[randIndex], p[i]];
        }

        // Duplicate
        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
        }
    }

    fade(t: number) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t: number, a: number, b: number) {
        return a + t * (b - a);
    }

    grad(hash: number, x: number, y: number, z: number) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    // 2D Perlin Noise
    noise2D(x: number, y: number) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const A = this.perm[X] + Y;
        const B = this.perm[X + 1] + Y;

        return this.lerp(v,
            this.lerp(u,
                this.grad(this.perm[A], x, y, 0),
                this.grad(this.perm[B], x - 1, y, 0)
            ),
            this.lerp(u,
                this.grad(this.perm[A + 1], x, y - 1, 0),
                this.grad(this.perm[B + 1], x - 1, y - 1, 0)
            )
        );
    }
}
