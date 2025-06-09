import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";
import { Asset, Entity, Material } from "playcanvas";

@createScript()
export class BoardTile extends ScriptTypeBase {

	private defaultMat!: Material;   
    private isWhite!: boolean;

	@attrib({
		title: "board Black Material",
		type: "asset",
		description: "black material asset"
	}) boardBlackMaterial: Asset;

	@attrib({
		title: "board white material",
		type: "asset",
		description: "white material asset"
	}) boardWhiteMaterial: Asset;

	position: { row: number, collum: number }
	
	initialize() {
	}

    initializeTile(pos: {row:number; collum:number}, size:number) {

        this.position= pos;
        this.isWhite =(pos.row + pos.collum) % 2 === 0;

        this.defaultMat= this.isWhite?this.boardWhiteMaterial.resource:this.boardBlackMaterial.resource;

        this.applyTileMaterial(this.entity, this.defaultMat);
        this.entity.setLocalPosition(pos.collum * size, 0, pos.row * size);

    }

	setHighlight(on: boolean, highlightMat?: Material) {
        const targetMat = on && highlightMat ? highlightMat : this.defaultMat;
        this.applyTileMaterial(this.entity, targetMat);
    }

    private applyTileMaterial(entity: Entity, mat: Material) {
        if (!mat || !entity.render) return;
        const mi = entity.render.meshInstances[0];
        if (mi) {
            mi.material = mat;
            mi.material.update();
        }
    }
}