enum PieceType {
  Rook,
  Knight,
  Bishop,
  Queen,
  King,
  Pawn
}

enum Color {
  White,
  Black
}

type Piece = {
  pieceType: PieceType,
  color: Color
}

type Square = Piece | null

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

function getKnightMoves(square: number): number[] {
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

// row=7 (rank 8):  56 57 58 59 60 61 62 63
// row=6 (rank 7):  48 49 50 51 52 53 54 55
// row=5 (rank 6):  40 41 42 43 44 45 46 47
// row=4 (rank 5):  32 33 34 35 36 37 38 39
// row=3 (rank 4):  24 25 26 27 28 29 30 31
// row=2 (rank 3):  16 17 18 19 20 21 22 23
// row=1 (rank 2):   8  9 10 11 12 13 14 15
// row=0 (rank 1):   0  1  2  3  4  5  6  7
//                  (a) (b) (c) (d) (e) (f) (g) (h)  <- file, col=0..7
