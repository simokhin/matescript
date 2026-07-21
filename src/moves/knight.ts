const knightDeltas = [
  { deltaRow: 1, deltaCol: 2 },
  { deltaRow: 1, deltaCol: -2 },
  { deltaRow: -1, deltaCol: 2 },
  { deltaRow: -1, deltaCol: -2 },
  { deltaRow: 2, deltaCol: 1 },
  { deltaRow: 2, deltaCol: -1 },
  { deltaRow: -2, deltaCol: 1 },
  { deltaRow: -2, deltaCol: -1 },
]

export function getKnightMoves(square: number): number[] {
  let knightMoves: number[] = [];

  const row = Math.floor(square / 8)
  const col = square % 8

  for (const { deltaRow, deltaCol } of knightDeltas) {
    let newRow = row + deltaRow
    let newCol = col + deltaCol

    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      let newIndex = newRow * 8 + newCol
      knightMoves.push(newIndex)
     }
  }

  return knightMoves
}
