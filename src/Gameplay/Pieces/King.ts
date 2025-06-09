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
        return !targetPiece || targetPiece.player !== this.player;

    }
}
