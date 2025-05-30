import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { CameraComponent, Vec3 } from "playcanvas";
import { GameManager } from "@/Controllers/GameManager";

@createScript()
export class ScreenTracker extends ScriptTypeBase {
	camera: CameraComponent;
	htmlElement: HTMLElement;
	htmlBounds: { width: number; height: number };

	//timer control
	private _updateIntervalTimer: number = 0;
	@attrib({
		title: "updateInterval",
		type: "number",
		description: "html update position interval",
		default: 15,
	})
	updateInterval: number;

	initialize() {
		this.camera = GameManager.instance.getMainCamera();
		this.setHtmlElement(this._createTestHtml());
	}

	update(dt: number) {
		if (this._updateIntervalTimer >= this.updateInterval) {
			this.updateHtmlPosition();
			this._updateIntervalTimer = 0;
		}

		this._updateIntervalTimer += dt;
	}

	setHtmlElement(htmlElement: HTMLElement) {
		this.htmlElement = htmlElement;
		this._setBounds(this.htmlElement);
	}

	private _createTestHtml() {
		const htmlElement = document.createElement("div");
		htmlElement.style.zIndex = "1000";
		htmlElement.style.position = "absolute";
		htmlElement.style.width = "200px";
		htmlElement.style.height = "100px";
		htmlElement.style.backgroundColor = "yellow";
		htmlElement.innerHTML = "BOTAO";
		htmlElement.tabIndex = 0;
		document.body.appendChild(htmlElement);

		return htmlElement;
	}

	private _worldSpaceToScreenSpace(pos: Vec3) {
		const device = this.app.graphicsDevice;
		const worldPos = pos.clone();
		const screenPos = new pc.Vec3();
		const scale = device.maxPixelRatio;

		// get screen space co-ord
		this.camera.worldToScreen(worldPos, screenPos);

		return new pc.Vec3(screenPos.x * scale, screenPos.y * scale, 0);
	}

	private _setBounds(htmlElement: HTMLElement) {
		const bounds = htmlElement.getBoundingClientRect();
		this.htmlBounds = {
			width: bounds.width,
			height: bounds.height,
		};
	}

	updateHtmlPosition() {
		const convertedPos = this._worldSpaceToScreenSpace(this.entity.getPosition());

		this.htmlElement.style.left = convertedPos.x - this.htmlBounds.width / 2 + "px";
		this.htmlElement.style.top = convertedPos.y - this.htmlBounds.height / 2 + "px";
	}
}
