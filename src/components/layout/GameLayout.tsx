import React from 'react';

export const GameLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Top Bar */}
            <header className="h-16 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md flex items-center px-6 justify-between z-50 shrink-0 shadow-sm relative">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">C</div>
                    <span className="font-bold text-xl tracking-tight text-white/90">Civitas</span>
                </div>

                <div className="flex gap-6">
                    {/* Resources Placeholder */}
                    <div className="flex items-center gap-6 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-amber-100/90 font-medium text-sm">
                            <span className="text-lg">🌾</span> 120
                        </div>
                        <div className="w-px h-4 bg-slate-700"></div>
                        <div className="flex items-center gap-2 text-amber-100/90 font-medium text-sm">
                            <span className="text-lg">🪵</span> 450
                        </div>
                        <div className="w-px h-4 bg-slate-700"></div>
                        <div className="flex items-center gap-2 text-amber-100/90 font-medium text-sm">
                            <span className="text-lg">🪨</span> 210
                        </div>
                        <div className="w-px h-4 bg-slate-700"></div>
                        <div className="flex items-center gap-2 text-amber-400 font-medium text-sm">
                            <span className="text-lg">💰</span> 50
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700"></div>
                </div>
            </header>

            <main className="flex-1 relative overflow-hidden bg-slate-950">
                {/* Background Grid Pattern for ambiance */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                    }}
                />

                {children}
            </main>
        </div>
    );
};
