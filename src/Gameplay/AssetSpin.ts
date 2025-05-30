import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";

@createScript()
export class AssetSpin extends ScriptTypeBase {
	@attrib({
		title: "rotationSpeed",
		type: "number",
		description: "rotation speed",
		default: 100,
	})
	rotationSpeed: number;
	initialize() { }

	update(dt: number) {
		this.entity.rotate(0, this.rotationSpeed * dt, 0);
	}
}
