import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { createScript } from "@/Configuration/createScriptDecorator";
import { Material, RenderComponent, Vec3 } from "playcanvas";
import { Players } from "@/Integration/Constants";

@createScript()
export class Piece extends ScriptTypeBase {
    private selected: boolean = false;
    player: any;

    initialize() {

    }

    initializePiece(player: Players, material: Material) {
        this.player = player;
        this.applyPieceMaterial(material);
    }

    private applyPieceMaterial(material: Material) {
        const renders = this.entity.findComponents("render") as RenderComponent[];
        for (const rc of renders) {
            for (const mi of rc.meshInstances) {
                mi.material = material;
                mi.material.update();
            }
        }

    }

    select() {
        console.log(this.entity.name + " was selected");
        this.selected = true;
        //troca a cor pra vermelho
    }

    unselect() {
        console.log(this.entity.name + " was unselected");
        this.selected = false;
        // troca pra cor original
    }

    move(targetPosition: { row: number, collum: number }) {
        console.log(this.entity.name + " is moving to", targetPosition);
        this.entity.setLocalPosition(targetPosition.collum * 2, 1.2, targetPosition.row * 2);

        this.selected = false;
    }

    isSelected(): boolean {
        return this.selected;
    }

}
