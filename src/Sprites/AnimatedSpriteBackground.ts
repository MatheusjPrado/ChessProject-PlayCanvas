import { ElementComponent } from "playcanvas";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";

@createScript()
export class AnimatedSpriteBackground extends ScriptTypeBase {
	@attrib({
		type: "number",
		default: 1,
		title: "light index",
	})
	iconIndex: number;

	@attrib({
		type: "string",
		title: "onEvents",
		array: true,
		description: "events to enable",
	})
	onEvents: string[];
	@attrib({
		type: "string",
		title: "offEvents",
		array: true,
		description: "events to disable",
	})
	offEvents: string[];
	timer: number;
	frame: number;
	frameRate: number;
	numFrames: number;
	startFrame: number;
	lightEnabled: boolean;

	element: ElementComponent;
	initialize(): void {
		this.element = this.entity.element!;
		if (!this.element) console.error("element not found");
		this.startFrame = 1;
		this.frameRate = 24;
		this.numFrames = this.element.sprite.frameKeys.length;
		this.timer = 1 / this.frameRate;
		this.frame = this.startFrame;

		this.addListener(PlayCanvasEvents.SceneEvents.SceneChanged, () => {
			this.offEvent();
		});
		this.addListener(PlayCanvasEvents.AudioEvents.AudioStart, () => {
			this.lightEnabled = true;
		});
		this.addListener(PlayCanvasEvents.AudioEvents.AudioStop, () => {
			this.lightEnabled = false;
		});
		for (const event of this.onEvents) {
			window.addEventListener(event, this.onEvent);
		}
		for (const event of this.offEvents) {
			window.addEventListener(event, this.offEvent);
		}

		this.on("destroy", this.onDestroy, this);
	}

	onEvent = () => {
		this.frame = this.startFrame;
		this.timer = 0;
		this.element.enabled = true;
		// this.element.spriteFrame = this.frame;
	};
	offEvent = () => {
		this.element.enabled = false;
		// this.frame = this.startFrame;
		this.timer = 0;
	};

	onAnimChangeEvent(animationId: number) {
		if (animationId == this.iconIndex) {
			this.onEvent();
		} else {
			this.offEvent();
		}
	}

	update(dt: number): void {
		if (!this.lightEnabled) return;
		// calculate when to animate to next frame
		this.timer -= dt;
		if (this.timer < 0) {
			// move to next frame
			this.frame++;
			if (this.frame >= this.numFrames + this.startFrame) {
				this.frame = this.startFrame;
			}

			this.element.spriteFrame = this.frame;

			// reset the timer
			this.timer = 1 / this.frameRate;
		}
	}

	onDestroy() {
		for (const event of this.onEvents) {
			window.removeEventListener(event, this.onEvent);
		}
		for (const event of this.offEvents) {
			window.removeEventListener(event, this.offEvent);
		}
	}
}

export default AnimatedSpriteBackground;
