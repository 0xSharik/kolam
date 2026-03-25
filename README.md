# Kolam — Sacred Geometry Engine

> A digital heritage experience exploring the ancient South Indian art of **Kolam** through generative sacred geometry.

---

## ✨ Features

### 🎨 Heritage-Themed Design
- **Warm earth-tone palette** — Deep obsidian, temple gold, saffron, and ivory
- **Premium typography** — Playfair Display (headings) + Crimson Pro (body) for an elegant serif aesthetic
- **Animated Kolam loader** — Spinning dot-ring animation inspired by traditional Kolam dot grids
- **Decorative heritage borders** — Gold gradient lines and corner ornaments throughout the UI

### 🔷 Generative Kolam Engine
- **Deterministic Tiling Algorithm** — 16-tile curve DNA with strict adjacency rules, no randomness artifacts
- **Pattern sizes 3×3 to 15×15** — Scalable sacred geometry up to 225 cells
- **SVG stroke animations** — Smooth drawing animations that trace each Kolam curve
- **Export to SVG/PNG** — Download patterns for print or digital use

### 🎮 Neural Recovery Game (`/game`)
- **Pattern reconstruction puzzle** — Identify and fix corrupted cells in a Kolam grid
- **16-tile DNA Toolbox** — Select the correct curve primitive to restore geometric integrity
- **Progressive difficulty** — 3×3, 5×5, and 7×7 grid sizes
- **Live validation** — Real-time feedback showing corrupted, selected, and fixed cell states

### 🔍 Image Analyzer (`/analyze`)
- **Upload Kolam images** for pattern analysis
- API-powered geometric feature extraction

### 🔄 Continuous Mode (`/continuous`)
- Endless pattern generation mode

---

## 🛠 Tech Stack

| Layer       | Technology                                         |
|-------------|-----------------------------------------------------|
| Framework   | Next.js 15 (App Router) + React 19                 |
| Language    | TypeScript                                          |
| Styling     | Tailwind CSS 4 + Custom Heritage CSS                |
| Typography  | Playfair Display, Crimson Pro, Space Grotesk        |
| Graphics    | SVG with CSS `stroke-dash` animations               |
| API         | Next.js API Routes (pattern analysis)               |

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/0xSharik/kolam.git
cd headache

# Install dependencies
pnpm install

# Start dev server (port 3000)
pnpm dev
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage — Kolam Generator Studio
│   ├── game/page.tsx         # Neural Recovery Game
│   ├── analyze/page.tsx      # Image Analyzer
│   ├── continuous/page.tsx   # Continuous Generation Mode
│   ├── api/analyze-kolam/    # Pattern analysis API
│   ├── layout.tsx            # Root layout (fonts, metadata)
│   └── globals.css           # Heritage design system
├── components/
│   ├── KolamEditor.tsx       # Main studio interface
│   ├── KolamDisplay.tsx      # SVG pattern renderer
│   ├── NeuralRecovery.tsx    # Game mode component
│   ├── HeritageLoader.tsx    # Animated Kolam-dot loader
│   ├── ImageAnalyzer.tsx     # Upload + analysis UI
│   ├── Header.tsx            # Heritage-themed header
│   └── Footer.tsx            # Footer component
├── utils/
│   ├── kolamGenerator.ts     # Deterministic tiling engine
│   ├── kolamExporter.ts      # SVG/PNG export
│   ├── svgPathGenerator.ts   # Curve-to-path conversion
│   └── urlParams.ts          # URL state management
├── data/
│   └── kolamPatterns.ts      # 16-tile curve definitions
└── types/
    └── kolam.ts              # TypeScript interfaces
```

---

## ⚙️ The Geometric Engine

The generator uses **Tiling Theory** principles:

- **16-Tile DNA** — Every pattern is composed of 16 fundamental curve primitives
- **Mate System** — Adjacency tables (`mate_pt_dn`, `mate_pt_rt`) ensure line continuity across cell boundaries
- **Symmetry Inversion** — Horizontal/vertical matrices (`h_inv`, `v_inv`) unfold seed quadrants into full symmetrical patterns

---

## 🎨 Design System

The heritage theme uses a curated warm palette:

| Token           | Value       | Usage                    |
|-----------------|-------------|--------------------------|
| `--background`  | `#0D0906`   | Deep obsidian base       |
| `--ivory`       | `#F5EFE6`   | Primary text             |
| `--gold`        | `#C9A227`   | Accent, borders, labels  |
| `--saffron`     | `#E07020`   | Secondary accent         |
| `--temple-red`  | `#8B1A1A`   | Alerts, game CTA         |
| `--surface`     | `#151210`   | Card backgrounds         |

---

## 📜 License & Heritage

This project is a digital tribute to the South Indian art of Kolam — sacred geometric patterns drawn at the threshold of homes at dawn.

© 2026 Kolam Heritage Project
