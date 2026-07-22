import type { Delta } from "../types";

const kingDeltas: Delta[] = [
  { deltaRow: 1, deltaCol: 0 },
  { deltaRow: -1, deltaCol: 0 },
  { deltaRow: 0, deltaCol: 1 },
  { deltaRow: 0, deltaCol: -1 },
  { deltaRow: 1, deltaCol: 1 },
  { deltaRow: 1, deltaCol: -1 },
  { deltaRow: -1, deltaCol: 1 },
  { deltaRow: -1, deltaCol: -1 },
]

export function getKingMoves(square: number): number[] {
  let kingMoves: number[] = [];

  const row = Math.floor(square/8)
  const col = square % 8

  for (const { deltaRow, deltaCol } of kingDeltas) {
    let newRow = row + deltaRow
    let newCol = col + deltaCol

    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      let newIndex = newRow * 8 + newCol
      kingMoves.push(newIndex)
     }
  }

  return kingMoves
}
