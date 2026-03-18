# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-03-18

### Added
- **Zoom-on-Hover**: New `enableZoomOnHover` prop — hold `Z` key and hover to zoom cards with 3D perspective tilt and dynamic shadows
- **`zoomScale` prop**: Configure the zoom multiplier (default `1.08`)
- **3D Perspective Tilt**: Cards tilt up to ±15° following the cursor with `perspective(800px)`
- **Dynamic Box Shadows**: Shadow shifts opposite to tilt direction for realistic depth
- **Fresh-press state machine**: Requires Z release + re-press for each zoom cycle — no accidental continuous zooming
- **Instant reset**: Cards snap back immediately on release (no animation delay)

## [2.0.2] - 2026-02-13

### Fixed
- **Container offset bug**: Virtualization visibility checks now account for the grid container's position on the page. Previously, `calculateVisibleItems` compared container-relative item positions against window-level scroll, causing incorrect rendering when content exists above the grid.

## [2.0.1] - 2026-02-12

### Fixed
- **Removed Tailwind CSS dependency**: Replaced className-based utility classes with inline styles. Users no longer need to add `.relative`, `.absolute`, and `.overflow-hidden` classes to their global CSS.

## [2.0.0] - 2026-01-18

### Added
- **Infinite Scroll**: `onEndReached` callback for pagination support
- **SSR Support**: `ssrPlaceholder` prop for loading states during hydration
- **Column Override**: `columnCount` prop to force specific column count
- **Disable Virtualization**: `disableVirtualization` prop for debugging
- **Better Performance**: GPU-accelerated transforms with `translate3d()`

### Changed
- Updated description and keywords for better npm discoverability
- Improved documentation with more examples

### Fixed
- TypeScript compatibility with React 18/19 strict mode

## [1.0.0] - Initial Release

### Features
- Virtualized masonry grid with dynamic columns
- Async `getItemSize` for unknown image dimensions
- `getImageSize` helper function
- RAF-throttled scroll handling
- Debounced resize handling
- CSS containment for layout isolation
- React.memo optimization
- Full TypeScript support
