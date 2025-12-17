
import { GameLayout } from '../components/layout/GameLayout';
import { Button } from '../components/ui/Button';

export const GamePage = () => {
    return (
        <GameLayout>
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Placeholder Map Content */}
                <div className="text-center space-y-6 z-10 p-12 rounded-3xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl shadow-2xl">
                    <h2 className="text-4xl font-light text-white tracking-wide">Ready to Rule?</h2>
                    <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
                        Your civilization awaits. Begin by establishing your first settlement in the fertile plains.
                    </p>
                    <div className="flex gap-4 justify-center mt-8">
                        <Button variant="primary" size="lg" className="shadow-blue-900/20">
                            Start Construction
                        </Button>
                        <Button variant="secondary" size="lg">
                            World Map
                        </Button>
                    </div>
                </div>
            </div>
        </GameLayout>
    );
};
