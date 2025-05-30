import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { Entity, Vec3 } from "playcanvas";

/**
 * this scripts mimics root motion animation on playcanvas
 * this is used when we have an animation that is not on place
 * it will make the animation stay in the root position
 */
@createScript()
export class RootMotionAnimation extends ScriptTypeBase {
	@attrib({
		title: "parentEntity",
		type: "entity",
		description: "For getting direction vector on root motion. optional.",
	})
	parentEntity?: Entity;
	startPosition: Vec3;

	initialize() {
		this.startPosition = this.entity.getLocalPosition().clone();
	}

	postUpdate() {
		if (this.parentEntity) {
			const diff = this.entity.getLocalPosition().sub(this.startPosition);
			this.parentEntity.fire("RootMotion", diff);
		}

		this.entity.setLocalPosition(this.startPosition);
	}
}
