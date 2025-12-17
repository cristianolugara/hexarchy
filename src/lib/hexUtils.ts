import type { HexCoordinate, Tile } from '../types/game';
import { BiomeType } from '../types/game';

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


// Visual Constants
const HEX_SCALE_Y = 0.65; // Flatten the hex to look isometric
const HEX_DEPTH = 12; // Height of the 3D block

// Convert Axial/Cube coordinates to Pixel coordinates (Isometric)
export function hexToPixel(hex: HexCoordinate): { x: number; y: number } {
    const x = HEX_SIZE * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
    const y = HEX_SIZE * ((3 / 2) * hex.r) * HEX_SCALE_Y; // Apply squash
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
            let biome: BiomeType = BiomeType.PLAINS;
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

// Helper to draw a hex path
const drawHexPath = (ctx: CanvasRenderingContext2D, x: number, y: number, offsetY: number = 0) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle_deg = 60 * i + 30;
        const angle_rad = Math.PI / 180 * angle_deg;
        const vx = x + HEX_SIZE * Math.cos(angle_rad);
        const vy = (y + offsetY) + (HEX_SIZE * Math.sin(angle_rad)) * HEX_SCALE_Y;

        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
}

export function drawHex(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    stroke: string = "rgba(0,0,0,0.1)",
    strokeWidth: number = 1
) {
    // 1. Draw "Base" (Sides/Shadow) - Extruded down
    // We simulate the earth block below
    const depth = HEX_DEPTH;
    const sideColor = shadeColor(color, -30); // Darker version of top

    // Draw the "bottom" footprint first to cover gaps? No, standard is top-down painter's algo.
    // Actually, for sides, we only see specific faces (Front-Left, Front, Front-Right).
    // Drawing a full hex shifted down works okay for silhouette.

    drawHexPath(ctx, x, y, depth);
    ctx.fillStyle = sideColor;
    ctx.fill();

    // To make it look "solid", we should connect corners.
    // For low-poly canvas, just drawing the "Thick Layer" rectangle/quads for front faces is better.
    // But for speed, let's just draw 'n' layers or a block. 
    // Optimization: Draw a thick stroke or just a lower polygon.
    // Let's stick to the "Shifted Shadow" simple approach for now, but thicker.
    // To fix "floating" look, we draw a rectangle from middle-left to middle-right?
    // Let's keep it simple: Base Hex.

    // 2. Draw "Cap" (Top Face)
    drawHexPath(ctx, x, y, 0);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // 3. Draw Props (Trees, Mountains)
    // Determine props based on color (Biome proxy)
    // Ideally pass biome, but function signature is generic.
    // Let's infer from color for now or add 'biome' param?
    // We'll trust the caller passes plain color. 
    // Wait, I can detect biome colors.

    // Forest (Green) -> Trees
    if (color === BIOME_COLORS.FOREST) {
        drawTree(ctx, x - 10, y - 5);
        drawTree(ctx, x + 5, y + 2);
    }
    // Mountain (Grey) -> Peak
    else if (color === BIOME_COLORS.MOUNTAIN) {
        drawMountain(ctx, x, y);
    }
    // Hills (Light Green) -> Small mound
    else if (color === BIOME_COLORS.HILLS) {
        drawHill(ctx, x, y);
    }
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#14532d'; // Dark Green Trunk/Base
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Cone
    ctx.fillStyle = '#166534'; // Green Leaf
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x, y - 18); // Tip
    ctx.lineTo(x + 6, y);
    ctx.fill();

    // Shadow side
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 6, y);
    ctx.fill();
}

function drawMountain(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const h = 25;
    const w = 15;

    ctx.fillStyle = '#64748b'; // Slate 500
    ctx.beginPath();
    ctx.moveTo(x - w, y + 5);
    ctx.lineTo(x, y - h);
    ctx.lineTo(x + w, y + 5);
    ctx.fill();

    // Cap snow
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(x - w / 3, y - h + 8);
    ctx.lineTo(x, y - h);
    ctx.lineTo(x + w / 3, y - h + 8);
    ctx.fill();
}

function drawHill(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#65a30d'; // Lime 600 (Darker than hill base)
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI, true); // Semi circle
    ctx.fill();
}


// Helper to darken/lighten hex color
function shadeColor(color: string, percent: number) {
    const f = parseInt(color.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = f >> 8 & 0x00FF,
        B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
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

// Convert Pixel to Hex coordinates (Inverse Isometric)
export function pixelToHex(x: number, y: number): HexCoordinate {
    // Un-squash Y before converting
    const y_corrected = y / HEX_SCALE_Y;

    const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y_corrected) / HEX_SIZE;
    const r = (2 / 3 * y_corrected) / HEX_SIZE;

    return hexRound(q, r);
}

// Building Rendering Helpers
export function drawBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, type: string) {
    if (type === 'TOWN_HALL') {
        // Main Keep
        ctx.fillStyle = '#94a3b8'; // Stone Slate
        ctx.fillRect(x - 10, y - 25, 20, 15);
        // Roof
        ctx.fillStyle = '#b91c1c'; // Red Roof
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 25);
        ctx.lineTo(x, y - 35);
        ctx.lineTo(x + 12, y - 25);
        ctx.fill();
        // Door
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x - 3, y - 15, 6, 8);
    } else if (type === 'HOUSE') {
        // Cottage
        ctx.fillStyle = '#fcd34d'; // Yellowish/Wood
        ctx.fillRect(x - 8, y - 12, 16, 10);
        // Roof
        ctx.fillStyle = '#7c2d12'; // Brown
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 12);
        ctx.lineTo(x, y - 20);
        ctx.lineTo(x + 10, y - 12);
        ctx.fill();
        // Door
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x - 2, y - 8, 4, 6);
    } else if (type === 'FARM') {
        // Fields (Yellow patches)
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(x - 8, y + 2, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 8, y + 2, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Barn
        ctx.fillStyle = '#ef4444'; // Red Barn
        ctx.fillRect(x - 6, y - 12, 12, 10);
        ctx.fillStyle = '#b91c1c'; // Dark Red Roof
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 12);
        ctx.lineTo(x, y - 18);
        ctx.lineTo(x + 8, y - 12);
        ctx.fill();
    } else if (type === 'SAWMILL') {
        // Logs
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x - 10, y + 2, 8, 3);
        ctx.fillRect(x - 8, y - 1, 8, 3);

        // Structure
        ctx.fillStyle = '#a8a29e'; // Stone/Wood mix
        ctx.fillRect(x + 2, y - 15, 10, 15);
        // Saw blade
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(x + 2, y - 8, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === 'MINE') {
        // Mountain backdrop (re-use color)
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(x - 10, y + 5);
        ctx.lineTo(x, y - 15);
        ctx.lineTo(x + 10, y + 5);
        ctx.fill();

        // Cave Entrance
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(x, y + 2, 5, Math.PI, 0); // Semi circle
        ctx.fill();

        // Wooden beams
        ctx.strokeStyle = '#713f12';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 4, y - 2, 8, 6);
    }
}
