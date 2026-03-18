import {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
  ReactNode,
  CSSProperties,
  MutableRefObject,
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
  /** Override column count (auto-calculated if not provided) */
  columnCount?: number;
  /** Callback when user scrolls near the end (for infinite scroll) */
  onEndReached?: () => void;
  /** Distance from end to trigger onEndReached (default: 500px) */
  onEndReachedThreshold?: number;
  /** Show loading skeleton during SSR/hydration */
  ssrPlaceholder?: ReactNode;
  /** Disable virtualization (render all items) */
  disableVirtualization?: boolean;
  /**
   * A single skeleton card element (e.g. `<SkeletonCard />`) that the library
   * repeats and lays out in pixel-perfect masonry columns while item dimensions
   * are being loaded. Uses the same column/width math as the real grid.
   */
  loadingPlaceholder?: ReactNode;
  /**
   * How many skeleton cards to render when `loadingPlaceholder` is set.
   * Defaults to 12.
   */
  skeletonCount?: number;
  /**
   * Aspect ratio (height / width) used for skeleton cards so they fill
   * plausible column heights before real data is available. Defaults to 1.3.
   */
  skeletonAspectRatio?: number;
  /**
   * Enable zoom-on-hover: hold Z key and hover a card to scale it up.
   * Requires a fresh Z press for each zoom cycle. Defaults to false.
   */
  enableZoomOnHover?: boolean;
  /**
   * Extra scale multiplier applied when zoom-on-hover is active.
   * Defaults to 1.08 (8% larger).
   */
  zoomScale?: number;
}

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Computes masonry positions for a fixed number of skeleton cards. */
function buildSkeletonPositions(opts: {
  containerWidth: number;
  columnCount?: number;
  minWidth: number;
  gap: number;
  baseWidth: number;
  skeletonCount: number;
  skeletonAspectRatio: number;
}): { positions: Position[]; totalHeight: number } {
  const { containerWidth, minWidth, gap, baseWidth, skeletonCount, skeletonAspectRatio } = opts;

  const numCols = opts.columnCount ?? Math.max(2, Math.floor(containerWidth / (minWidth + gap)));
  const totalGapWidth = gap * (numCols - 1);
  const cardWidth = (containerWidth - totalGapWidth) / numCols;
  const scale = cardWidth / baseWidth;
  const cardHeight = baseWidth * skeletonAspectRatio; // in base-unit space
  const scaledCardHeight = cardWidth * skeletonAspectRatio; // in pixel space

  const columnHeights = new Array(numCols).fill(0);
  const positions: Position[] = [];

  for (let i = 0; i < skeletonCount; i++) {
    const minColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    const x = minColumnIndex * (cardWidth + gap);
    const y = columnHeights[minColumnIndex];

    positions.push({ x, y, width: baseWidth, height: cardHeight, scale });
    columnHeights[minColumnIndex] += scaledCardHeight + gap;
  }

  return { positions, totalHeight: Math.max(...columnHeights) };
}

// ---------------------------------------------------------------------------
// Zoom-on-hover keyboard state
// ---------------------------------------------------------------------------
interface ZoomState {
  /** Whether the Z key is currently held AND was freshly pressed */
  isActive: boolean;
  /** Mark the current zoom cycle as consumed (requires release + re-press) */
  consume: () => void;
}

/**
 * Hook that lives in the MasonryGrid and manages global Z-key state.
 * Returns a ref so MasonryItem can read it synchronously without re-renders.
 */
function useZoomKeyboard(enabled: boolean): MutableRefObject<ZoomState> {
  const stateRef = useRef<ZoomState>({
    isActive: false,
    consume: () => {},
  });

  useEffect(() => {
    if (!enabled) {
      stateRef.current = {
        isActive: false,
        consume: () => {},
      };
      return;
    }

    let fresh = false; // true after keydown, false after keyup or consume

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "z" || e.key === "Z") {
        if (!e.repeat) {
          fresh = true;
          stateRef.current.isActive = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "z" || e.key === "Z") {
        fresh = false;
        stateRef.current.isActive = false;
      }
    };

    stateRef.current.consume = () => {
      fresh = false;
      stateRef.current.isActive = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [enabled]);

  return stateRef;
}

// ---------------------------------------------------------------------------
// Memoized item wrapper (shared by real items & skeleton items)
// ---------------------------------------------------------------------------
const MasonryItem = memo(
  ({
    children,
    pos,
  }: {
    children: ReactNode;
    pos: Position;
  }) => (
    <div
      style={{
        position: "absolute",
        overflow: "hidden",
        width: pos.width,
        height: pos.height,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${pos.scale})`,
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

// ---------------------------------------------------------------------------
// Zoomable item wrapper — used when enableZoomOnHover is true
// ---------------------------------------------------------------------------
const ZoomableMasonryItem = memo(
  ({
    children,
    pos,
    zoomRef,
    zoomScale,
  }: {
    children: ReactNode;
    pos: Position;
    zoomRef: MutableRefObject<ZoomState>;
    zoomScale: number;
  }) => {
    const [zoomed, setZoomed] = useState(false);
    const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 0, my: 0 });
    const divRef = useRef<HTMLDivElement>(null);
    const isHoveredRef = useRef(false);

    // Check zoom on key events while hovered
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.key === "z" || e.key === "Z") && !e.repeat && isHoveredRef.current) {
          // Small delay to let useZoomKeyboard update first
          requestAnimationFrame(() => {
            if (zoomRef.current.isActive && isHoveredRef.current) {
              setZoomed(true);
            }
          });
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === "z" || e.key === "Z") {
          setZoomed(false);
          setTilt({ rx: 0, ry: 0, mx: 0, my: 0 });
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [zoomRef]);

    const handleMouseEnter = useCallback(() => {
      isHoveredRef.current = true;
      if (zoomRef.current.isActive) {
        setZoomed(true);
      }
    }, [zoomRef]);

    const handleMouseLeave = useCallback(() => {
      isHoveredRef.current = false;
      setTilt({ rx: 0, ry: 0, mx: 0, my: 0 });
      if (zoomed) {
        setZoomed(false);
        zoomRef.current.consume();
      }
    }, [zoomed, zoomRef]);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!zoomed || !divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        // normalised -1 to 1 from center
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        const maxAngle = 15; // degrees
        setTilt({
          ry: nx * maxAngle,   // tilt around Y axis (left-right)
          rx: -ny * maxAngle,  // tilt around X axis (up-down, inverted)
          mx: nx,              // normalised mouse x for shadow
          my: ny,              // normalised mouse y for shadow
        });
      },
      [zoomed]
    );

    const scaledWidth = pos.width * pos.scale;
    const scaledHeight = pos.height * pos.scale;
    const effectiveScale = zoomed ? pos.scale * zoomScale : pos.scale;
    // Offset to zoom from center instead of top-left
    const dx = zoomed ? (scaledWidth - scaledWidth * zoomScale) / 2 : 0;
    const dy = zoomed ? (scaledHeight - scaledHeight * zoomScale) / 2 : 0;

    // Dynamic shadow — shifts opposite to tilt direction
    const shadowX = zoomed ? -tilt.mx * 20 : 0;
    const shadowY = zoomed ? -tilt.my * 20 : 0;
    const shadowBlur = zoomed ? 30 : 0;
    const boxShadow = zoomed
      ? `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.35)`
      : "none";

    return (
      <div
        ref={divRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          position: "absolute",
          width: pos.width,
          height: pos.height,
          transform: `translate3d(${pos.x + dx}px, ${pos.y + dy}px, 0) scale(${effectiveScale})`,
          transformOrigin: "top left",
          willChange: "transform",
          transition: zoomed ? "transform 0.2s ease-out" : "none",
          zIndex: zoomed ? 10 : undefined,
        }}
      >
        {/* Inner div handles 3D tilt from center */}
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: zoomed ? "visible" : "hidden",
            borderRadius: zoomed ? "8px" : undefined,
            transform: zoomed
              ? `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
              : "none",
            transformOrigin: "center center",
            transition: zoomed ? "transform 0.08s ease-out, box-shadow 0.08s ease-out" : "none",
            boxShadow,
            contain: zoomed ? undefined : "layout style paint",
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

ZoomableMasonryItem.displayName = "ZoomableMasonryItem";

// ---------------------------------------------------------------------------
// SkeletonGrid — renders loadingPlaceholder cards in real masonry layout
// ---------------------------------------------------------------------------
const SkeletonGrid = memo(
  ({
    loadingPlaceholder,
    skeletonCount,
    skeletonAspectRatio,
    columnCount,
    minWidth,
    gap,
    baseWidth,
    className,
    style,
  }: {
    loadingPlaceholder: ReactNode;
    skeletonCount: number;
    skeletonAspectRatio: number;
    columnCount?: number;
    minWidth: number;
    gap: number;
    baseWidth: number;
    className: string;
    style?: CSSProperties;
  }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [layout, setLayout] = useState<{
      positions: Position[];
      totalHeight: number;
    }>({ positions: [], totalHeight: 0 });

    useEffect(() => {
      const compute = () => {
        const containerWidth =
          divRef.current?.offsetWidth ?? window.innerWidth;
        setLayout(
          buildSkeletonPositions({
            containerWidth,
            columnCount,
            minWidth,
            gap,
            baseWidth,
            skeletonCount,
            skeletonAspectRatio,
          })
        );
      };

      compute();

      window.addEventListener("resize", compute);
      return () => window.removeEventListener("resize", compute);
    }, [columnCount, minWidth, gap, baseWidth, skeletonCount, skeletonAspectRatio]);

    return (
      <div
        ref={divRef}
        className={className}
        style={{
          position: "relative",
          width: "100%",
          height: layout.totalHeight,
          ...style,
        }}
      >
        {layout.positions.map((pos, i) => (
          <MasonryItem key={i} pos={pos}>
            {loadingPlaceholder}
          </MasonryItem>
        ))}
      </div>
    );
  }
);

SkeletonGrid.displayName = "SkeletonGrid";

// ---------------------------------------------------------------------------
// MasonryGrid — main export
// ---------------------------------------------------------------------------
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
  columnCount,
  onEndReached,
  onEndReachedThreshold = 500,
  ssrPlaceholder,
  disableVirtualization = false,
  loadingPlaceholder,
  skeletonCount = 12,
  skeletonAspectRatio = 1.3,
  enableZoomOnHover = false,
  zoomScale = 1.08,
}: MasonryGridProps<T>) {
  const zoomRef = useZoomKeyboard(enableZoomOnHover);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const endReachedCalledRef = useRef(false);

  const [positions, setPositions] = useState<Position[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [itemDimensions, setItemDimensions] = useState<
    Array<{ width: number; height: number }>
  >([]);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle SSR hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load item dimensions
  useEffect(() => {
    const loadDimensions = async () => {
      setIsLoading(true);
      const dims = await Promise.all(
        items.map((item, index) => getItemSize(item, index))
      );
      setItemDimensions(dims);
      setIsLoading(false);
      endReachedCalledRef.current = false; // Reset for new items
    };
    loadDimensions();
  }, [items, getItemSize]);

  // Memoized layout calculation
  const calculateLayout = useCallback(() => {
    if (!containerRef.current || itemDimensions.length === 0) return;

    const containerWidth = containerRef.current.offsetWidth;
    const numCols = columnCount ?? Math.max(2, Math.floor(containerWidth / (minWidth + gap)));
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
  }, [itemDimensions, items, baseWidth, minWidth, gap, columnCount]);

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

    // If virtualization is disabled, show all items
    if (disableVirtualization) {
      setVisibleIndices(new Set(positions.map((_, i) => i)));
      return;
    }

    const viewportHeight = window.innerHeight;
    const buffer = viewportHeight * bufferMultiplier;
    const containerOffset = containerRef.current
      ? containerRef.current.getBoundingClientRect().top + window.scrollY
      : 0;
    const relativeScrollTop = Math.max(0, scrollTop - containerOffset);
    const visible = new Set<number>();

    positions.forEach((pos, index) => {
      const scaledHeight = pos.height * pos.scale;
      const itemTop = pos.y;
      const itemBottom = pos.y + scaledHeight;

      if (
        itemBottom >= relativeScrollTop - buffer &&
        itemTop <= relativeScrollTop + viewportHeight + buffer
      ) {
        visible.add(index);
      }
    });

    setVisibleIndices(visible);

    // Check if near end for infinite scroll
    if (onEndReached && !endReachedCalledRef.current) {
      const scrollBottom = relativeScrollTop + viewportHeight;
      if (scrollBottom >= containerHeight - onEndReachedThreshold) {
        endReachedCalledRef.current = true;
        onEndReached();
      }
    }
  }, [positions, scrollTop, bufferMultiplier, disableVirtualization, onEndReached, containerHeight, onEndReachedThreshold]);

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

  // Show SSR placeholder before hydration
  if (!isHydrated && ssrPlaceholder) {
    return <>{ssrPlaceholder}</>;
  }

  // Show loading state while dimensions are being fetched
  if (isLoading) {
    if (loadingPlaceholder) {
      return (
        <SkeletonGrid
          loadingPlaceholder={loadingPlaceholder}
          skeletonCount={skeletonCount}
          skeletonAspectRatio={skeletonAspectRatio}
          columnCount={columnCount}
          minWidth={minWidth}
          gap={gap}
          baseWidth={baseWidth}
          className={className}
          style={style}
        />
      );
    }
    if (ssrPlaceholder) {
      return <>{ssrPlaceholder}</>;
    }
  }

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

        if (enableZoomOnHover) {
          return (
            <ZoomableMasonryItem key={index} pos={pos} zoomRef={zoomRef} zoomScale={zoomScale}>
              {renderItem(item, index)}
            </ZoomableMasonryItem>
          );
        }

        return (
          <MasonryItem key={index} pos={pos}>
            {renderItem(item, index)}
          </MasonryItem>
        );
      })}
    </div>
  );
}
