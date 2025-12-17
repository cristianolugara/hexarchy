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

export interface Tile {
    id: string;
    coordinates: HexCoordinate;
    biome: BiomeType;
    resourceYield?: Partial<Record<ResourceType, number>>;
    isStartLocation?: boolean;
}

export interface GameState {
    mapWidth: number;
    mapHeight: number;
    tiles: Map<string, Tile>; // Key: "q,r"
}
