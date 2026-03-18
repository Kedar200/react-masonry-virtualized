import { MasonryGrid, getImageSize } from "react-masonry-virtualized";

// Sample images from picsum.photos with varied aspect ratios
const images = Array.from({ length: 30 }, (_, i) => {
  const widths = [400, 500, 600];
  const heights = [300, 400, 500, 600, 700, 800];
  const w = widths[i % widths.length];
  const h = heights[i % heights.length];
  return {
    id: i,
    src: `https://picsum.photos/seed/${i + 1}/${w}/${h}`,
    width: w,
    height: h,
  };
});

export default function App() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          marginBottom: 24,
          padding: "16px 20px",
          background: "#1a1a2e",
          borderRadius: 12,
          color: "#e0e0e0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            background: "linear-gradient(90deg, #a78bfa, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🔍 Z-Key Hover Zoom Test
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#9ca3af" }}>
          <strong>How to test:</strong> Press and hold the <kbd style={{
            background: "#374151",
            padding: "2px 8px",
            borderRadius: 4,
            border: "1px solid #4b5563",
            fontSize: 13,
          }}>Z</kbd> key, then hover over any card to zoom it.
          Release Z or move away to reset. You must release &amp; re-press Z for each new zoom.
        </p>
      </div>

      <MasonryGrid
        items={images}
        renderItem={(item) => (
          <img
            src={item.src}
            alt={`Image ${item.id}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: 8,
            }}
          />
        )}
        getItemSize={(item) =>
          Promise.resolve({ width: item.width, height: item.height })
        }
        gap={12}
        enableZoomOnHover
        zoomScale={1.5}
      />
    </div>
  );
}
