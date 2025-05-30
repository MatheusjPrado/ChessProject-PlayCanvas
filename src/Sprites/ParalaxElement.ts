import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { Entity } from "playcanvas";

@createScript()
export class ParalaxElement extends ScriptTypeBase {
	@attrib({ type: "number", default: 0.5 })
	parallaxFactorX: number = 0.5;

	@attrib({ type: "number", default: 0.5 })
	parallaxFactorY: number = 0.5;

	@attrib({
		title: "Camera",
		type: "entity",
	})
	cameraEntity: Entity;

	private initialPosition: pc.Vec3;

	initialize() {
		this.initialPosition = this.entity.getPosition().clone();
	}

	update(dt: number) {
		const newPosition = this.cameraEntity.getPosition().clone();
		const cameraPositionX = newPosition.x * this.parallaxFactorX;
		const cameraPositionY = newPosition.y * this.parallaxFactorY;
		newPosition.z = 0;
		newPosition.x = cameraPositionX;
		newPosition.y = cameraPositionY;

		this.entity.setPosition(this.initialPosition.clone().add(newPosition));
	}
}
