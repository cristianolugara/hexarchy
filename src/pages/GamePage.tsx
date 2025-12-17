
import { GameLayout } from '../components/layout/GameLayout';
import { GameMap } from '../components/game/GameMap';
import { GameTicker } from '../components/game/GameTicker';

export const GamePage = () => {
    return (
        <GameLayout>
            <GameTicker />
            <div className="relative w-full h-full">
                <GameMap width={20} height={15} />
            </div>
        </GameLayout>
    );
};
