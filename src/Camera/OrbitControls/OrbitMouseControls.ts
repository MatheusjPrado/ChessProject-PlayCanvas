import { Orbit } from "./Orbit";
import { Application, Vec3 } from "playcanvas";

export class OrbitMouseControls {
	orbitCamera: Orbit;
	lookButtonDown: boolean;
	panButtonDown: boolean;
	lastPoint: any;
	fromWorldPoint: Vec3;
	toWorldPoint: Vec3;
	worldDiff: Vec3;
	orbitSensitivity: number;
	distanceSensitivity: number;
	app: Application;

	constructor(orbitCamera: Orbit, orbitSensitivity: number = 0.3, distanceSensitivity: number = 0.15) {
		this.orbitCamera = orbitCamera;
		this.app = this.orbitCamera.app as Application;
		this.orbitSensitivity = orbitSensitivity;
		this.distanceSensitivity = distanceSensitivity;
		this.fromWorldPoint = new pc.Vec3();
		this.toWorldPoint = new pc.Vec3();
		this.worldDiff = new pc.Vec3();

		if (this.orbitCamera) {
			this.orbitCamera.app;
			this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
			this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
			this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
			this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

			// Listen to when the mouse travels out of the window
			window.addEventListener("mouseout", this.onMouseOut, false);
		}

		// Disabling the context menu stops the browser displaying a menu when
		// you right-click the page
		this.app.mouse.disableContextMenu();

		this.lookButtonDown = false;
		this.panButtonDown = false;
		this.lastPoint = new pc.Vec2();
	}
	// @attrib({
	// 	type: "number",
	// 	default: 0.3,
	// 	title: "Orbit Sensitivity",
	// 	description: "How fast the camera moves around the orbit. Higher is faster",
	// })
	// orbitSensitivity: number;

	// @attrib({
	// 	type: "number",
	// 	default: 0.15,
	// 	title: "Distance Sensitivity",
	// 	description: "How fast the camera moves in and out. Higher is faster",
	// })
	// distanceSensitivity: number;

	onDestroy() {
		this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
		this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
		this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
		this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

		window.removeEventListener("mouseout", this.onMouseOut, false);
	}

	pan(screenPoint: Vec3) {
		const fromWorldPoint = this.fromWorldPoint;
		const toWorldPoint = this.toWorldPoint;
		const worldDiff = this.worldDiff;

		// For panning to work at any zoom level, we use screen point to world projection
		// to work out how far we need to pan the pivotEntity in world space
		const camera = this.orbitCamera.entity.camera!;
		const distance = this.orbitCamera.distance;

		camera.screenToWorld(screenPoint.x, screenPoint.y, distance, fromWorldPoint);
		camera.screenToWorld(this.lastPoint.x, this.lastPoint.y, distance, toWorldPoint);

		worldDiff.sub2(toWorldPoint, fromWorldPoint);

		this.orbitCamera.pivotPoint.add(worldDiff);
	}

	onMouseDown(event: any) {
		switch (event.button) {
			case pc.MOUSEBUTTON_LEFT:
				{
					this.lookButtonDown = true;
				}
				break;

			case pc.MOUSEBUTTON_MIDDLE:
			case pc.MOUSEBUTTON_RIGHT:
				{
					this.panButtonDown = true;
				}
				break;
		}
	}

	onMouseUp(event: any) {
		switch (event.button) {
			case pc.MOUSEBUTTON_LEFT:
				{
					this.lookButtonDown = false;
				}
				break;

			case pc.MOUSEBUTTON_MIDDLE:
			case pc.MOUSEBUTTON_RIGHT:
				{
					this.panButtonDown = false;
				}
				break;
		}
	}

	onMouseMove(event: any) {
		if (this.lookButtonDown) {
			this.orbitCamera.pitch -= event.dy * this.orbitSensitivity;
			this.orbitCamera.yaw -= event.dx * this.orbitSensitivity;
		} else if (this.panButtonDown) {
			this.pan(event);
		}

		this.lastPoint.set(event.x, event.y);
	}

	onMouseWheel(event: any) {
		this.orbitCamera.distance -= event.wheel * this.distanceSensitivity * (this.orbitCamera.distance * 0.1);
		event.event.preventDefault();
	}

	onMouseOut(event: any) {
		this.lookButtonDown = false;
		this.panButtonDown = false;
	}
}
