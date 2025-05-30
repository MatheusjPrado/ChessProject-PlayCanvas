import { GameManager } from "@/Controllers/GameManager";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { logger } from "@/Configuration/config";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { EVENT_MOUSEDOWN, EVENT_MOUSEMOVE, EVENT_MOUSEUP, HandleEventCallback, Vec3 } from "playcanvas";

@createScript()
export class MoveCamera extends ScriptTypeBase {
	@attrib({
		title: "lerpAmount",
		type: "number",
		description: "smoothness of camera movement",
		default: 1,
	})
	lerpAmount: number = 1;

	isPressed: boolean = false;
	isActive: boolean = false;

	targetPosition: pc.Vec3 = new pc.Vec3();
	initialMousePosition: pc.Vec2 = new pc.Vec2();
	initialPosition = new pc.Vec3();

	initialize() {
		document.body.style.cursor = "grab";

		this.targetPosition.copy(this.entity.getPosition());
		this.initialPosition.copy(this.entity.getPosition());

		this.app.mouse.on(EVENT_MOUSEDOWN, this.mousedown, this);
		this.app.mouse.on(EVENT_MOUSEUP, this.mouseup, this);
		this.app.mouse.on(EVENT_MOUSEMOVE, this.mousemove, this);

		const bindedMouseUp = this.mouseup.bind(this);
		window.addEventListener("mouseout", bindedMouseUp);

		this.on("destroy", () => {
			document.body.style.cursor = "default";
			this.app.mouse.off(EVENT_MOUSEDOWN);
			this.app.mouse.off(EVENT_MOUSEUP);
			this.app.mouse.off(EVENT_MOUSEMOVE);
			window.removeEventListener("mouseout", bindedMouseUp);
		});
	}

	toggleScript(action: boolean) {
		this.enabled = action;

		this.app.mouse.off(EVENT_MOUSEDOWN);
		this.app.mouse.off(EVENT_MOUSEUP);
		this.app.mouse.off(EVENT_MOUSEMOVE);

		if (!action) {
			return;
		}

		this.app.mouse.on(EVENT_MOUSEDOWN, this.mousedown, this);
		this.app.mouse.on(EVENT_MOUSEUP, this.mouseup, this);
		this.app.mouse.on(EVENT_MOUSEMOVE, this.mousemove, this);
	}

	// #region events
	private mousedown(e: HandleEventCallback) {
		if (!this.entity.camera) {
			logger.error("no camera attached to entity");
			return;
		}
		this.setIsPressed(true, e);
	}

	private mouseup() {
		this.setIsPressed(false);
	}

	private mousemove(e: MouseEvent) {
		if (!this.isPressed || !this.entity.camera) return;

		const range = 5;
		//add a range of movement to define the camera is being moved freely
		if (
			!this.isActive &&
			Math.abs(e.x - this.initialMousePosition.x) < range &&
			Math.abs(e.y - this.initialMousePosition.y) < range
		)
			return;
		this.isActive = true;

		const currentMousePosition = new pc.Vec2(e.x, e.y);
		const mouseDelta = currentMousePosition.sub(this.initialMousePosition);

		// 0.025 ?? ?
		const scale = 0.025;
		this.targetPosition = this.initialPosition
			.clone()
			.add(
				GameManager.instance.getMainCamera().toIso(new Vec3(-mouseDelta.x * scale, 0, -mouseDelta.y * scale))
					.direction
			);
	}

	// #endregion

	private setIsPressed(isPressed: boolean, e?: any) {
		document.body.style.cursor = isPressed ? "grabbing" : "grab";
		this.isPressed = isPressed;

		if (!isPressed) return;
		this.initialMousePosition.set(e.x, e.y);
		this.initialPosition.copy(this.entity.getPosition());
	}

	update(dt: number) {
		if (!this.isActive) return;
		const newPosition = new pc.Vec3().lerp(this.entity.getPosition(), this.targetPosition, this.lerpAmount * dt);
		this.entity.setPosition(newPosition);
	}
}
