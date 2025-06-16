import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";
import { Entity, RigidBodyComponentSystem, Vec3 } from "playcanvas";
import { Piece } from "./Pieces/Piece";
import { BoardTile } from "./BoardTile";

@createScript()
export class Player extends ScriptTypeBase {
    @attrib({
        title: "camera",
        type: "entity",
        description: "camera Entity",
    })
    cameraEntity: Entity;

    rigidBodySystem: RigidBodyComponentSystem;

    pieceSelected?: any;

    hoveredPiece?: Piece;

    initialize() {
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onHover, this);
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onClick, this);
        this.rigidBodySystem=this.app.systems.rigidbody!;
        if (!this.rigidBodySystem) {
            console.error("error");
        }

        if (this.app.touch) {
            this.app.touch.on("touchend", this.onTouchEnd, this);
        }
    }

    onClick(event: MouseEvent) {
        this.handleInput(event.x, event.y);
    }

    onTouchStart(event: any) {
        event.event.preventDefault(); // prevents zooms
    }

    onTouchEnd(event: any) {
        const touch = event.changedTouches[0];
        if (!touch) return;
        this.handleInput(touch.x, touch.y);
    }

    handleInput(x: number, y: number) {
        const camera = this.cameraEntity.camera;
        if (!camera) return;

        const from =camera.screenToWorld(x, y, camera.nearClip, new pc.Vec3());
        const to= camera.screenToWorld(x, y, camera.farClip,  new pc.Vec3());
        const result =this.rigidBodySystem.raycastFirst(from, to);

        if (!result) {
            this.unselectPiece();
            return;
        }

        const clickedEntity= result.entity;
        const pieceScript =clickedEntity.getScript(Piece);
        const tileScript= clickedEntity.getScript(BoardTile);

        if (pieceScript) {

            if (!this.pieceSelected) {
                
                if (!pieceScript.getBoard().isPlayerTurn(pieceScript.player)) return;


                pieceScript.select();
                this.pieceSelected = pieceScript;
                return;
            }


            if (pieceScript === this.pieceSelected) {
                this.unselectPiece();
                return;
            }

            if (pieceScript.player === this.pieceSelected.player) {
                this.unselectPiece();
                pieceScript.select();
                this.pieceSelected = pieceScript;
                return;
            }

            const pos = (pieceScript as any).boardPos;   
            this.pieceSelected.move({ row: pos.row, collum: pos.collum });
            this.unselectPiece();
            return;
        }

        if (tileScript && this.pieceSelected) {
            this.pieceSelected.move(tileScript.position);
            this.unselectPiece();
        }
    }
    
    onHover(event: MouseEvent) {
        if (this.pieceSelected) return; 

        const camera = this.cameraEntity.camera;
        if (!camera) return;

        const from=camera.screenToWorld(event.x, event.y, camera.nearClip, new pc.Vec3());
        const to= camera.screenToWorld(event.x, event.y, camera.farClip, new pc.Vec3());
        const result=this.rigidBodySystem.raycastFirst(from, to);

        if (!result){
            if (this.hoveredPiece) {
                this.hoveredPiece.getBoard().clearHighlights();
                this.hoveredPiece = undefined;
            }
            return;
        }

        const hoveredEntity=result.entity;
        const piece=hoveredEntity.getScript(Piece);

        if (!piece || !piece.getBoard().isPlayerTurn(piece.player)) {

            if (this.hoveredPiece) {
                this.hoveredPiece.getBoard().clearHighlights();
                this.hoveredPiece = undefined;
            }
            return;
        }
        if(piece !== this.hoveredPiece) {
            piece.getBoard().clearHighlights();
            piece.getBoard().highlightPossibleMoves(piece);
            this.hoveredPiece = piece;
        }
    }

    unselectPiece() {
        if (!this.pieceSelected) return;

        this.pieceSelected.unselect();
        this.pieceSelected = null;

        if (this.hoveredPiece) {
            this.hoveredPiece.getBoard().clearHighlights();
            this.hoveredPiece = undefined;
        }
    }


    update(dt: number) {

    }
}
