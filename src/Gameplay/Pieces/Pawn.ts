import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";
import { Entity, RigidBodyComponentSystem } from "playcanvas";
import { Piece } from "./Piece";
import { Players } from "@/Integration/Constants";


@createScript()
export class Pawn extends Piece {
    canMove(target: { row: number; collum: number }): boolean {

        if(!this.board || !this.boardPos) console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        
        const forwardDir = this.player === Players.White ? 1 : -1;
        const startRow = this.player === Players.White ? 1 : 6;

        const rowDelta = target.row - this.boardPos.row;
        const colDelta = target.collum - this.boardPos.collum;

        const targetPiece = this.board.piecesMatrix[target.row][target.collum];

        const isOneStepForward = colDelta === 0 && rowDelta === forwardDir && !targetPiece;
        if (isOneStepForward) return true;

        const isTwoStepForward =
            colDelta === 0 &&
            rowDelta === 2 * forwardDir &&
            this.boardPos.row === startRow &&
            !targetPiece &&
            !this.board.piecesMatrix[this.boardPos.row + forwardDir][this.boardPos.collum];

        if (isTwoStepForward) return true;

        const isCaptureDiagonal =
            Math.abs(colDelta) === 1 &&
            rowDelta === forwardDir &&
            targetPiece &&
            targetPiece.player !== this.player;

        if (isCaptureDiagonal) return true;

        return false;
    }

}