import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { tickResources } from '../../store/resourcesSlice';
import type { RootState } from '../../store/store';
import { BUILDINGS } from '../../config/buildings';

export const GameTicker = () => {
    const dispatch = useDispatch();
    const tiles = useSelector((state: RootState) => state.map.tiles);

    // Use a ref to access the latest tiles state inside the interval 
    // without resetting the timer on every change.
    const tilesRef = useRef(tiles);

    useEffect(() => {
        tilesRef.current = tiles;
    }, [tiles]);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentTiles = tilesRef.current;

            // Calculate total production from buildings
            let food = 0;
            let wood = 0;
            let stone = 0;
            let iron = 0;
            let gold = 0;

            Object.values(currentTiles).forEach(tile => {
                if (tile.building) {
                    const config = BUILDINGS[tile.building];
                    if (config && config.production) {
                        if (config.production.FOOD) food += config.production.FOOD;
                        if (config.production.WOOD) wood += config.production.WOOD;
                        if (config.production.STONE) stone += config.production.STONE;
                        if (config.production.IRON) iron += config.production.IRON;
                        if (config.production.GOLD) gold += config.production.GOLD;
                    }
                }
            });

            // Always provide at least some base production so the game isn't stuck if you run out logic
            // Or maybe not? Let's keep it pure for now, assuming player starts with resources.
            // Actually, let's keep a tiny base production implies a Town Center or similar logic, 
            // but the Town Hall building should cover that. 
            // If no Town Hall, maybe game over or handled by initial buildings?
            // User can place Town Hall.

            dispatch(tickResources({
                food,
                wood,
                stone,
                iron,
                gold
            }));

        }, 1000); // 1 second tick

        return () => clearInterval(interval);
    }, [dispatch]);

    return null; // Invisible component
};
