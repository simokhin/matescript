import type { Move } from "../types";

const HASH = 512; // MB

export const EXACT = 0;
export const LOWERBOUND = 1;
export const UPPERBOUND = 2;

const rawCount = Math.floor((HASH * 1024 * 1024) / 14);
const exponent = Math.floor(Math.log2(rawCount));
const size = 2 ** exponent;

const hashes = new Int32Array(size);
const depths = new Uint8Array(size);
const scores = new Int32Array(size);
const types = new Uint8Array(size);
const bestMoves = new Uint32Array(size);

export function storeTT(
  hash: number,
  depth: number,
  score: number,
  type: number,
  bestMove: Move,
) {
  const index = hash & (size - 1);

  hashes[index] = hash;
  depths[index] = depth;
  scores[index] = score;
  types[index] = type;
  bestMoves[index] = bestMove;
}

export function probeTT(
  hash: number,
  depth: number,
  alpha: number,
  beta: number,
) {
  const index = hash & (size - 1);

  if (hashes[index] === hash) {
    // biome-ignore lint/style/noNonNullAssertion: index is always within [0, size) via the & (size-1) mask, and all TypedArrays are created with length size
    if (depths[index]! >= depth) {
      switch (types[index]) {
        case EXACT:
          // biome-ignore lint/style/noNonNullAssertion: index is always within [0, size) via the & (size-1) mask, and all TypedArrays are created with length size
          return scores[index]!;
        case LOWERBOUND:
          // biome-ignore lint/style/noNonNullAssertion: index is always within [0, size) via the & (size-1) mask, and all TypedArrays are created with length size
          if (scores[index]! >= beta) {
            // biome-ignore lint/style/noNonNullAssertion: index is always within [0, size) via the & (size-1) mask, and all TypedArrays are created with length size
            return scores[index]!;
          }
          break;
        case UPPERBOUND:
          // biome-ignore lint/style/noNonNullAssertion: index is always within [0, size) via the & (size-1) mask, and all TypedArrays are created with length size
          if (scores[index]! <= alpha) {
            // biome-ignore lint/style/noNonNullAssertion: index is always within [0, size) via the & (size-1) mask, and all TypedArrays are created with length size
            return scores[index]!;
          }
      }
    }
  }

  return null;
}
