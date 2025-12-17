export type ResourceType = 'FOOD' | 'WOOD' | 'STONE' | 'IRON' | 'GOLD' | 'POPULATION' | 'HAPPINESS';

export const BiomeType = {
    PLAINS: 'PLAINS',
    FOREST: 'FOREST',
    MOUNTAIN: 'MOUNTAIN',
    DESERT: 'DESERT',
    WATER: 'WATER',
    HILLS: 'HILLS'
} as const;

export type BiomeType = typeof BiomeType[keyof typeof BiomeType];

export interface HexCoordinate {
    q: number;
    r: number;
    s: number; // q + r + s = 0
}

// Building Types
export const BuildingType = {
    TOWN_HALL: 'TOWN_HALL',
    HOUSE: 'HOUSE',
    FARM: 'FARM',
    SAWMILL: 'SAWMILL',
    MINE: 'MINE',
} as const;

export type BuildingType = typeof BuildingType[keyof typeof BuildingType];

export interface Tile {
    id: string;
    coordinates: HexCoordinate;
    biome: BiomeType;
    building?: BuildingType;
    resourceYield?: Partial<Record<ResourceType, number>>;
    isStartLocation?: boolean;
}

export interface GameState {
    mapWidth: number;
    mapHeight: number;
    tiles: Map<string, Tile>; // Key: "q,r"
}
