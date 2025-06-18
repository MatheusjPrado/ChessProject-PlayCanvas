import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";
import { Entity, RigidBodyComponentSystem } from "playcanvas";
import { Piece } from "./Piece";

@createScript()
export class King extends Piece {
    
    canMove(target: { row: number; collum: number }): boolean {

        const rowDelta = Math.abs(target.row - this.boardPos.row);
        const colDelta = Math.abs(target.collum - this.boardPos.collum);

        if (rowDelta > 1 || colDelta > 1) return false;

        const targetPiece = this.board.piecesMatrix[target.row][target.collum];

        if (targetPiece && targetPiece.player === this.player) return false;

        const originalPos = { row: this.boardPos.row, collum: this.boardPos.collum };
        const originalTargetPiece = targetPiece;

        this.board.piecesMatrix[originalPos.row][originalPos.collum] = null;
        this.board.piecesMatrix[target.row][target.collum] = this;

        let isInCheck = false;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board.piecesMatrix[r][c];
                if (piece && piece.player !== this.player) {
                    if (piece.canMove(target)) {
                        isInCheck = true;
                        break;
                    }
                }
            }
            if (isInCheck) break;
        }
      
        this.board.piecesMatrix[originalPos.row][originalPos.collum] = this;
        this.board.piecesMatrix[target.row][target.collum] = originalTargetPiece;

        return !isInCheck;
    }
}
