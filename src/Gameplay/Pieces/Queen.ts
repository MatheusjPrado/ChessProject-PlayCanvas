import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";
import { Entity, RigidBodyComponentSystem } from "playcanvas";
import { Piece } from "./Piece";

@createScript()
export class Queen extends Piece {

    canMove(target: { row: number; collum: number }): boolean{

        if (!this.board) return false;

        const rowDelta= target.row - this.boardPos.row;
        const colDelta = target.collum - this.boardPos.collum;

        const isStraight= rowDelta === 0|| colDelta === 0;
        const isDiagonal = Math.abs(rowDelta)=== Math.abs(colDelta);

        if (!isStraight && !isDiagonal) return false;

        const rowStep = rowDelta=== 0 ? 0 : rowDelta > 0 ? 1 : -1;
        const colStep = colDelta=== 0 ? 0 : colDelta > 0 ? 1 : -1;

        let r =this.boardPos.row + rowStep;
        let c= this.boardPos.collum +colStep;

        while (r !== target.row || c !== target.collum) {
            if (this.board.piecesMatrix[r][c]) return false;
            r += rowStep;
            c += colStep;
        }
        const targetPiece = this.board.piecesMatrix[target.row][target.collum];
        return !targetPiece || targetPiece.player !== this.player;
    }
}
