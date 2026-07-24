import { PieceType, Color } from "../src/types";
import rookLight from "./assets/pieces/Chess_rlt45.svg";
import rookDark from "./assets/pieces/Chess_rdt45.svg";
import knightLight from "./assets/pieces/Chess_nlt45.svg";
import knightDark from "./assets/pieces/Chess_ndt45.svg";
import bishopLight from "./assets/pieces/Chess_blt45.svg";
import bishopDark from "./assets/pieces/Chess_bdt45.svg";
import queenLight from "./assets/pieces/Chess_qlt45.svg";
import queenDark from "./assets/pieces/Chess_qdt45.svg";
import kingLight from "./assets/pieces/Chess_klt45.svg";
import kingDark from "./assets/pieces/Chess_kdt45.svg";
import pawnLight from "./assets/pieces/Chess_plt45.svg";
import pawnDark from "./assets/pieces/Chess_pdt45.svg";

export const pieces: Record<Color, Record<PieceType, string>> = {
  [Color.White]: {
    [PieceType.Rook]: rookLight,
    [PieceType.Knight]: knightLight,
    [PieceType.Bishop]: bishopLight,
    [PieceType.Queen]: queenLight,
    [PieceType.King]: kingLight,
    [PieceType.Pawn]: pawnLight,
  },
  [Color.Black]: {
    [PieceType.Rook]: rookDark,
    [PieceType.Knight]: knightDark,
    [PieceType.Bishop]: bishopDark,
    [PieceType.Queen]: queenDark,
    [PieceType.King]: kingDark,
    [PieceType.Pawn]: pawnDark,
  },
};
