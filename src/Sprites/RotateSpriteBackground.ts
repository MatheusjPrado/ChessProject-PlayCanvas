import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";

@createScript()
export class RotateSpriteBackground extends ScriptTypeBase {
	@attrib({
		title: "rotationSpeed",
		type: "number",
		description: "Rotation Speed",
		default: 1,
	})
	rotationSpeed: number;

	update(dt: number) {
		this.entity.rotateLocal(0, 0, this.rotationSpeed * dt);
	}
}
