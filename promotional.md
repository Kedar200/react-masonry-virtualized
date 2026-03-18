# 🔍 react-masonry-virtualized v2.1.0 — Now with 3D Zoom-on-Hover

**The fastest React masonry grid just got a killer new interaction.**

---

## What's New

### Hold Z + Hover = 🤯

Your masonry grid cards now come alive with a cinema-grade zoom interaction:

1. **Press Z** → hover any card → it **scales up** with a smooth animation
2. **Move your mouse** → the card **tilts in 3D** following your cursor (±15° perspective)
3. **Dynamic shadows** shift opposite to the tilt — creating real depth
4. **Release** → instant snap-back, zero delay
5. **Smart state machine** — requires a fresh Z press for each zoom cycle, no accidental triggering

### Two lines to enable

```tsx
<MasonryGrid
  items={images}
  renderItem={(img) => <img src={img.src} />}
  getItemSize={(img) => Promise.resolve({ width: img.w, height: img.h })}
  enableZoomOnHover   // ← that's it
  zoomScale={1.1}     // ← optional, default 1.08
/>
```

---

## Why This Matters

Most masonry libraries give you a static wall of content. **react-masonry-virtualized** makes your grid feel alive:

| Feature | Others | react-masonry-virtualized |
|---------|:------:|:-------------------------:|
| Virtual scrolling | ✅ | ✅ |
| Responsive columns | ✅ | ✅ |
| Infinite scroll | Some | ✅ Built-in |
| SSR support | Rare | ✅ |
| Skeleton loading | ❌ | ✅ Pixel-perfect |
| **3D Zoom-on-Hover** | **❌** | **✅ NEW** |
| Zero dependencies | Some | ✅ |
| Bundle size | 10-30KB | **< 7KB** |

---

## The Technical Details

Under the hood, the zoom uses a **two-layer transform architecture**:

- **Outer layer**: `translate3d` + `scale` with `transformOrigin: top left` — handles masonry positioning
- **Inner layer**: `perspective(800px)` + `rotateX/Y` with `transformOrigin: center` — handles 3D tilt

This separation ensures the tilt pivots from the card's center while keeping layout transforms pixel-perfect. The shadow dynamically shifts up to 20px opposite the tilt direction with 30px gaussian blur.

**Performance**: Zero layout thrashing. All transforms are GPU-composited. The keyboard state is tracked via a single global listener using refs — no per-card re-renders from key events.

---

## Quick Stats

- **Bundle**: 7KB min · **2KB gzip** · Zero deps
- **FPS**: Locked 60 FPS with 500+ items
- **Compat**: React 18 & 19, SSR/Next.js ready
- **TypeScript**: Full type safety, exported types

---

## Install

```bash
npm install react-masonry-virtualized@latest
```

---

## Try It

```bash
git clone https://github.com/kedar200/react-masonry-virtualized
cd react-masonry-virtualized/test-app
npm install && npm run dev
```

Open `http://localhost:5173`, hold `Z`, and hover the cards. You'll see it. 🚀

---

## Links

- [GitHub](https://github.com/kedar200/react-masonry-virtualized)
- [npm](https://www.npmjs.com/package/react-masonry-virtualized)
- [Changelog](https://github.com/kedar200/react-masonry-virtualized/blob/main/CHANGELOG.md)

---

*Built with ❤️ by [@kedar200](https://github.com/kedar200)*
