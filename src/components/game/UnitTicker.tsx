import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUnits, spawnUnit, removeUnit, type Unit } from '../../store/unitsSlice';
import type { RootState } from '../../store/store';
import { hexToPixel } from '../../lib/hexUtils';

export const UnitTicker = () => {
    const dispatch = useDispatch();
    const units = useSelector((state: RootState) => state.units.units);
    const population = useSelector((state: RootState) => state.resources.population); // Total pop
    const tiles = useSelector((state: RootState) => state.map.tiles);

    // Refs for loop
    const unitsRef = useRef(units);
    const tilesRef = useRef(tiles);
    const populationRef = useRef(population);

    useEffect(() => {
        unitsRef.current = units;
    }, [units]);

    useEffect(() => {
        tilesRef.current = tiles;
    }, [tiles]);

    useEffect(() => {
        populationRef.current = population;
    }, [population]);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentUnits = [...unitsRef.current];
            const currentTiles = tilesRef.current;
            const currentPop = populationRef.current;
            const tileKeys = Object.keys(currentTiles);

            let updated = false;

            // 1. Spawn/Despawn Logic
            if (currentUnits.length < currentPop) {
                // Spawn one
                const randomTileId = tileKeys[Math.floor(Math.random() * tileKeys.length)];
                const tile = currentTiles[randomTileId];
                const { x, y } = hexToPixel(tile.coordinates);

                const newUnit: Unit = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'VILLAGER',
                    x,
                    y,
                    state: 'IDLE'
                };
                dispatch(spawnUnit(newUnit));
                return; // Wait next tick to move
            } else if (currentUnits.length > currentPop) {
                // Despawn (kill random)
                const unitToRemove = currentUnits[0];
                if (unitToRemove) dispatch(removeUnit(unitToRemove.id));
                return;
            }

            // 2. Movement Logic
            const SPEED = 2; // Pixels per tick (50ms) = 40px/sec

            currentUnits.forEach((unit, index) => {
                let { x, y, target, state } = unit;

                // Pick target if idle
                if (!target || (Math.abs(target.x - x) < 5 && Math.abs(target.y - y) < 5)) {
                    // Reached target or no target
                    const randomTileId = tileKeys[Math.floor(Math.random() * tileKeys.length)];
                    const tile = currentTiles[randomTileId];
                    const pos = hexToPixel(tile.coordinates);

                    // Add some randomness to position within tile
                    target = {
                        x: pos.x + (Math.random() * 20 - 10),
                        y: pos.y + (Math.random() * 20 - 10)
                    };
                    state = 'MOVING';
                    updated = true;
                }

                // Move
                if (target) {
                    const dx = target.x - x;
                    const dy = target.y - y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > SPEED) {
                        x += (dx / dist) * SPEED;
                        y += (dy / dist) * SPEED;
                        updated = true;
                    } else {
                        x = target.x;
                        y = target.y;
                    }
                }

                // Update local obj
                currentUnits[index] = { ...unit, x, y, target, state };
            });

            if (updated) {
                dispatch(updateUnits(currentUnits));
            }

        }, 50); // 20 FPS updates

        return () => clearInterval(interval);
    }, [dispatch]);

    return null;
};
