import { Application, Vec2, Vec3 } from "playcanvas";
import { Orbit } from "./Orbit";

export class OrbitTouchInput {
	orbitSensitivity: number;
	distanceSensitivity: number;
	orbitCamera: Orbit;
	app: Application;
	lastTouchPoint: Vec2;
	lastPinchMidPoint: Vec2;
	lastPinchDistance: number;
	fromWorldPoint: Vec3;
	toWorldPoint: Vec3;
	worldDiff: Vec3;
	pinchMidPoint: Vec2;

	constructor(orbitCamera: Orbit, orbitSensitivity: number = 0.4, distanceSensitivity: number = 0.2) {
		this.orbitCamera = orbitCamera;
		this.orbitSensitivity = orbitSensitivity;
		this.distanceSensitivity = distanceSensitivity;
		this.app = orbitCamera.app as Application;

		// Store the position of the touch so we can calculate the distance moved
		this.lastTouchPoint = new pc.Vec2();
		this.lastPinchMidPoint = new pc.Vec2();
		this.lastPinchDistance = 0;

		this.fromWorldPoint = new pc.Vec3();
		this.toWorldPoint = new pc.Vec3();
		this.worldDiff = new pc.Vec3();
		this.pinchMidPoint = new pc.Vec2();
		if (this.orbitCamera && this.app.touch) {
			// Use the same callback for the touchStart, touchEnd and touchCancel events as they
			// all do the same thing which is to deal the possible multiple touches to the screen
			this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
			this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
			this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);

			this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
		}
	}

	destroy() {
		this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
		this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
		this.app.touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);

		this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
	}

	getPinchDistance(pointA: Vec2, pointB: Vec2) {
		// Return the distance between the two points
		const dx = pointA.x - pointB.x;
		const dy = pointA.y - pointB.y;

		return Math.sqrt(dx * dx + dy * dy);
	}

	calcMidPoint(pointA: Vec2, pointB: Vec2, result: Vec2) {
		result.set(pointB.x - pointA.x, pointB.y - pointA.y);
		//@ts-ignore
		result.scale(0.5);
		result.x += pointA.x;
		result.y += pointA.y;
	}

	onTouchStartEndCancel(event: any) {
		// We only care about the first touch for camera rotation. As the user touches the screen,
		// we stored the current touch position
		const touches = event.touches;
		if (touches.length == 1) {
			this.lastTouchPoint.set(touches[0].x, touches[0].y);
		} else if (touches.length == 2) {
			// If there are 2 touches on the screen, then set the pinch distance
			this.lastPinchDistance = this.getPinchDistance(touches[0], touches[1]);
			this.calcMidPoint(touches[0], touches[1], this.lastPinchMidPoint);
		}
	}

	pan(midPoint: Vec2) {
		const fromWorldPoint = this.fromWorldPoint;
		const toWorldPoint = this.toWorldPoint;
		const worldDiff = this.worldDiff;

		// For panning to work at any zoom level, we use screen point to world projection
		// to work out how far we need to pan the pivotEntity in world space
		const camera = this.orbitCamera.entity.camera!;
		const distance = this.orbitCamera.distance;

		camera.screenToWorld(midPoint.x, midPoint.y, distance, fromWorldPoint);
		camera.screenToWorld(this.lastPinchMidPoint.x, this.lastPinchMidPoint.y, distance, toWorldPoint);

		worldDiff.sub2(toWorldPoint, fromWorldPoint);

		this.orbitCamera.pivotPoint.add(worldDiff);
	}

	onTouchMove(event: any) {
		const pinchMidPoint = this.pinchMidPoint;

		// We only care about the first touch for camera rotation. Work out the difference moved since the last event
		// and use that to update the camera target position
		const touches = event.touches;
		if (touches.length == 1) {
			const touch = touches[0];

			this.orbitCamera.pitch -= (touch.y - this.lastTouchPoint.y) * this.orbitSensitivity;
			this.orbitCamera.yaw -= (touch.x - this.lastTouchPoint.x) * this.orbitSensitivity;

			this.lastTouchPoint.set(touch.x, touch.y);
		} else if (touches.length == 2) {
			// Calculate the difference in pinch distance since the last event
			const currentPinchDistance = this.getPinchDistance(touches[0], touches[1]);
			const diffInPinchDistance = currentPinchDistance - this.lastPinchDistance;
			this.lastPinchDistance = currentPinchDistance;

			this.orbitCamera.distance -=
				diffInPinchDistance * this.distanceSensitivity * 0.1 * (this.orbitCamera.distance * 0.1);

			// Calculate pan difference
			this.calcMidPoint(touches[0], touches[1], pinchMidPoint);
			this.pan(pinchMidPoint);
			this.lastPinchMidPoint.copy(pinchMidPoint);
		}
	}
}
