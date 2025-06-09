import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";
import { Entity, RigidBodyComponentSystem } from "playcanvas";
import { Piece } from "./Piece";


@createScript()
export class Knight extends Piece {

    canMove(target: { row: number; collum: number }): boolean {

        const rowDelta = Math.abs(target.row - this.boardPos.row);
        const colDelta = Math.abs(target.collum - this.boardPos.collum);

        const isLShape = (rowDelta === 2 && colDelta === 1) || (rowDelta === 1 && colDelta === 2);
        if (!isLShape) return false;

        const targetPiece = this.board.piecesMatrix[target.row][target.collum];
        return !targetPiece || targetPiece.player !== this.player;
        
    }
}
