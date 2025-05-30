import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { Entity } from "playcanvas";

@createScript()
export class LookAt extends ScriptTypeBase {
	@attrib({
		title: "targetEntity",
		type: "entity",
		description: "target entity to look at",
	})
	targetEntity: Entity;

	@attrib({
		title: "invert",
		type: "boolean",
		description: "invert look at",
		default: false,
	})
	invert: boolean;

	target?: Entity;
	initialize() {
		this.target = this.targetEntity;
	}

	update(dt: number) {
		this.lookAt();
	}

	lookAt() {
		if (!this.target) return;
		this.entity.lookAt(this.target.getPosition());
		if (this.invert) this.entity.rotateLocal(0, 180, 0);
	}

	changeTarget(target: Entity) {
		this.target = target;
	}
}
