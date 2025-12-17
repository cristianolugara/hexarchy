import { configureStore } from '@reduxjs/toolkit';
import resourcesReducer from './resourcesSlice';
import mapReducer from './mapSlice';

export const store = configureStore({
    reducer: {
        resources: resourcesReducer,
        map: mapReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
