import React from 'react';
import { GameLayout } from '../components/layout/GameLayout';
import { GameMap } from '../components/game/GameMap';

export const GamePage = () => {
    return (
        <GameLayout>
            <div className="relative w-full h-full">
                <GameMap width={20} height={15} />
            </div>
        </GameLayout>
    );
};
