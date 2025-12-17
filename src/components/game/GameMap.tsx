import React, { useEffect, useRef, useState, useCallback } from 'react';
import { generateMap, drawHex, hexToPixel, pixelToHex, getHexId, BIOME_COLORS, HEX_SIZE } from '../../lib/hexUtils';
import { Tile, HexCoordinate } from '../../types/game';

interface GameMapProps {
    width?: number; // Map width in hexes
    height?: number; // Map height in hexes
}

export const GameMap: React.FC<GameMapProps> = ({ width = 15, height = 10 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tiles, setTiles] = useState<Map<string, Tile>>(new Map());

    // Camera state for panning
    const [camera, setCamera] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    // Interaction State
    const [hoveredHex, setHoveredHex] = useState<HexCoordinate | null>(null);
    const [selectedHex, setSelectedHex] = useState<HexCoordinate | null>(null);

    // Initialize Map
    useEffect(() => {
        const tilesArr = generateMap(width, height);
        const map = new Map<string, Tile>();
        tilesArr.forEach(t => map.set(t.id, t));
        setTiles(map);
    }, [width, height]);

    // Handle Coordinate Conversion (Screen <-> World)
    const getMapCoordinates = useCallback((clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        // Mouse relative to canvas
        const mx = clientX - rect.left;
        const my = clientY - rect.top;

        // Apply Camera offset inverse
        // Drawing Transform: translate(cx, cy)
        // Screen = World + Offset
        // World = Screen - Offset
        const offsetX = canvas.width / 2 + camera.x;
        const offsetY = canvas.height / 2 + camera.y;

        return {
            x: mx - offsetX,
            y: my - offsetY
        };
    }, [camera]);

    // Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas to fill container
        if (containerRef.current) {
            // Check if resize is needed to avoid clearing every frame if same size?
            // For now simple resize
            if (canvas.width !== containerRef.current.clientWidth || canvas.height !== containerRef.current.clientHeight) {
                canvas.width = containerRef.current.clientWidth;
                canvas.height = containerRef.current.clientHeight;
            }
        }

        // Clear Screen
        ctx.fillStyle = '#0f172a'; // slate-900
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();

        // Center the rendering:
        const offsetX = canvas.width / 2 + camera.x;
        const offsetY = canvas.height / 2 + camera.y;
        ctx.translate(offsetX, offsetY);

        // Draw Tiles
        tiles.forEach(tile => {
            const { x, y } = hexToPixel(tile.coordinates);
            drawHex(ctx, x, y, BIOME_COLORS[tile.biome]);
        });

        // Draw Hover Cursor
        if (hoveredHex) {
            const { x, y } = hexToPixel(hoveredHex);
            // Check if hovered hex is valid tile
            const id = getHexId(hoveredHex.q, hoveredHex.r);
            if (tiles.has(id)) {
                drawHex(ctx, x, y, 'rgba(255, 255, 255, 0.2)', 'white', 2);
            }
        }

        // Draw Selected Cursor
        if (selectedHex) {
            const { x, y } = hexToPixel(selectedHex);
            drawHex(ctx, x, y, 'rgba(59, 130, 246, 0.3)', '#60a5fa', 3); // blue highlight
        }

        ctx.restore();

    }, [tiles, camera, hoveredHex, selectedHex]);

    // Input Handling
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;

            setCamera(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }

        // Hover Logic
        const { x, y } = getMapCoordinates(e.clientX, e.clientY);
        const hex = pixelToHex(x, y);
        // Only update if changed to avoid too many renders? 
        // React state update checks equality, but object reference is new.
        // Let's rely on React batching or simple check.
        setHoveredHex(hex);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        setIsDragging(false);

        // Click Logic (if didn't drag much)
        // Calculate distance from lastMouseDown? 
        // For simple "click", we can just assume if not dragging. But here strictly it shares interaction.
        // Let's treat as click if dist < 5px
        // For now, simpler: just update click if dragging was short?
        // Let's separate "Click" from "Drag Stop".
        // Actually, let's use onClick event for Selection? 
        // But dragging triggers onClick usually.
    };

    const handleClick = (e: React.MouseEvent) => {
        // Prevent click if we were dragging
        // Implementation detail: track total drag distance
        const { x, y } = getMapCoordinates(e.clientX, e.clientY);
        const hex = pixelToHex(x, y);
        const id = getHexId(hex.q, hex.r);

        if (tiles.has(id)) {
            console.log("Clicked Tile:", tiles.get(id));
            setSelectedHex(hex);
        } else {
            setSelectedHex(null);
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative bg-slate-950 overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
        >
            <canvas ref={canvasRef} className="block" />

            {/* HUD Overlay */}
            <div className="absolute bottom-6 left-6 p-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl text-slate-200 pointer-events-none">
                <div className="font-bold text-xs uppercase text-slate-500 mb-1">Tile Inspector</div>
                {selectedHex ? (
                    <div>
                        <div className="text-xl font-mono text-blue-400">
                            {selectedHex.q}, {selectedHex.r}
                        </div>
                        <div className="text-sm mt-1">
                            {tiles.get(getHexId(selectedHex.q, selectedHex.r))?.biome || 'VOID'}
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-500 italic">Select a tile</div>
                )}
            </div>

            <div className="absolute bottom-6 right-6 flex gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); setCamera({ x: 0, y: 0 }); }}
                    className="bg-slate-800 text-white px-3 py-1 rounded shadow border border-slate-700 hover:bg-slate-700 pointer-events-auto"
                >
                    Recenter
                </button>
            </div>
        </div>
    );
};
