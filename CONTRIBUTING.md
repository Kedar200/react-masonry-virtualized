# Contributing to react-masonry-virtualized

Thank you for your interest in contributing! 🎉 Here's everything you need to know to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Coding Style](#coding-style)
- [Performance Considerations](#performance-considerations)

---

## Code of Conduct

Be respectful, inclusive, and constructive. Harassment of any kind will not be tolerated.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/react-masonry-virtualized.git
cd react-masonry-virtualized
npm install
```

---

## Development Workflow

### 1. Build the library in watch mode

```bash
npm run dev
```

This runs `tsup` in watch mode, rebuilding `dist/` on every change.

### 2. Run the test app

The `test-app/` directory is a Next.js demo that consumes the local build.

```bash
cd test-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to preview your changes in real-time.

### 3. Build for production

```bash
npm run build
```

Outputs CJS, ESM, and TypeScript declarations to `dist/`.

---

## Project Structure

```
react-masonry-virtualized/
├── src/
│   ├── index.tsx          # Public exports
│   └── MasonryGrid.tsx    # Core component
├── test-app/              # Next.js demo / playground
├── dist/                  # Built output (git-ignored)
├── CHANGELOG.md
├── tsup.config.ts
└── package.json
```

---

## Submitting Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** and verify them in the test app.

3. **Commit** using a descriptive message:
   ```
   feat: add onVisibleRangeChange callback
   fix: correct column assignment on resize
   docs: update scrollToIndex example
   ```
   We follow [Conventional Commits](https://www.conventionalcommits.org/).

4. **Push** and open a Pull Request against `main`:
   ```bash
   git push origin feat/your-feature-name
   ```

5. In your PR description, include:
   - What the change does
   - Why it is needed
   - Any relevant performance measurements (for perf-related PRs)

---

## Reporting Bugs

Open an issue at [github.com/kedar200/react-masonry-virtualized/issues](https://github.com/kedar200/react-masonry-virtualized/issues) and include:

- **Library version**
- **React version**
- **Minimal reproduction** (CodeSandbox link preferred)
- **Expected vs actual behavior**
- **Browser & OS**

---

## Requesting Features

Open a GitHub Issue with the `enhancement` label. Describe your use case and what API you'd expect. Check existing issues first to avoid duplicates.

---

## Coding Style

- **TypeScript** — all source files must be fully typed; avoid `any`.
- **No new runtime dependencies** — this library has zero dependencies by design. If you think one is necessary, discuss it in an issue first.
- **React best practices** — use `React.memo`, `useCallback`, and `useMemo` where appropriate to avoid re-renders.
- **Naming** — prefer descriptive names over abbreviations; keep prop names consistent with the existing API table in `README.md`.

---

## Performance Considerations

This library is performance-first. When contributing new features or changes, please keep these in mind:

- **Virtual scrolling correctness** — only items within the viewport (+ buffer) should be rendered.
- **No layout thrash** — batch DOM reads before writes; use `requestAnimationFrame` for scroll/resize handlers.
- **RAF-throttled events** — scroll and resize listeners must remain throttled.
- **Bundle size** — avoid adding code that significantly increases the < 7 KB footprint. Run `npm run build` and check the output sizes.
- **Benchmarking** — for perf-sensitive PRs, run a before/after benchmark with ~500 items and report FPS/memory in your PR description.

---

## Questions?

Feel free to open a [GitHub Discussion](https://github.com/kedar200/react-masonry-virtualized/discussions) or drop a comment in an existing issue.

Happy contributing! 🚀
