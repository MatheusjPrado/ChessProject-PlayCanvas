import { createScript } from "@/Configuration/createScriptDecorator";
import { Piece } from "./Piece";

@createScript()
export class Bishop extends Piece {

    canMove(target: { row: number; collum: number }): boolean {
        if (!this.board) return false;

        const dRow = target.row    - this.boardPos.row;
        const dCol = target.collum - this.boardPos.collum;

        if (Math.abs(dRow) !== Math.abs(dCol)) return false;

        const rStep = dRow > 0 ?  1 : -1;
        const cStep = dCol > 0 ?  1 : -1;

        let r = this.boardPos.row    + rStep;
        let c = this.boardPos.collum + cStep;

        while (r !== target.row && c !== target.collum) { // it was having problems with this

            if (r < 0 || r > 7 || c < 0 || c > 7) return false;

            if (this.board.piecesMatrix[r][c]) return false;

            r += rStep;
            c += cStep;
        }

        if (target.row < 0 || target.row > 7 || target.collum < 0 || target.collum > 7)
            return false;

        const dest = this.board.piecesMatrix[target.row][target.collum];
        return !dest || dest.player !== this.player;
    }
}
