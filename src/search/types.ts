import type { Move } from "../types";

export type SearchState = {
  deadline: number;
  nodes: number;
};

export type MaxDepth = { name: "maxDepth"; depth: number };
export type TimeLimitMs = { name: "timeLimit"; limit: number };
export type SearchParameters = MaxDepth | TimeLimitMs;

export type SearchResult = {
  bestMove: Move | undefined;
  nodes: number;
  depth: number;
  score: number;
};
