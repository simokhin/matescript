# TypeScript Chess Engine

A UCI-compatible chess engine written from scratch in TypeScript, plus a browser UI for playing against it. Built as a learning project — both TypeScript itself and classical chess engine algorithms (search, evaluation).

## Requirements

- [Bun](https://bun.sh)

## Getting started

```sh
bun install
```

### Play in the browser

```sh
bun run dev
```

Starts a Vite dev server for the web UI (`web/`) — choose a side, time per move, and optionally a starting FEN, then play against the engine.

### Use as a UCI engine

```sh
bun run build
./myengine
```

Compiles a standalone binary implementing the [UCI protocol](https://www.chessprogramming.org/UCI), usable with any UCI-compatible GUI (Arena, cutechess, etc.) or directly via stdin/stdout.

## Scripts

| Command             | Description                                |
| ------------------- | ------------------------------------------ |
| `bun run dev`       | Web UI dev server                          |
| `bun run build`     | Compile the UCI engine binary (`myengine`) |
| `bun run build:web` | Production build of the web UI (`dist/`)   |
| `bun run preview`   | Preview the production web build           |
| `bun run test`      | Run the test suite                         |
| `bun run typecheck` | Type-check engine and web code             |
| `bun run lint`      | Run Biome checks                           |

## Project structure

```
src/            engine (runtime-agnostic — no DOM/Bun-only APIs outside index.ts)
  index.ts      UCI protocol loop (entry point for the CLI binary)
  moves/        move generation, move encoding, make/unmake
  position/     board representation, FEN parsing, Zobrist hashing
  search/       negamax + alpha-beta search, evaluation, transposition table
web/            browser UI (Vite + vanilla TypeScript, no framework)
  engineWorker.ts   hosts the engine in a Web Worker
  main.ts           DOM rendering and UI logic
```

## Engine features

- Negamax search with alpha-beta pruning and iterative deepening
- Transposition table
- Quiescence search
- Move ordering: MVV-LVA, killer moves
- Null-move pruning
- Evaluation: material, tapered piece-square tables, pawn structure (doubled/isolated/passed pawns), king safety (pawn shield)
- Threefold-repetition avoidance during search
