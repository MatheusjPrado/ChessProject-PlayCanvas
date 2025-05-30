import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { lifecycleEvents } from "@/Integration/Events";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { CollisionComponent, Entity } from "playcanvas";

@createScript()
export class TriggerableScript extends ScriptTypeBase {
	@attrib({
		title: "isEnabled",
		type: "boolean",
		description: "is enabled",
		default: true,
	})
	isEnabled: boolean;

	@attrib({
		title: "tagsToTrigger",
		type: "string",
		description: "tags to trigger events",
		array: true,
	})
	tagsToTrigger: string[];

	collisionComponent: CollisionComponent;

	initialize() {
		this.collisionComponent = this.entity.collision ? this.entity.collision : this.fallbackCollider();

		this.collisionComponent.on(lifecycleEvents.triggerenter, this.triggerEnter, this);
		this.collisionComponent.on(lifecycleEvents.triggerleave, this.triggerLeave, this);

		this.on(
			"destroy",
			() => {
				this.collisionComponent.off(lifecycleEvents.triggerenter, this.triggerEnter, this);
				this.collisionComponent.off(lifecycleEvents.triggerleave, this.triggerLeave, this);
			},
			this
		);
	}

	fallbackCollider() {
		if (!this.entity.collision) {
			const { halfExtents } = pc.BoundingBox.prototype.calculate(this.entity);
			this.entity.addComponent("collision", {
				type: "box",
				halfExtents,
			});
		}
		return this.entity.collision!;
	}

	triggerEnter(hitEntity: Entity) {
		if (this.isTriggered(hitEntity)) this.onTriggerEnter(hitEntity);
	}
	triggerLeave(hitEntity: Entity) {
		if (this.isTriggered(hitEntity)) this.onTriggerLeave(hitEntity);
	}

	isTriggered(hitEntity: Entity): boolean {
		if (!this.isEnabled) return false;
		if (this.tagsToTrigger.length == 0 || hitEntity.tags.list().some((r) => this.tagsToTrigger.includes(r))) {
			return true;
		}
		return false;
	}

	onTriggerEnter = (hitEntity: Entity) => {};
	onTriggerLeave = (hitEntity: Entity) => {};
}
