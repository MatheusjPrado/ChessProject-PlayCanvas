import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { Entity, Vec3 } from "playcanvas";

@createScript()
export class Follow extends ScriptTypeBase {
	@attrib({
		title: "followedObject",
		type: "entity",
		description: "entity to folow",
	})
	followedObject: Entity;

	@attrib({
		title: "cameraOfsset",
		type: "vec3",
		description: "camera offset",
	})
	cameraOfsset: Vec3;
	target: Entity;
	initialize() {
		this.target = this.followedObject;
	}

	update(dt: number) {
		this.follow();
	}

	follow() {
		if (!this.target) return;
		const position = this.target.getPosition();
		this.entity.setPosition(
			position.x + this.cameraOfsset.x,
			position.y + this.cameraOfsset.y,
			position.z + this.cameraOfsset.z
		);
	}

	changeTarget(target: Entity) {
		this.target = target;
	}
}
