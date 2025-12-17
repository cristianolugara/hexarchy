import { useRef, useEffect, useState } from 'react';
import { drawHex, hexToPixel, pixelToHex, getHexId, BIOME_COLORS, drawBuilding } from '../../lib/hexUtils';
import type { Tile, HexCoordinate } from '../../types/game';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface GameMapProps {
    width?: number; // kept for compatibility
    height?: number;
    onTileClick?: (tile: Tile) => void;
}

export const GameMap = ({ onTileClick }: GameMapProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Redux State
    const mapState = useSelector((state: RootState) => state.map);
    // Convert Record to Map for easier iteration in rendering if needed, 
    // or just iterate Object.values

    // We can rely on mapState.tiles directly now.

    const [camera, setCamera] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredHex, setHoveredHex] = useState<HexCoordinate | null>(null);
    const [selectedHex, setSelectedHex] = useState<HexCoordinate | null>(null);

    // Map generation is now handled by Redux Initial State or Thunks. 
    // We don't generate here anymore.

    // Draw Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize Canvas
        if (containerRef.current) {
            canvas.width = containerRef.current.clientWidth;
            canvas.height = containerRef.current.clientHeight;
        }

        // Clear Screen
        ctx.fillStyle = '#1e293b'; // Slate 800
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply Camera Transform
        ctx.save();
        ctx.translate(canvas.width / 2 + camera.x, canvas.height / 2 + camera.y);

        // Draw Tiles - Render in order of Y (Painter's Algorithm for Isometric depth)
        const sortedTiles = Object.values(mapState.tiles).sort((a, b) => {
            const aPos = hexToPixel(a.coordinates);
            const bPos = hexToPixel(b.coordinates);
            return aPos.y - bPos.y;
        });

        sortedTiles.forEach(tile => {
            const { x, y } = hexToPixel(tile.coordinates);
            const color = BIOME_COLORS[tile.biome];

            // Pass building info to drawHex if exists
            // For now, drawHex doesn't accept building argument.
            // We need to modify drawHex or draw building separately on top.

            drawHex(ctx, x, y, color);

            // Draw Selection Highlight
            if (selectedHex && selectedHex.q === tile.coordinates.q && selectedHex.r === tile.coordinates.r) {
                drawHex(ctx, x, y, 'rgba(59, 130, 246, 0.4)', '#60a5fa', 2);
            }

            // Draw Building
            if (tile.building) {
                drawBuilding(ctx, x, y, tile.building);
            }
        });

        // Draw Hover Cursor
        if (hoveredHex) {
            const { x, y } = hexToPixel(hoveredHex);
            const id = getHexId(hoveredHex.q, hoveredHex.r);
            if (mapState.tiles[id]) {
                drawHex(ctx, x, y, 'rgba(255, 255, 255, 0.2)', 'white', 2);
            }
        }

        ctx.restore();

    }, [mapState, camera, hoveredHex, selectedHex]);

    // Input Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            setCamera(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setDragStart({ x: e.clientX, y: e.clientY });
        } else {
            // Hover Logic
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left - rect.width / 2 - camera.x;
            const y = e.clientY - rect.top - rect.height / 2 - camera.y;

            const hex = pixelToHex(x, y);
            setHoveredHex(hex);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleClick = (e: React.MouseEvent) => {
        // Simple click detection (if not dragging) works because react events are synthesized.
        // We might want to lock click if drag distance was large, but for now standard click is fine.
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left - rect.width / 2 - camera.x;
        const y = e.clientY - rect.top - rect.height / 2 - camera.y;

        const hex = pixelToHex(x, y);
        const id = getHexId(hex.q, hex.r);

        if (mapState.tiles[id]) {
            const tile = mapState.tiles[id];
            setSelectedHex(hex);
            if (onTileClick) onTileClick(tile);
        } else {
            setSelectedHex(null);
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-950 cursor-crosshair">
            <canvas
                ref={canvasRef}
                className="block touch-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleClick}
            />

            {/* HUD Overlay */}
            <div className="absolute bottom-6 left-6 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-700 shadow-2xl text-slate-100 min-w-[200px]">
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Tile Inspector</div>
                    {selectedHex ? (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full bg-current`} style={{ color: mapState.tiles[getHexId(selectedHex.q, selectedHex.r)] ? BIOME_COLORS[mapState.tiles[getHexId(selectedHex.q, selectedHex.r)].biome] : 'white' }}></div>
                                <span className="font-medium text-lg capitalize">{mapState.tiles[getHexId(selectedHex.q, selectedHex.r)]?.biome.toLowerCase()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-400 font-mono">
                                <div>Q: {selectedHex.q}</div>
                                <div>R: {selectedHex.r}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 italic">Select a tile</div>
                    )}
                </div>
            </div>

            <button
                onClick={() => setCamera({ x: 0, y: 0 })}
                className="absolute bottom-6 right-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-lg border border-slate-600 transition-colors z-10"
            >
                Recenter
            </button>
        </div>
    );
};
