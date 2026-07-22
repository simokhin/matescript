import type { Board } from "../board"
import { Color, PieceType, type Square } from "../types"

const rookDeltas = [
  { deltaRow: 1, deltaCol: 0 },
  { deltaRow: -1, deltaCol: 0 },
  { deltaRow: 0, deltaCol: 1 },
  { deltaRow: 0, deltaCol: -1 },
]

export function getRookMoves(square: number, board: Square[], color: Color): number[] {
  let rookMoves: number[] = []

  const row = Math.floor(square/8)
  const col = square % 8

  for (const { deltaRow, deltaCol } of rookDeltas) {
    let step = 1
    while (true) {
      let newRow = row + (deltaRow * step)
        let newCol = col + (deltaCol * step)

      if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
        let newIndex = newRow * 8 + newCol
        if (board[newIndex] != null) {
          if (board[newIndex].color === color) {
            break
          } else {
            rookMoves.push(newIndex)
            break
          }
        } else {
          rookMoves.push(newIndex)
        }
      } else {
        break
      }

      step++
    }
  }

  return rookMoves
}
