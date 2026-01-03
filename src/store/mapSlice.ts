import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Tile, BiomeType, type BuildingType } from '../types/game';
import { getHexId } from '../lib/hexUtils';
import { Noise } from '../lib/noise';

export interface MapState {
    width: number;
    height: number;
    tiles: Record<string, Tile>; // Key: "q,r"
}

const INITIAL_WIDTH = 50;
const INITIAL_HEIGHT = 40;

// Helper to init map with Noise
const initTiles = (): Record<string, Tile> => {
    const tiles: Record<string, Tile> = {};
    const elevationNoise = new Noise(Math.random());
    const moistureNoise = new Noise(Math.random() + 100);
    const scale = 0.1; // scale of noise features

    for (let r = 0; r < INITIAL_HEIGHT; r++) {
        const r_offset = Math.floor(r / 2);
        for (let q = -r_offset; q < INITIAL_WIDTH - r_offset; q++) {
            const id = getHexId(q, r);

            // Generate Biome using Noise
            const nx = q * scale;
            const ny = r * scale;

            const e = elevationNoise.noise2D(nx, ny);
            const m = moistureNoise.noise2D(nx, ny);

            let biome: BiomeType = BiomeType.PLAINS;

            // Simple Biome Map
            if (e < -0.3) {
                biome = BiomeType.WATER;
            } else if (e > 0.4) {
                biome = BiomeType.MOUNTAIN;
            } else if (e > 0.2) {
                biome = BiomeType.HILLS;
            } else {
                // Plains or Forest based on moisture
                if (m > 0.1) {
                    biome = BiomeType.FOREST;
                } else {
                    biome = BiomeType.PLAINS;
                }
            }

            tiles[id] = {
                id,
                coordinates: { q, r, s: -q - r },
                biome
            };
        }
    }
    // Initial Town Hall Placement
    // Find a good spot near center
    const centerX = Math.floor(INITIAL_WIDTH / 2);
    const centerY = Math.floor(INITIAL_HEIGHT / 2);
    let startTileId: string | null = null;
    let minDistance = Infinity;

    // Search for closest PLAINS to center
    Object.values(tiles).forEach(tile => {
        if (tile.biome === BiomeType.PLAINS) {
            const dist = Math.sqrt(
                Math.pow(tile.coordinates.q - (centerX - centerY / 2), 2) +
                Math.pow(tile.coordinates.r - centerY, 2)
            );

            // Adjust center calc slightly because of offset coords vs axial
            // Rough approximation is fine.

            if (dist < minDistance) {
                minDistance = dist;
                startTileId = tile.id;
            }
        }
    });

    if (startTileId && tiles[startTileId]) {
        tiles[startTileId].building = 'TOWN_HALL' as any; // Cast as BuildingType relies on import
    }

    return tiles;
};

const initialState: MapState = {
    width: INITIAL_WIDTH,
    height: INITIAL_HEIGHT,
    tiles: initTiles()
};

export const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        placeBuilding: (state, action: PayloadAction<{ tileId: string, building: BuildingType }>) => {
            const { tileId, building } = action.payload;
            const tile = state.tiles[tileId];
            if (tile) {
                tile.building = building;
            }
        },
        updateTile: (state, action: PayloadAction<Tile>) => {
            const tile = action.payload;
            state.tiles[tile.id] = tile;
        }
    }
});

export const { placeBuilding, updateTile } = mapSlice.actions;
export default mapSlice.reducer;
