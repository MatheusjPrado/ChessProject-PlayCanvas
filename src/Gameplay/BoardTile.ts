import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";
import { Asset, Entity, Material } from "playcanvas";

@createScript()
export class BoardTile extends ScriptTypeBase {
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

	initializeTile(position: { row: number, collum: number }, size: number) {
		this.position = { row: position.row, collum: position.collum };
		const isWhite = (position.row + position.collum) % 2 === 0;
		this.applyTileMaterial(this.entity, isWhite ? this.boardWhiteMaterial.resource : this.boardBlackMaterial.resource);
		this.entity.setLocalPosition(position.collum * size, 0, position.row * size);
	}

	private applyTileMaterial(entity: Entity, material: Material) {

		if (!material || !entity.render) return;

		const meshInstance = entity.render.meshInstances[0];
		if (meshInstance) {
			meshInstance.material = material;
			meshInstance.material.update();
		}
	}
}