import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


export interface ResourcesState {
    food: number;
    wood: number;
    stone: number;
    iron: number;
    gold: number;
    population: number;
    happiness: number;
}

const initialState: ResourcesState = {
    food: 200,
    wood: 200,
    stone: 100,
    iron: 0,
    gold: 50,
    population: 5,
    happiness: 100,
};

export const resourcesSlice = createSlice({
    name: 'resources',
    initialState,
    reducers: {
        addResource: (state, action: PayloadAction<{ type: keyof ResourcesState; amount: number }>) => {
            const { type, amount } = action.payload;
            state[type] += amount;
        },
        spendResource: (state, action: PayloadAction<{ type: keyof ResourcesState; amount: number }>) => {
            const { type, amount } = action.payload;
            if (state[type] >= amount) {
                state[type] -= amount;
            }
        },
        tickResources: (state, action: PayloadAction<Partial<ResourcesState>>) => {
            // Apply production rates
            const production = action.payload;
            if (production.food) state.food += production.food;
            if (production.wood) state.wood += production.wood;
            if (production.stone) state.stone += production.stone;
            if (production.iron) state.iron += production.iron;
            if (production.gold) state.gold += production.gold;
        }
    },
});

export const { addResource, spendResource, tickResources } = resourcesSlice.actions;

export default resourcesSlice.reducer;
