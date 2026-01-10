import {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
  ReactNode,
  CSSProperties,
} from "react";

export interface MasonryGridProps<T> {
  /** Array of items to render */
  items: T[];
  /** Function to render each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Function to get dimensions of each item (width, height) */
  getItemSize: (item: T, index: number) => Promise<{ width: number; height: number }>;
  /** Base width for scaling (default: 241) */
  baseWidth?: number;
  /** Minimum width for each column (default: 223) */
  minWidth?: number;
  /** Gap between items in pixels (default: 16) */
  gap?: number;
  /** Container class name */
  className?: string;
  /** Container style */
  style?: CSSProperties;
  /** Buffer multiplier for viewport (default: 1 = 1 viewport above/below) */
  bufferMultiplier?: number;
}

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

// Memoized item wrapper component
const MasonryItem = memo(
  ({
    children,
    pos,
  }: {
    children: ReactNode;
    pos: Position;
  }) => (
    <div
      className="absolute overflow-hidden"
      style={{
        width: pos.width,
        height: pos.height,
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`,
        transformOrigin: "top left",
        willChange: "transform",
        contain: "layout style paint",
      }}
    >
      {children}
    </div>
  )
);

MasonryItem.displayName = "MasonryItem";

export function MasonryGrid<T>({
  items,
  renderItem,
  getItemSize,
  baseWidth = 241,
  minWidth = 223,
  gap = 16,
  className = "",
  style,
  bufferMultiplier = 1,
}: MasonryGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  const [positions, setPositions] = useState<Position[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [itemDimensions, setItemDimensions] = useState<
    Array<{ width: number; height: number }>
  >([]);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);

  // Load item dimensions
  useEffect(() => {
    const loadDimensions = async () => {
      const dims = await Promise.all(
        items.map((item, index) => getItemSize(item, index))
      );
      setItemDimensions(dims);
    };
    loadDimensions();
  }, [items, getItemSize]);

  // Memoized layout calculation
  const calculateLayout = useCallback(() => {
    if (!containerRef.current || itemDimensions.length === 0) return;

    const containerWidth = containerRef.current.offsetWidth;
    const numCols = Math.max(2, Math.floor(containerWidth / (minWidth + gap)));
    const totalGapWidth = gap * (numCols - 1);
    const cardWidth = (containerWidth - totalGapWidth) / numCols;
    const scale = cardWidth / baseWidth;

    const columnHeights = new Array(numCols).fill(0);
    const newPositions: Position[] = [];

    items.forEach((_, index) => {
      const dim = itemDimensions[index];
      if (!dim) return;

      const aspectRatio = dim.height / dim.width;
      const height = cardWidth * aspectRatio;
      const minColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      const x = minColumnIndex * (cardWidth + gap);
      const y = columnHeights[minColumnIndex];

      newPositions.push({
        x,
        y,
        width: baseWidth,
        height: baseWidth * aspectRatio,
        scale,
      });

      columnHeights[minColumnIndex] += height + gap;
    });

    setPositions(newPositions);
    setContainerHeight(Math.max(...columnHeights));
  }, [itemDimensions, items, baseWidth, minWidth, gap]);

  // Layout effect with debounced resize
  useEffect(() => {
    calculateLayout();

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(calculateLayout, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [calculateLayout]);

  // Memoized visible items calculation
  const calculateVisibleItems = useCallback(() => {
    if (positions.length === 0) return;

    const viewportHeight = window.innerHeight;
    const buffer = viewportHeight * bufferMultiplier;
    const visible = new Set<number>();

    positions.forEach((pos, index) => {
      const scaledHeight = pos.height * pos.scale;
      const itemTop = pos.y;
      const itemBottom = pos.y + scaledHeight;

      if (
        itemBottom >= scrollTop - buffer &&
        itemTop <= scrollTop + viewportHeight + buffer
      ) {
        visible.add(index);
      }
    });

    setVisibleIndices(visible);
  }, [positions, scrollTop, bufferMultiplier]);

  // Update visible items when scroll or positions change
  useEffect(() => {
    calculateVisibleItems();
  }, [calculateVisibleItems]);

  // Throttled scroll handler with RAF
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setScrollTop(window.scrollY);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: containerHeight,
        ...style,
      }}
    >
      {items.map((item, index) => {
        const pos = positions[index];
        if (!pos || !visibleIndices.has(index)) return null;

        return (
          <MasonryItem key={index} pos={pos}>
            {renderItem(item, index)}
          </MasonryItem>
        );
      })}
    </div>
  );
}
