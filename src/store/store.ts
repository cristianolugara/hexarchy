import { configureStore } from '@reduxjs/toolkit';
import resourcesReducer from './resourcesSlice';

export const store = configureStore({
    reducer: {
        resources: resourcesReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
