import { useRef, useEffect, useState } from 'react';
import { drawHex, hexToPixel, pixelToHex, getHexId, BIOME_COLORS, drawBuilding, drawUnit } from '../../lib/hexUtils';
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
    const unitsState = useSelector((state: RootState) => state.units);

    // We can rely on mapState.tiles directly now.

    const [camera, setCamera] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredHex, setHoveredHex] = useState<HexCoordinate | null>(null);
    const [selectedHex, setSelectedHex] = useState<HexCoordinate | null>(null);

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

        ctx.save();

        // Center of Screen
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Apply Zoom
        ctx.scale(zoom, zoom);

        // Apply Camera Pan
        ctx.translate(camera.x, camera.y);

        // Map Wrapping Constants
        // Map Width Pixel Calculation:
        const WRAP_WIDTH = mapState.width * 51.9615; // HEX_WIDTH
        // Map Height Pixel Calculation:
        // HEX_HEIGHT is 60. Vertical distance is 45 (0.75 * 60).
        // Total Height = height * 45 * scaleY? 
        // HEX_VERT_DIST is 0.75 * HEX_HEIGHT.
        // Isometric Y squash is 0.65.
        // So Per Row, Y advances by HEX_VERT_DIST * HEX_SCALE_Y?
        // Let's verify pixelToHex logic implicitly.
        // hexToPixel: y = HEX_SIZE * (3/2 * r) * HEX_SCALE_Y
        // 3/2 * 30 = 45. 45 * 0.65 ~ 29.25.
        // So Total Height = mapState.height * 29.25
        const WRAP_HEIGHT = mapState.height * 29.25;

        // Drawing Loop
        const sortedTiles = Object.values(mapState.tiles).sort((a, b) => {
            const aPos = hexToPixel(a.coordinates);
            const bPos = hexToPixel(b.coordinates);
            return aPos.y - bPos.y;
        });

        sortedTiles.forEach(tile => {
            const { x, y } = hexToPixel(tile.coordinates);
            const color = BIOME_COLORS[tile.biome];

            // WRAPPING LOGIC
            const camCenterX = -camera.x;
            const camCenterY = -camera.y;

            // Distance from camera center
            let distX = x - camCenterX;
            let distY = y - camCenterY;

            // Wrap distX to be within [-W/2, W/2]
            const halfW = WRAP_WIDTH / 2;
            const halfH = WRAP_HEIGHT / 2;

            // Manual Modulo X
            while (distX > halfW) { distX -= WRAP_WIDTH; }
            while (distX < -halfW) { distX += WRAP_WIDTH; }

            // Manual Modulo Y
            while (distY > halfH) { distY -= WRAP_HEIGHT; }
            while (distY < -halfH) { distY += WRAP_HEIGHT; }

            // Optimization: Cull if off screen
            if (
                Math.abs(distX) > (canvas.width / zoom / 2) + 100 ||
                Math.abs(distY) > (canvas.height / zoom / 2) + 100
            ) return;

            const drawX = camCenterX + distX;
            const drawY = camCenterY + distY;

            drawHex(ctx, drawX, drawY, color);

            // Draw Selection Highlight
            if (selectedHex && selectedHex.q === tile.coordinates.q && selectedHex.r === tile.coordinates.r) {
                drawHex(ctx, drawX, drawY, 'rgba(59, 130, 246, 0.4)', '#60a5fa', 2, true);
            }

            // Draw Building
            if (tile.building) {
                drawBuilding(ctx, drawX, drawY, tile.building);
            }
        });

        // Draw Units (Wrapped)
        unitsState.units.forEach(unit => {
            const camCenterX = -camera.x;
            const camCenterY = -camera.y;

            let distX = unit.x - camCenterX;
            let distY = unit.y - camCenterY;

            const halfW = WRAP_WIDTH / 2;
            const halfH = WRAP_HEIGHT / 2;

            while (distX > halfW) { distX -= WRAP_WIDTH; }
            while (distX < -halfW) { distX += WRAP_WIDTH; }
            while (distY > halfH) { distY -= WRAP_HEIGHT; }
            while (distY < -halfH) { distY += WRAP_HEIGHT; }

            if (
                Math.abs(distX) > (canvas.width / zoom / 2) + 50 ||
                Math.abs(distY) > (canvas.height / zoom / 2) + 50
            ) return;

            drawUnit(ctx, camCenterX + distX, camCenterY + distY, unit.type);
        });

        // Draw Hover Cursor (Wrapped Calculation needed?)
        if (hoveredHex) {
            const { x, y } = hexToPixel(hoveredHex);
            const camCenterX = -camera.x;
            const camCenterY = -camera.y;

            let distX = x - camCenterX;
            let distY = y - camCenterY;

            const halfW = WRAP_WIDTH / 2;
            const halfH = WRAP_HEIGHT / 2;

            while (distX > halfW) { distX -= WRAP_WIDTH; }
            while (distX < -halfW) { distX += WRAP_WIDTH; }
            while (distY > halfH) { distY -= WRAP_HEIGHT; }
            while (distY < -halfH) { distY += WRAP_HEIGHT; }

            // Check visibility manually to be safe, though not strictly needed for cursor logic alone
            // Draw at the wrapped position
            const drawX = camCenterX + distX;
            const drawY = camCenterY + distY;

            const id = getHexId(hoveredHex.q, hoveredHex.r);
            if (mapState.tiles[id]) {
                drawHex(ctx, drawX, drawY, 'rgba(255, 255, 255, 0.2)', 'white', 2, true);
            }
        }

        ctx.restore();

    }, [mapState, unitsState, camera, zoom, hoveredHex, selectedHex]);

    // Helpers for coordinate conversion with zoom
    const getMapCoordinates = (clientX: number, clientY: number) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };

        const screenX = clientX - rect.left - rect.width / 2;
        const screenY = clientY - rect.top - rect.height / 2;

        const x = screenX / zoom - camera.x;
        const y = screenY / zoom - camera.y;

        // X and Y are absolute world coordinates.
        // Normalize them to [0, MAP_WIDTH/HEIGHT] for logic.

        const WRAP_WIDTH = mapState.width * 51.9615;
        const WRAP_HEIGHT = mapState.height * 29.25;

        let normalizedX = x % WRAP_WIDTH;
        if (normalizedX < 0) normalizedX += WRAP_WIDTH;

        let normalizedY = y % WRAP_HEIGHT;
        if (normalizedY < 0) normalizedY += WRAP_HEIGHT;

        return { x: normalizedX, y: normalizedY };
    }

    // Input Handlers
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        setZoom(prev => Math.min(Math.max(0.6, prev + scaleAmount), 4));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const dx = (e.clientX - dragStart.x) / zoom; // Adjust drag speed by zoom? Better to drag screen pixels directly? 
            // If we simply add dx to camera, and camera is inside scale...
            // Standard approach: drag moves camera.
            // If zoomed in (zoom=2), moving mouse 100px should move camera 50px? 
            // ctx.translate implies camera is in World Units.
            // Mouse move is Screen Units.
            // So WorldDelta = ScreenDelta / Zoom.
            const dy = (e.clientY - dragStart.y) / zoom;

            setCamera(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setDragStart({ x: e.clientX, y: e.clientY });
        }

        const { x, y } = getMapCoordinates(e.clientX, e.clientY);
        setHoveredHex(pixelToHex(x, y));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleClick = (e: React.MouseEvent) => {
        // Simple click detection (if not dragging) works because react events are synthesized.
        // We might want to lock click if drag distance was large, but for now standard click is fine.
        // Prevent click if it was a drag (optional optimization, but keeps it simple)
        const { x, y } = getMapCoordinates(e.clientX, e.clientY);

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
                onWheel={handleWheel}
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
