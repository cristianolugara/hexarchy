import { useState } from 'react';
import { GameLayout } from '../components/layout/GameLayout';
import { GameMap } from '../components/game/GameMap';
import { GameTicker } from '../components/game/GameTicker';
import { BuildMenu } from '../components/game/BuildMenu';
import { type BuildingType, type Tile } from '../types/game';
import { BUILDINGS } from '../config/buildings';
import { useDispatch } from 'react-redux';
import { spendResource } from '../store/resourcesSlice';

export const GamePage = () => {
    const dispatch = useDispatch();
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);

    const handleTileClick = (tile: Tile) => {
        if (selectedBuilding) {
            // Construct!
            const config = BUILDINGS[selectedBuilding];

            // Deduct Resources
            if (config.cost.WOOD) dispatch(spendResource({ type: 'wood', amount: config.cost.WOOD }));
            if (config.cost.STONE) dispatch(spendResource({ type: 'stone', amount: config.cost.STONE }));

            // TODO: Actually place building on map (Update Map State)
            // This requires moving Map State up or using a Context/Store for the Map.
            // For now, let's just log it to prove logic works.
            console.log(`Built ${config.name} at ${tile.id} `);

            setSelectedBuilding(null); // Exit build mode
        }
    };

    return (
        <GameLayout>
            <GameTicker />
            <div className="relative w-full h-full">
                <GameMap
                    width={20}
                    height={15}
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
