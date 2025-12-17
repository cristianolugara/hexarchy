import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Tile, type BuildingType } from '../types/game';
import { generateMap } from '../lib/hexUtils';

export interface MapState {
    width: number;
    height: number;
    tiles: Record<string, Tile>; // Key: "q,r"
}

const INITIAL_WIDTH = 25;
const INITIAL_HEIGHT = 20;

// Helper to init map
const initTiles = (): Record<string, Tile> => {
    const tileArray = generateMap(INITIAL_WIDTH, INITIAL_HEIGHT);
    const tileMap: Record<string, Tile> = {};
    tileArray.forEach(t => tileMap[t.id] = t);
    return tileMap;
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
