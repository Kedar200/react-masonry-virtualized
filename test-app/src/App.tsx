import { useRef, useState } from "react";
import { MasonryGrid, MasonryGridRef } from "react-masonry-virtualized";

const images = Array.from({ length: 60 }, (_, i) => {
  const widths = [400, 500, 600];
  const heights = [300, 400, 500, 600, 700, 800];
  const w = widths[i % widths.length];
  const h = heights[i % heights.length];
  return {
    id: i,
    src: `https://picsum.photos/seed/${i + 10}/${w}/${h}`,
    width: w,
    height: h,
  };
});

const BADGE = (label: string, color: string) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 99,
      background: color,
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.5,
      textTransform: "uppercase" as const,
    }}
  >
    {label}
  </span>
);

// ─── Tab 1: default window scroll ───────────────────────────────────────────
function WindowScrollTest() {
  const gridRef = useRef<MasonryGridRef>(null);
  return (
    <div style={{ padding: "24px 0" }}>
      <div style={infoBox}>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>
          Default behaviour — scroll events come from <code style={code}>window</code>.
          Virtualization, infinite scroll, and <code style={code}>scrollToIndex</code> all use
          <code style={code}>window.scrollY</code>.
        </p>
        <button
          style={btn}
          onClick={() => gridRef.current?.scrollToIndex(40, { behavior: "smooth", offset: 80 })}
        >
          scrollToIndex(40)
        </button>
      </div>

      <MasonryGrid
        ref={gridRef}
        items={images}
        renderItem={(item) => (
          <img
            src={item.src}
            alt={`Image ${item.id}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 8 }}
          />
        )}
        getItemSize={(item) => Promise.resolve({ width: item.width, height: item.height })}
        gap={12}
        enableZoomOnHover
        zoomScale={1.4}
      />
    </div>
  );
}

// ─── Tab 2: scrollContainer (custom div) ────────────────────────────────────
function CustomContainerTest() {
  const gridRef = useRef<MasonryGridRef>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={infoBox}>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>
          Custom container — the <code style={code}>&lt;div&gt;</code> below has{" "}
          <code style={code}>overflow-y: scroll; height: 70vh</code>.
          The grid is passed <code style={code}>scrollContainer={"{scrollRef}"}</code> so
          virtualization, infinite scroll, and <code style={code}>scrollToIndex</code> all use
          the <em>element's</em> <code style={code}>scrollTop</code> instead of{" "}
          <code style={code}>window</code>.
        </p>
        <button
          style={btn}
          onClick={() => gridRef.current?.scrollToIndex(40, { behavior: "smooth", offset: 40 })}
        >
          scrollToIndex(40)
        </button>
      </div>

      {/* The custom scrollable container */}
      <div
        ref={scrollRef}
        style={{
          height: "70vh",
          overflowY: "scroll",
          border: "2px solid #4f46e5",
          borderRadius: 12,
          padding: "12px",
          background: "#0f0f1a",
        }}
      >
        <MasonryGrid
          ref={gridRef}
          items={images}
          renderItem={(item) => (
            <img
              src={item.src}
              alt={`Image ${item.id}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: 8 }}
            />
          )}
          getItemSize={(item) => Promise.resolve({ width: item.width, height: item.height })}
          gap={12}
          scrollContainer={scrollRef}
          enableZoomOnHover
          zoomScale={1.4}
        />
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<"window" | "custom">("window");

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, padding: "20px 24px", background: "#1a1a2e", borderRadius: 16, color: "#e0e0e0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: 22, background: "linear-gradient(90deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            scrollContainer Test — react-masonry-virtualized v2.3.0
          </h1>
          {BADGE("new in 2.3.0", "#6d28d9")}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "#6b7280" }}>
          Switch tabs to compare <strong style={{ color: "#a78bfa" }}>window scroll</strong> (default) vs{" "}
          <strong style={{ color: "#818cf8" }}>custom container scroll</strong>. Hold{" "}
          <kbd style={{ background: "#374151", padding: "1px 6px", borderRadius: 4, border: "1px solid #4b5563", fontSize: 12 }}>Z</kbd>{" "}
          + hover any card to zoom. Use the button to test <code style={{ ...code, color: "#c4b5fd" }}>scrollToIndex</code>.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <TabButton active={tab === "window"} onClick={() => setTab("window")}>
          🌐 window scroll (default)
        </TabButton>
        <TabButton active={tab === "custom"} onClick={() => setTab("custom")}>
          📦 scrollContainer (custom div)
        </TabButton>
      </div>

      {tab === "window" ? <WindowScrollTest /> : <CustomContainerTest />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        background: active ? "#4f46e5" : "#1f2937",
        color: active ? "#fff" : "#9ca3af",
        border: `2px solid ${active ? "#6d28d9" : "#374151"}`,
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: 14,
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

// Shared styles
const infoBox: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 10,
  padding: "14px 18px",
  marginBottom: 16,
};

const btn: React.CSSProperties = {
  flexShrink: 0,
  padding: "9px 18px",
  background: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
  whiteSpace: "nowrap",
};

const code: React.CSSProperties = {
  fontFamily: "monospace",
  background: "#1f2937",
  padding: "1px 5px",
  borderRadius: 4,
  fontSize: "0.9em",
};
