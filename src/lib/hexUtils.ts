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

// Image Assets Cache
const assets: Record<string, HTMLImageElement> = {};

// Preload Assets with Transparency Processing
interface AssetOptions {
    smartShadows?: boolean;
    threshold?: number;
}

const loadAsset = (key: string, src: string, options: AssetOptions = {}) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        // Create an offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Default Threshold
        const threshold = options.threshold ?? 60;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Distance from white (255, 255, 255)
            const dist = Math.sqrt(
                Math.pow(255 - r, 2) +
                Math.pow(255 - g, 2) +
                Math.pow(255 - b, 2)
            );

            if (options.smartShadows) {
                // Special logic for Trees to keep ground shadows but remove box
                const removeThreshold = 40;
                const shadowThreshold = 120;

                if (dist < removeThreshold) {
                    data[i + 3] = 0; // Transparent
                } else if (dist < shadowThreshold) {
                    // Convert light grey background artifacts to shadow
                    const intensity = dist / shadowThreshold;
                    data[i] = 10;     // R
                    data[i + 1] = 20; // G
                    data[i + 2] = 10; // B
                    data[i + 3] = Math.floor(intensity * 100);
                }
            } else {
                // Standard Chroma Key for Tiles (Water, Mountain, etc)
                // Just remove white, don't darken anything.
                if (dist < threshold) {
                    data[i + 3] = 0; // Transparent
                }
            }
        }

        // Put modified data back
        ctx.putImageData(imageData, 0, 0);

        // Create a new image from the processed canvas
        const processedImg = new Image();
        processedImg.src = canvas.toDataURL();
        assets[key] = processedImg;
    };
    img.src = src;
};

// Start Loading (Is it safe to do here? Yes, module level execution)
loadAsset('PLAINS', '/assets/tile_plains.png');
loadAsset('TREE', '/assets/prop_tree.png', { smartShadows: true });
loadAsset('WATER', '/assets/tile_water.png', { threshold: 40 });
loadAsset('MOUNTAIN', '/assets/tile_mountain.png', { threshold: 40 });
loadAsset('DIRT', '/assets/tile_dirt.png');

export function drawHex(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    stroke: string = "rgba(0,0,0,0.1)",
    strokeWidth: number = 1
) {
    // Determine Biome from color to pick asset
    let assetKey = '';

    // Mapping
    if (color === BIOME_COLORS.PLAINS) assetKey = 'PLAINS';
    else if (color === BIOME_COLORS.FOREST) assetKey = 'PLAINS'; // Forest sits on grass
    else if (color === BIOME_COLORS.HILLS) assetKey = 'DIRT';    // Hills are Dirt for now
    else if (color === BIOME_COLORS.WATER) assetKey = 'WATER';
    else if (color === BIOME_COLORS.MOUNTAIN) assetKey = 'MOUNTAIN';

    const tileImg = assets[assetKey];

    if (tileImg && tileImg.complete) {
        let size = HEX_SIZE * 2.5;
        let yOffset = 0; // Default aligned to grid center

        // Adjustments per type
        if (assetKey === 'MOUNTAIN') {
            size = HEX_SIZE * 3.0; // Big mountains
            yOffset = 15; // Relative height maintained (was 25 vs 10, now 15 vs 0)
        } else if (assetKey === 'WATER') {
            // Water should match the standard tile size if the asset is uniform with grass
            size = HEX_SIZE * 2.5;
            yOffset = 0;
        }

        ctx.drawImage(tileImg, x - size / 2, y - size / 2 - yOffset, size, size);
    } else {
        // Fallback to Color Drawing
        const depth = (color === BIOME_COLORS.WATER) ? 0 : HEX_DEPTH;
        const sideColor = shadeColor(color, -30);
        drawHexPath(ctx, x, y, depth);
        ctx.fillStyle = sideColor;
        ctx.fill();
        drawHexPath(ctx, x, y, 0);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();

        if (color === BIOME_COLORS.WATER) {
            drawWaterWaves(ctx, x, y);
        }
    }

    // 3. Draw Props (Trees, Mountains)
    if (color === BIOME_COLORS.FOREST) {
        const treeImg = assets['TREE'];
        if (treeImg && treeImg.complete) {
            // Bigger and Centered Trees
            const h = 70; // Taller
            const w = 45; // Wider
            // Draw centered on tile
            // x is center of hex. y is center of hex TOP face.
            // Center horizontally: x - w/2
            // Vertical: y - h (top left of image) + adjustment (roots at y+5)
            ctx.drawImage(treeImg, x - w / 2, y - h + 5, w, h);
        } else {
            drawTree(ctx, x, y); // fallback procedural
        }
    }
    // Remove old mountain/hill procedural calls if we use tiles
    else if (color === BIOME_COLORS.MOUNTAIN) {
        if (!assets['MOUNTAIN']?.complete) drawMountain(ctx, x, y);
    }
    else if (color === BIOME_COLORS.HILLS) {
        if (!assets['DIRT']?.complete) drawHill(ctx, x, y);
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

function drawWaterWaves(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 5);
    ctx.lineTo(x + 5, y - 5);
    ctx.moveTo(x - 10, y + 2);
    ctx.lineTo(x + 2, y + 2);
    ctx.moveTo(x - 2, y + 8);
    ctx.lineTo(x + 8, y + 8);
    ctx.stroke();
}

function drawMountain(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Main Peak
    ctx.fillStyle = '#64748b'; // Slate 500
    ctx.beginPath();
    ctx.moveTo(x - 15, y + 5);
    ctx.lineTo(x, y - 25);
    ctx.lineTo(x + 15, y + 5);
    ctx.fill();

    // Side Peak (Left)
    ctx.fillStyle = '#475569'; // Slate 600
    ctx.beginPath();
    ctx.moveTo(x - 20, y + 8);
    ctx.lineTo(x - 10, y - 10);
    ctx.lineTo(x, y + 8);
    ctx.fill();

    // Snow Caps
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 15);
    ctx.lineTo(x, y - 25);
    ctx.lineTo(x + 5, y - 15);
    ctx.fill();
}

function drawHill(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Draw 2-3 small mounds
    ctx.fillStyle = '#a16207'; // Yellow/Brown 700 (Dirt)

    ctx.beginPath();
    ctx.arc(x - 5, y + 2, 8, 0, Math.PI, true);
    ctx.fill();

    ctx.fillStyle = '#854d0e'; // Darker
    ctx.beginPath();
    ctx.arc(x + 6, y + 5, 6, 0, Math.PI, true);
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
