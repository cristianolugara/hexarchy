import { HexCoordinate, BiomeType, Tile } from '../types/game';

export const HEX_SIZE = 30; // Radius of the hexagon in pixels
export const HEX_HEIGHT = HEX_SIZE * 2;
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;

export const HEX_VERT_DIST = HEX_HEIGHT * 0.75;
export const HEX_HORIZ_DIST = HEX_WIDTH;

export const BIOME_COLORS: Record<BiomeType, string> = {
    [BiomeType.PLAINS]: '#86efac', // green-300
    [BiomeType.FOREST]: '#166534', // green-800
    [BiomeType.MOUNTAIN]: '#475569', // slate-600
    [BiomeType.DESERT]: '#fde047', // yellow-300
    [BiomeType.WATER]: '#3b82f6', // blue-500
    [BiomeType.HILLS]: '#a3e635', // lime-400
};

// Convert Axial/Cube coordinates to Pixel coordinates
export function hexToPixel(hex: HexCoordinate): { x: number; y: number } {
    const x = HEX_SIZE * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
    const y = HEX_SIZE * ((3 / 2) * hex.r);
    return { x, y };
}

// Generate unique string ID for hex coordinate
export function getHexId(q: number, r: number): string {
    return `${q},${r}`;
}

// Generate a rectangular map of Flat Topped Hexagons
export function generateMap(width: number, height: number): Tile[] {
    const tiles: Tile[] = [];

    for (let r = 0; r < height; r++) {
        const r_offset = Math.floor(r / 2); // or -1 * Math.floor(r / 2) depending on offset
        for (let q = -r_offset; q < width - r_offset; q++) {
            // Basic Logic for now, using axial coordinates
            // To fill a rect, we need to shift the q range
            const s = -q - r;

            // Simple random biome generation
            const rand = Math.random();
            let biome = BiomeType.PLAINS;
            if (rand > 0.8) biome = BiomeType.MOUNTAIN;
            else if (rand > 0.6) biome = BiomeType.FOREST;
            else if (rand > 0.5) biome = BiomeType.HILLS;
            else if (rand > 0.45) biome = BiomeType.WATER;

            tiles.push({
                id: getHexId(q, r),
                coordinates: { q, r, s },
                biome
            });
        }
    }
    return tiles;
}

export function drawHex(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    stroke: string = "#1e293b",
    strokeWidth: number = 1
) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle_deg = 60 * i + 30; // +30 for pointy top, 0 for flat top. We want Pointy Top for standard games usually, but let's check constants.
        // Wait, my Constants ABOVE (HEX_WIDTH = sqrt(3)*size) implies POINTY TOP.
        // Pointy Top: Width = sqrt(3)*size, Height = 2*size.
        // Angles: 30, 90, 150...

        const angle_rad = Math.PI / 180 * angle_deg;
        const vx = x + HEX_SIZE * Math.cos(angle_rad);
        const vy = y + HEX_SIZE * Math.sin(angle_rad);

        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
}

// Round fractional hex coordinates to nearest integer hex
export function hexRound(q: number, r: number): HexCoordinate {
    let s = -q - r;

    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);

    const q_diff = Math.abs(rq - q);
    const r_diff = Math.abs(rr - r);
    const s_diff = Math.abs(rs - s);

    if (q_diff > r_diff && q_diff > s_diff) {
        rq = -rr - rs;
    } else if (r_diff > s_diff) {
        rr = -rq - rs;
    } else {
        rs = -rq - rr;
    }

    return { q: rq, r: rr, s: rs };
}

// Convert Pixel to Hex coordinates
export function pixelToHex(x: number, y: number): HexCoordinate {
    const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / HEX_SIZE;
    const r = (2 / 3 * y) / HEX_SIZE;

    return hexRound(q, r);
}
