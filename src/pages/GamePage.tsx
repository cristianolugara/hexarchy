import { useState } from 'react';
import { GameLayout } from '../components/layout/GameLayout';
import { GameMap } from '../components/game/GameMap';
import { GameTicker } from '../components/game/GameTicker';
import { UnitTicker } from '../components/game/UnitTicker'; // Import UnitTicker
import { BuildMenu } from '../components/game/BuildMenu';
import { type BuildingType, type Tile } from '../types/game';
import { BUILDINGS } from '../config/buildings';
import { useDispatch, useSelector } from 'react-redux';
import { spendResource } from '../store/resourcesSlice';
import type { RootState } from '../store/store';

import { placeBuilding } from '../store/mapSlice';

export const GamePage = () => {
    const dispatch = useDispatch();
    const resources = useSelector((state: RootState) => state.resources);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);

    const handleTileClick = (tile: Tile) => {
        if (selectedBuilding) {
            // Construct!
            const config = BUILDINGS[selectedBuilding];

            // 1. Check Affordability
            const woodCost = config.cost.WOOD || 0;
            const stoneCost = config.cost.STONE || 0;

            if (resources.wood < woodCost || resources.stone < stoneCost) {
                alert("Not enough resources!"); // Simple feedback for now
                return;
            }

            // 2. Deduct Resources
            if (woodCost) dispatch(spendResource({ type: 'wood', amount: woodCost }));
            if (stoneCost) dispatch(spendResource({ type: 'stone', amount: stoneCost }));

            // 3. Place building on map (Redux)
            dispatch(placeBuilding({ tileId: tile.id, building: selectedBuilding }));

            console.log(`Built ${config.name} at ${tile.id}`);

            setSelectedBuilding(null); // Exit build mode
        }
    };

    return (
        <GameLayout>
            <GameTicker />
            <UnitTicker />
            <div className="relative w-full h-full">
                <GameMap
                    onTileClick={handleTileClick}
                />

                <BuildMenu
                    selectedBuilding={selectedBuilding}
                    onSelectBuilding={setSelectedBuilding}
                />
            </div>
        </GameLayout>
    );
};
