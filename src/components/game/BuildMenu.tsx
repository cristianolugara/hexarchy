import React, { useState } from 'react';
import { BuildingType } from '../../types/game';
import { BUILDINGS } from '../../config/buildings';
import { Button } from '../ui/Button';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface BuildMenuProps {
    onSelectBuilding: (type: BuildingType | null) => void;
    selectedBuilding: BuildingType | null;
}

export const BuildMenu: React.FC<BuildMenuProps> = ({ onSelectBuilding, selectedBuilding }) => {
    const [isOpen, setIsOpen] = useState(false);
    const resources = useSelector((state: RootState) => state.resources);

    const canAfford = (type: BuildingType) => {
        const cost = BUILDINGS[type].cost;
        // Map resources keys to config keys
        // Simple check:
        if (cost.FOOD && resources.food < cost.FOOD) return false;
        if (cost.WOOD && resources.wood < cost.WOOD) return false;
        if (cost.STONE && resources.stone < cost.STONE) return false;
        if (cost.GOLD && resources.gold < cost.GOLD) return false;
        return true;
    };

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">

            {isOpen && (
                <div className="flex gap-2 p-3 bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-700 shadow-xl animate-in slide-in-from-bottom-5">
                    {Object.values(BuildingType).filter(b => b !== BuildingType.TOWN_HALL).map((bType) => {
                        const config = BUILDINGS[bType];
                        const affordable = canAfford(bType);
                        const isSelected = selectedBuilding === bType;

                        return (
                            <button
                                key={bType}
                                onClick={() => onSelectBuilding(isSelected ? null : bType)}
                                disabled={!affordable}
                                className={`
                          relative flex flex-col items-center p-3 rounded-xl min-w-[100px] transition-all
                          ${isSelected ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-800 border-slate-700'}
                          ${affordable ? 'hover:bg-slate-700 border hover:border-slate-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          border
                       `}
                            >
                                <div className="font-bold text-sm text-slate-200">{config.name}</div>
                                <div className="text-xs text-slate-400 mt-1 flex gap-2">
                                    {config.cost.WOOD && <span>🪵{config.cost.WOOD}</span>}
                                    {config.cost.STONE && <span>🪨{config.cost.STONE}</span>}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}

            <Button
                variant={isOpen ? 'secondary' : 'primary'}
                size="lg"
                onClick={() => setIsOpen(!isOpen)}
                className="shadow-xl"
            >
                {isOpen ? 'Close Menu' : '🔨 Build'}
            </Button>
        </div>
    );
};
