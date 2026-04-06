# react-masonry-virtualized

A high-performance, virtualized masonry grid component for React with dynamic column layout, lazy loading, and interactive 3D zoom effects.

## Features

- 🚀 **High Performance**: Virtual scrolling renders only visible items
- 📱 **Responsive**: Automatically adjusts columns based on container width
- 🎨 **Flexible**: Works with any content type (images, cards, etc.)
- 💪 **TypeScript**: Full type safety and IntelliSense support
- ⚡ **Optimized**: Uses RAF, memoization, and CSS containment
- 🎯 **Zero Dependencies**: Only peer dependencies on React
- 📦 **Lightweight**: < 7KB minified
- ♾️ **Infinite Scroll**: Built-in `onEndReached` callback
- 🖥️ **SSR Ready**: Placeholder support for hydration
- 🦴 **Skeleton Loading**: Pixel-perfect skeleton cards auto-sized to actual column widths
- 🔍 **Zoom-on-Hover**: Hold `Z` + hover for 3D perspective tilt with dynamic shadows
- 🎯 **Programmatic Scroll**: Scroll to any item by index using `scrollToIndex` via `ref`
- 🪟 **Custom Scroller**: Drop-in support for OverlayScrollbars, SimpleBar, Lenis, and any custom scroll container

## Installation

```bash
npm install react-masonry-virtualized
```

```bash
yarn add react-masonry-virtualized
```

```bash
pnpm add react-masonry-virtualized
```

## Usage

### Basic Example with Images

```tsx
import { MasonryGrid, getImageSize } from 'react-masonry-virtualized';

const images = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  // ... more images
];

function App() {
  return (
    <MasonryGrid
      items={images}
      renderItem={(src, index) => (
        <img
          src={src}
          alt={`Image ${index}`}
          loading="lazy"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      )}
      getItemSize={async (src) => await getImageSize(src)}
      gap={16}
      minWidth={280}
    />
  );
}
```

### Infinite Scroll Example

```tsx
import { MasonryGrid, getImageSize } from 'react-masonry-virtualized';

function App() {
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    const newImages = await fetchMoreImages();
    setImages(prev => [...prev, ...newImages]);
    setLoading(false);
  };

  return (
    <MasonryGrid
      items={images}
      renderItem={(src, index) => (
        <img src={src} alt={`Image ${index}`} loading="lazy" />
      )}
      getItemSize={async (src) => await getImageSize(src)}
      onEndReached={loadMore}
      onEndReachedThreshold={500}
    />
  );
}
```

### Pre-computed Dimensions (Faster)

If you already know item dimensions, return them immediately for better performance:

```tsx
<MasonryGrid
  items={posts}
  renderItem={(post) => <PostCard post={post} />}
  getItemSize={(post) => Promise.resolve({ 
    width: post.width, 
    height: post.height 
  })}
/>
```

### SSR with Loading Placeholder

```tsx
<MasonryGrid
  items={images}
  renderItem={(src) => <img src={src} />}
  getItemSize={async (src) => await getImageSize(src)}
  ssrPlaceholder={
    <div className="grid grid-cols-3 gap-4">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  }
/>
```

### Loading Skeleton (Pixel-Perfect Alignment)

Pass a single card template via `loadingPlaceholder` and the library renders it
in the **exact same columns** as the real grid — you get perfectly-aligned
skeletons without duplicating any layout logic yourself.

```tsx
function SkeletonCard() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 16,
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }}
    />
  );
}

function App() {
  const [pins, setPins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <MasonryGrid
      items={pins}
      renderItem={(pin) => <PinCard pin={pin} />}
      getItemSize={(pin) => Promise.resolve({ width: pin.w, height: pin.h })}
      // Library handles layout — skeletons match the real columns & widths
      loadingPlaceholder={<SkeletonCard />}
      skeletonCount={12}          // how many cards to show (default: 12)
      skeletonAspectRatio={1.3}   // card height / width ratio (default: 1.3)
    />
  );
}
```

> **Note**: `loadingPlaceholder` is active while `getItemSize` is resolving.
> Once dimensions are loaded the real grid replaces it.
> For SSR hydration use `ssrPlaceholder` as before.

### Zoom-on-Hover (3D Tilt)

Hold the `Z` key and hover over any card to zoom it with a 3D perspective tilt and dynamic shadow. Cards tilt toward your cursor with realistic depth.

```tsx
<MasonryGrid
  items={images}
  renderItem={(src) => <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
  getItemSize={async (src) => await getImageSize(src)}
  enableZoomOnHover        // Enable the feature
  zoomScale={1.1}          // 10% larger on zoom (default: 1.08)
/>
```

**How it works:**
1. Press and hold `Z` → hover a card → card scales up with smooth animation
2. Move mouse → card tilts in 3D (±15°) with shadow shifting opposite to the tilt
3. Release `Z` or leave the card → instantly snaps back (no animation)
4. Must release and re-press `Z` for each zoom cycle — prevents accidental continuous zooming

### Programmatic Scrolling

You can scroll to a specific item by index using the `scrollToIndex` method via a React `ref`.

```tsx
import { useRef } from 'react';
import { MasonryGrid, MasonryGridRef } from 'react-masonry-virtualized';

function App() {
  const gridRef = useRef<MasonryGridRef>(null);

  const handleScroll = () => {
    // Scroll to item at index 50
    gridRef.current?.scrollToIndex(50, { 
      behavior: 'smooth', 
      offset: 20 
    });
  };

  return (
    <>
      <button onClick={handleScroll}>Scroll to 50</button>
      <MasonryGrid ref={gridRef} items={items} ... />
    </>
  );
}
```

### Custom Scroll Container (OverlayScrollbars, SimpleBar, Lenis, …)

By default the grid listens for scroll events on `window`. Wrap the grid inside
any custom scroller and pass its scrollable viewport element via `scrollContainer`
to keep virtualization, infinite scroll, and `scrollToIndex` working correctly.

#### With OverlayScrollbars

```tsx
import { useRef } from 'react';
import { useOverlayScrollbars } from 'overlayscrollbars-react';
import 'overlayscrollbars/overlayscrollbars.css';
import { MasonryGrid } from 'react-masonry-virtualized';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialize, getInstance] = useOverlayScrollbars({
    options: { scrollbars: { autoHide: 'scroll' } },
  });

  // initialize OverlayScrollbars on the wrapper div
  useEffect(() => {
    if (containerRef.current) initialize(containerRef.current);
  }, [initialize]);

  // get the inner viewport element that actually scrolls
  const viewport = getInstance()?.elements().viewport;

  return (
    <div ref={containerRef} style={{ height: '100vh' }}>
      <MasonryGrid
        items={items}
        renderItem={(item) => <Card item={item} />}
        getItemSize={(item) => Promise.resolve({ width: item.w, height: item.h })}
        scrollContainer={viewport}
      />
    </div>
  );
}
```

#### With a plain scrollable div (or any other library)

```tsx
import { useRef } from 'react';
import { MasonryGrid } from 'react-masonry-virtualized';

function App() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      <MasonryGrid
        items={items}
        renderItem={(item) => <Card item={item} />}
        getItemSize={(item) => Promise.resolve({ width: item.w, height: item.h })}
        scrollContainer={scrollRef}   // pass the ref directly
      />
    </div>
  );
}
```

> **Note**: The scroll container element must have `overflow: auto` or `overflow-y: scroll`
> and a fixed height. The `MasonryGrid` itself should **not** have a fixed height when using
> a custom container — let it grow naturally inside the scrollable parent.

### Fixed Column Count

```tsx
<MasonryGrid
  items={images}
  columnCount={4}  // Always 4 columns
  // ... other props
/>
```

## API

### MasonryGrid Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | **required** | Array of items to render |
| `renderItem` | `(item: T, index: number) => ReactNode` | **required** | Function to render each item |
| `getItemSize` | `(item: T, index: number) => Promise<{width, height}>` | **required** | Function to get item dimensions |
| `baseWidth` | `number` | `241` | Base width for scaling calculations |
| `minWidth` | `number` | `223` | Minimum width for each column |
| `gap` | `number` | `16` | Gap between items in pixels |
| `className` | `string` | `''` | Container class name |
| `style` | `CSSProperties` | `undefined` | Container inline styles |
| `bufferMultiplier` | `number` | `1` | Viewport buffer (1 = 1 viewport above/below) |
| `columnCount` | `number` | `undefined` | Override auto column count |
| `onEndReached` | `() => void` | `undefined` | Callback when scrolled near end |
| `onEndReachedThreshold` | `number` | `500` | Distance from end to trigger callback (px) |
| `ssrPlaceholder` | `ReactNode` | `undefined` | Placeholder during SSR/hydration (before JS runs) |
| `disableVirtualization` | `boolean` | `false` | Render all items (disables virtual scroll) |
| `loadingPlaceholder` | `ReactNode` | `undefined` | Single card template tiled in masonry columns while loading |
| `skeletonCount` | `number` | `12` | Number of skeleton cards to render |
| `skeletonAspectRatio` | `number` | `1.3` | Height/width ratio used for skeleton card sizing |
| `enableZoomOnHover` | `boolean` | `false` | Hold Z key + hover to zoom & 3D-tilt cards |
| `zoomScale` | `number` | `1.08` | Scale multiplier when zoom is active (e.g. 1.1 = 10% larger) |
| `scrollContainer` | `HTMLElement \| RefObject<HTMLElement> \| null` | `undefined` | Custom scroll container — pass an element or ref when using OverlayScrollbars, SimpleBar, Lenis, etc. |
| `ref` | `Ref<MasonryGridRef>` | `undefined` | Ref to access imperative methods |

### MasonryGridRef Methods

| Method | Arguments | Description |
|--------|-----------|-------------|
| `scrollToIndex` | `(index: number, options?: { behavior: 'smooth' \| 'auto', offset: number })` | Scrolls the grid to the item at the specified index. |

### Helper Functions

#### `getImageSize(src: string): Promise<{width, height}>`

Helper function to load image dimensions. Useful for image-based masonry grids.

```tsx
import { getImageSize } from 'react-masonry-virtualized';

const dimensions = await getImageSize('https://example.com/image.jpg');
// { width: 1920, height: 1080 }
```

## How It Works

1. **Dynamic Columns**: Calculates optimal number of columns based on container width and `minWidth`
2. **Masonry Layout**: Places items in the shortest column (Pinterest-style)
3. **Virtual Scrolling**: Only renders items visible in viewport + buffer
4. **Performance Optimization**:
   - `React.memo` prevents unnecessary re-renders
   - `useCallback` memoizes expensive calculations
   - `requestAnimationFrame` throttles scroll events
   - Debounced resize handler
   - CSS containment for layout isolation
   - GPU-accelerated transforms with `translate3d`

## Performance Tips

1. **Memoize `getItemSize`**: If dimensions don't change, cache them
2. **Use pre-computed dimensions**: Return `Promise.resolve()` for known sizes
3. **Adjust `bufferMultiplier`**: Lower values render fewer items (faster) but may show blank space while scrolling
4. **Use `loading="lazy"`**: For images, enable native lazy loading
5. **Optimize images**: Use appropriately sized images

## Performance Benchmarks

Benchmarked with 500 items, scrolling 5000px down and back up. Measured on Chrome.

| Library | Avg FPS | Min FPS | Memory |
|---------|:-------:|:-------:|:------:|
| 🏆 **react-masonry-virtualized** | **60** | **59** | 54 MB |
| masonic | 60 | 57 | 48 MB |
| react-virtualized | 60 | 54 | 70 MB |
| @tanstack/react-virtual | 59 | 56 | 49 MB |

**Bundle size**: 6.5 KB minified · **2 KB gzipped** · Zero dependencies

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Credits

Built with ❤️ using React, TypeScript, and tsup.
<img width="835" height="507" alt="image" src="https://github.com/user-attachments/assets/f5b09383-bc33-4994-a074-75e1f8b03c53" />
