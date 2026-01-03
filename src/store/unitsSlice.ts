import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Unit {
    id: string;
    type: 'VILLAGER';
    x: number;
    y: number;
    target?: { x: number, y: number };
    state: 'IDLE' | 'MOVING' | 'WORKING';
}

export interface UnitsState {
    units: Unit[];
}

const initialState: UnitsState = {
    units: []
};

export const unitsSlice = createSlice({
    name: 'units',
    initialState,
    reducers: {
        spawnUnit: (state, action: PayloadAction<Unit>) => {
            state.units.push(action.payload);
        },
        updateUnit: (state, action: PayloadAction<Unit>) => {
            const index = state.units.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.units[index] = action.payload;
            }
        },
        updateUnits: (state, action: PayloadAction<Unit[]>) => {
            state.units = action.payload;
        },
        removeUnit: (state, action: PayloadAction<string>) => {
            state.units = state.units.filter(u => u.id !== action.payload);
        }
    }
});

export const { spawnUnit, updateUnit, updateUnits, removeUnit } = unitsSlice.actions;
export default unitsSlice.reducer;
