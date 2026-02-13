"use client";

import { useState, useEffect, useCallback, useRef, Suspense, lazy } from "react";
import { generateTestData, testImages } from "./data/images";
import { FPSCounter, getMemoryUsage } from "./utils/metrics";

// Lazy load grid components
const ReactMasonryVirtualizedGrid = lazy(() => import("./grids/ReactMasonryVirtualized"));
const MasonicGrid = lazy(() => import("./grids/MasonicGrid"));
const ReactVirtualizedGrid = lazy(() => import("./grids/ReactVirtualizedGrid"));
const TanstackGrid = lazy(() => import("./grids/TanstackGrid"));

type LibraryType = "react-masonry-virtualized" | "masonic" | "react-virtualized" | "tanstack";

interface LibraryInfo {
  id: LibraryType;
  name: string;
  description: string;
  color: string;
}

const libraries: LibraryInfo[] = [
  {
    id: "react-masonry-virtualized",
    name: "react-masonry-virtualized",
    description: "Your library - virtualized masonry with RAF throttling",
    color: "bg-gradient-to-r from-violet-500 to-purple-500",
  },
  {
    id: "masonic",
    name: "masonic",
    description: "High-performance virtualized masonry (react-window inspired)",
    color: "bg-gradient-to-r from-blue-500 to-cyan-500",
  },
  {
    id: "react-virtualized",
    name: "react-virtualized",
    description: "Established library with Masonry component",
    color: "bg-gradient-to-r from-orange-500 to-amber-500",
  },
  {
    id: "tanstack",
    name: "@tanstack/react-virtual",
    description: "Modern virtualization with custom masonry",
    color: "bg-gradient-to-r from-emerald-500 to-green-500",
  },
];

interface BenchmarkResult {
  library: LibraryType;
  avgFps: number;
  minFps: number;
  renderCount: number;
  memoryMB: number;
}

export default function BenchmarkPage() {
  const [selectedLibrary, setSelectedLibrary] = useState<LibraryType>("react-masonry-virtualized");
  const [itemCount, setItemCount] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const [minFps, setMinFps] = useState(999);
  const [memoryMB, setMemoryMB] = useState(0);
  const [renderCount, setRenderCount] = useState(0);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  
  const fpsCounterRef = useRef<FPSCounter | null>(null);
  const renderCountRef = useRef(0);

  const images = generateTestData(itemCount);

  // Start FPS monitoring
  useEffect(() => {
    fpsCounterRef.current = new FPSCounter((currentFps, currentAvgFps) => {
      setFps(currentFps);
      setAvgFps(currentAvgFps);
      if (currentFps > 0) {
        setMinFps((prev) => Math.min(prev, currentFps));
      }
    });
    fpsCounterRef.current.start();

    // Memory monitoring
    const memoryInterval = setInterval(() => {
      setMemoryMB(getMemoryUsage());
    }, 1000);

    return () => {
      fpsCounterRef.current?.stop();
      clearInterval(memoryInterval);
    };
  }, []);

  // Reset render count when library changes
  useEffect(() => {
    renderCountRef.current = 0;
    setRenderCount(0);
    setMinFps(999);
  }, [selectedLibrary, itemCount]);

  const handleRender = useCallback(() => {
    renderCountRef.current++;
    setRenderCount(renderCountRef.current);
  }, []);

  const saveResult = useCallback(() => {
    const newResult: BenchmarkResult = {
      library: selectedLibrary,
      avgFps,
      minFps,
      renderCount: renderCountRef.current,
      memoryMB,
    };

    setResults((prev) => {
      const filtered = prev.filter((r) => r.library !== selectedLibrary);
      return [...filtered, newResult];
    });
  }, [selectedLibrary, avgFps, fps, memoryMB]);

  const renderGrid = () => {
    const gridProps = { images, onRender: handleRender };

    switch (selectedLibrary) {
      case "react-masonry-virtualized":
        return <ReactMasonryVirtualizedGrid {...gridProps} />;
      case "masonic":
        return <MasonicGrid {...gridProps} />;
      case "react-virtualized":
        return <ReactVirtualizedGrid {...gridProps} />;
      case "tanstack":
        return <TanstackGrid {...gridProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Masonry Grid Benchmark
              </h1>
              <p className="text-sm text-gray-400">
                Compare performance of different virtualized masonry libraries
              </p>
            </div>

            {/* Item Count Control */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400">Items:</label>
              <select
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>

              <button
                onClick={saveResult}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
              >
                Save Result
              </button>
            </div>
          </div>

          {/* Library Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {libraries.map((lib) => (
              <button
                key={lib.id}
                onClick={() => setSelectedLibrary(lib.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedLibrary === lib.id
                    ? `${lib.color} text-white shadow-lg`
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {lib.name}
              </button>
            ))}
          </div>

          {/* Metrics Panel */}
          <div className="grid grid-cols-5 gap-4 mt-4">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wider">FPS</div>
              <div className={`text-2xl font-bold ${fps >= 55 ? "text-green-400" : fps >= 30 ? "text-yellow-400" : "text-red-400"}`}>
                {fps}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Avg FPS</div>
              <div className={`text-2xl font-bold ${avgFps >= 55 ? "text-green-400" : avgFps >= 30 ? "text-yellow-400" : "text-red-400"}`}>
                {avgFps}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Min FPS</div>
              <div className={`text-2xl font-bold ${minFps >= 55 ? "text-green-400" : minFps >= 30 ? "text-yellow-400" : "text-red-400"}`}>
                {minFps < 999 ? minFps : "—"}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Memory</div>
              <div className="text-2xl font-bold text-blue-400">
                {memoryMB > 0 ? `${memoryMB} MB` : "N/A"}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Renders</div>
              <div className="text-2xl font-bold text-purple-400">
                {renderCount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Results Table */}
          {results.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="py-2 px-3">Library</th>
                    <th className="py-2 px-3">Avg FPS</th>
                    <th className="py-2 px-3">Min FPS</th>
                    <th className="py-2 px-3">Renders</th>
                    <th className="py-2 px-3">Memory</th>
                  </tr>
                </thead>
                <tbody>
                  {results
                    .sort((a, b) => b.avgFps - a.avgFps)
                    .map((result, i) => (
                      <tr key={result.library} className="border-b border-gray-800">
                        <td className="py-2 px-3 font-medium">
                          {i === 0 && <span className="text-yellow-400 mr-2">🏆</span>}
                          {result.library}
                        </td>
                        <td className={`py-2 px-3 ${result.avgFps >= 55 ? "text-green-400" : result.avgFps >= 30 ? "text-yellow-400" : "text-red-400"}`}>
                          {result.avgFps}
                        </td>
                        <td className="py-2 px-3">{result.minFps}</td>
                        <td className="py-2 px-3">{result.renderCount.toLocaleString()}</td>
                        <td className="py-2 px-3">{result.memoryMB > 0 ? `${result.memoryMB} MB` : "N/A"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="font-medium text-gray-200">
            {libraries.find((l) => l.id === selectedLibrary)?.name}
          </h3>
          <p className="text-sm text-gray-400">
            {libraries.find((l) => l.id === selectedLibrary)?.description}
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
            </div>
          }
        >
          {renderGrid()}
        </Suspense>
      </div>
    </div>
  );
}
