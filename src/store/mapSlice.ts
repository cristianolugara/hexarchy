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

            let biome = BiomeType.PLAINS;

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
                biome,
                resources: {}
            };
        }
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
