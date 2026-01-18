# react-masonry-virtualized

A high-performance, virtualized masonry grid component for React with dynamic column layout and lazy loading.

## Features

- 🚀 **High Performance**: Virtual scrolling renders only visible items
- 📱 **Responsive**: Automatically adjusts columns based on container width
- 🎨 **Flexible**: Works with any content type (images, cards, etc.)
- 💪 **TypeScript**: Full type safety and IntelliSense support
- ⚡ **Optimized**: Uses RAF, memoization, and CSS containment
- 🎯 **Zero Dependencies**: Only peer dependencies on React
- 📦 **Lightweight**: < 6KB minified
- ♾️ **Infinite Scroll**: Built-in `onEndReached` callback
- 🖥️ **SSR Ready**: Placeholder support for hydration

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
| `ssrPlaceholder` | `ReactNode` | `undefined` | Placeholder during SSR/loading |
| `disableVirtualization` | `boolean` | `false` | Render all items (disables virtual scroll) |

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
