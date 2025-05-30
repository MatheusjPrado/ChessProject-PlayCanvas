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

    initialize() {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onClick, this);
        this.rigidBodySystem = this.app.systems.rigidbody!;
        if (!this.rigidBodySystem) {
            console.error("error");
        }
    }

    onClick(event: MouseEvent) {
        const camera = this.cameraEntity.camera;
        if (!camera) return;
        const from = camera.screenToWorld(event.x, event.y, camera.nearClip, new pc.Vec3());
        const to = camera.screenToWorld(event.x, event.y, camera.farClip, new pc.Vec3());

        const result = this.rigidBodySystem.raycastFirst(from, to);

        if (result) {
            const clickedEntity = result.entity;
            const pieceScript = clickedEntity.getScript(Piece);

            if (pieceScript) {
                pieceScript.select();
                if (this.pieceSelected) this.unselectPiece();
                this.pieceSelected = pieceScript
                //colocar script de comer a peça
            }
            else {
                if (this.pieceSelected) {
                    //pegar a posiçao do tile
                    const tileScript = clickedEntity.getScript(BoardTile);
                    if (tileScript) {
                        this.pieceSelected.move(tileScript.position)
                    }
                }
                this.unselectPiece();

            }

        } else {
            console.log("no entity was found by the raycast");
            this.unselectPiece();


        }
        console.log(this.pieceSelected)
    }

    unselectPiece() {
        if (!this.pieceSelected) return;
        this.pieceSelected.unselect();
        this.pieceSelected = null;
    }

    update(dt: number) {

    }
}