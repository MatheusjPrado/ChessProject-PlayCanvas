import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";
import { Entity, RigidBodyComponentSystem } from "playcanvas";
import { Piece } from "./Piece";
import { Players } from "@/Integration/Constants";


@createScript()
export class Pawn extends Piece {
    canMove(target: { row: number; collum: number }): boolean {
        
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

    move(target: { row: number; collum: number }) { // promoting the pawn to some piece

        super.move(target);
        const lastRow = this.player === Players.White ? 7 : 0;

        if (target.row === lastRow) {

            console.log(this.entity.name + " reached the last row");
            this.entity.destroy();

            const queenAsset = this.board.queen;
            const newQueenEntity = queenAsset.resource.instantiate() as Entity;
            const queenScript = newQueenEntity.getScript(Piece)!;

            const mat = this.player === Players.White? this.board.pieceWhiteMaterial.resource: this.board.pieceBlackMaterial.resource;

            queenScript.initializePiece(this.player, mat);
            queenScript.setBoardContext(this.board, { row: target.row, collum: target.collum });

            if (this.player === Players.White) newQueenEntity.setEulerAngles(0, 180, 0);

            this.board.entity.addChild(newQueenEntity);
            newQueenEntity.setLocalPosition(target.collum * 2.25, 1.2, target.row * 2.25);
            this.board.piecesMatrix[target.row][target.collum] = queenScript;
        }
    }

}