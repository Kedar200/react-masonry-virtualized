# Changelog

All notable changes to this project will be documented in this file.

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
