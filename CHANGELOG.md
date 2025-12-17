# Changelog

## [Unreleased]

## [0.1.0] - 2025-12-17
### Added
- **Isometric Map 3D**: Implemented new isometric rendering engine (`drawHex`) with depth and biome-specific colors.
- **Building System**:
    - Added UI for selecting buildings (House, Farm, Mine, Sawmill).
    - Integrated with Redux (`mapSlice`) for persistent building placement.
    - Added "Affordability" check based on Resource store.
- **Visual Assets**:
    - Replaced procedural grass with `tile_plains.png` (High Quality Sprite).
    - Replaced procedural trees with `prop_tree.png` (3D Rendered Pine Tree).
    - Added automatic "Transparency Chroma Key" to remove white backgrounds from loaded assets.
- **Map Generation**:
    - Increased Map Size to **50x40**.
    - Replaced random noise with coherent **Perlin-like Noise** (`noise.ts`).
    - Biomes now form connected regions (Forests, Mountain Ranges, Lakes).
- **Controls**:
    - Added **Mouse Wheel Zoom** (Zoom In/Out centered on screen).
    - Added Panning (Drag to move).
    - Added Tile Inspector (Click to see coordinates).

### Fixed
- **Rendering**: Fixed "White Screen" issue by correcting Canvas sizing logic.
- **State**: Fixed Redux integration for Map Tiles (removed local state duplication).
- **Visuals**: Fixed "Floating Trees" by ensuring trees are drawn *after* the ground tile overlay.
- **Visuals**: Enhanced procedural rendering for Water (Waves), Mountains (Snow Peaks), and Hills (Dirt Mounds).
- **Visuals**: Centered Tree props on tiles for better isometric alignment (Fixed vertical offset precision).
- **Controls**: Increased Maximum Zoom Level from 3x to 4x.

### Technical
- Migrated Map State to Redux Toolkit Slice (`mapSlice.ts`).
- Added `Noise` utility class for procedural generation.
