import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { createScript, attrib } from "@/Configuration/createScriptDecorator";
import { Asset, Material, RenderComponent} from "playcanvas";
import { Players } from "@/Integration/Constants";

@createScript()
export class Piece extends ScriptTypeBase {
    private selected: boolean = false;
    private originalMaterial: Material | null = null;
    private redMaterial: Material | null = null;
    player: any;

    initialize() {
        
    }

    initializePiece(player: Players, material: Material) {
        this.player = player;
        this.originalMaterial = material;
        
        if(!this.redMaterial){
            this.redMaterial = this.app.assets.get(232562985)!.resource as Material;
        }
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

        if (this.redMaterial) {
            this.applyPieceMaterial(this.redMaterial);
        } else console.warn("error");
        
    }

    unselect() {
        console.log(this.entity.name + " was unselected");
        this.selected = false;

        if (this.originalMaterial) {
            this.applyPieceMaterial(this.originalMaterial);
        }
    }

    move(targetPosition: { row: number, collum: number }) {
        console.log(this.entity.name + " is moving to", targetPosition);
        this.entity.setLocalPosition(targetPosition.collum * 2.25, 1.2, targetPosition.row * 2.25);
        this.unselect();
    }

    isSelected(): boolean {
        return this.selected;
    }
}
