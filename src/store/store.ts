import { configureStore, combineReducers } from '@reduxjs/toolkit';
import resourcesReducer from './resourcesSlice';
import mapReducer from './mapSlice';
import unitsReducer from './unitsSlice';

// Persist helper
const loadState = () => {
    try {
        const serializedState = localStorage.getItem('hexarchy_state');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

const saveState = (state: RootState) => {
    try {
        const serializedState = JSON.stringify({
            map: state.map,
            resources: state.resources,
            units: state.units
        });
        localStorage.setItem('hexarchy_state', serializedState);
    } catch {
        // ignore write errors
    }
};

const preloadedState = loadState();

const rootReducer = combineReducers({
    resources: resourcesReducer,
    map: mapReducer,
    units: unitsReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as any // Cast key prevents type inference issues
});

// Subscribe to store updates to save state (simple debounce could be added here but keeping it simple for now)
let lastSave = 0;
store.subscribe(() => {
    const now = Date.now();
    if (now - lastSave > 1000) { // Save max once per second
        saveState(store.getState());
        lastSave = now;
    }
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
