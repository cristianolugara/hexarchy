import { BuildingType, type ResourceType } from '../types/game';

export interface BuildingConfig {
    name: string;
    cost: Partial<Record<ResourceType, number>>;
    production: Partial<Record<ResourceType, number>>;
    description: string;
}

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
    [BuildingType.TOWN_HALL]: {
        name: 'Town Hall',
        cost: { WOOD: 500, STONE: 500 }, // High initial cost or free start
        production: { FOOD: 1, WOOD: 1, GOLD: 2 },
        description: 'Center of your civilization'
    },
    [BuildingType.HOUSE]: {
        name: 'House',
        cost: { WOOD: 50 },
        production: { GOLD: 0.5 }, // Tax?
        description: 'Provides population'
    },
    [BuildingType.FARM]: {
        name: 'Farm',
        cost: { WOOD: 30, STONE: 10 },
        production: { FOOD: 5 },
        description: 'Produces Food'
    },
    [BuildingType.SAWMILL]: {
        name: 'Sawmill',
        cost: { WOOD: 40, STONE: 20 },
        production: { WOOD: 5 },
        description: 'Produces Wood'
    },
    [BuildingType.MINE]: {
        name: 'Mine',
        cost: { WOOD: 60, STONE: 40 },
        production: { STONE: 3, IRON: 1 },
        description: 'Produces Stone and Iron'
    }
};
