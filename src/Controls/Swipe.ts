import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { Controls } from "@/Integration/Constants";
import { createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";

@createScript()
export class Swipe extends ScriptTypeBase {
	//#region singleton methods
	private static _instance: Swipe;

	public static get instance() {
		if (!this._instance) {
			const w = window as any;
			if (w.pc) {
				console.warn(`No ${this.name} instance found. Creating a new one`);

				const entity = new pc.Entity();
				entity.name = this.name;
				entity.addComponent("script");
				entity.script?.create(this.name);

				w.pc.app.root.addChild(entity);
			} else {
				console.error(`no pc instance found on window. unable to create a new ${this.name} instance `);
			}
		}
		return this._instance;
	}

	public static set instance(script: Swipe) {
		this._instance = script;
	}

	constructor(args: any) {
		super(args);
		if (Swipe._instance) {
			this.initialize = () => {
				const scriptName = Swipe.name;
				this.entity.script?.destroy(scriptName);
				console.error(`singleton script ` + scriptName + ` already created. deleting new instance`);
			};
		} else {
			Swipe.instance = this;
		}

		this.on("destroy", function (e) {
			//@ts-ignore
			Swipe.instance = undefined;
		});
	}
	//#endregion

	xDown: any;
	yDown: any;
	initialize() {
		this.xDown = null;
		this.yDown = null;

		const touch = this.app.touch;
		if (touch) {
			touch.on(pc.EVENT_TOUCHSTART, this.handleTouchStart, this);
			touch.on(pc.EVENT_TOUCHMOVE, this.handleTouchMove, this);
		}

		this.on(
			"destroy",
			function () {
				touch.off(pc.EVENT_TOUCHSTART, this.handleTouchStart, this);
				touch.off(pc.EVENT_TOUCHMOVE, this.handleTouchMove, this);
			},
			this
		);
	}

	getTouches(evt: any) {
		return (
			evt.touches || // browser API
			evt.originalEvent.touches
		); // jQuery
	}

	handleTouchStart(evt: any) {
		const firstTouch = this.getTouches(evt)[0];
		this.xDown = firstTouch.clientX != undefined ? firstTouch.clientX : firstTouch.x;
		this.yDown = firstTouch.clientY != undefined ? firstTouch.clientY : firstTouch.y;
	}

	handleTouchMove(evt: any) {
		if (!this.xDown || !this.yDown) {
			return;
		}

		const xUp = evt.touches[0].clientX != undefined ? evt.touches[0].clientX.clientX : evt.touches[0].x;
		const yUp = evt.touches[0].clientY != undefined ? evt.touches[0].clientX.clientY : evt.touches[0].y;

		const xDiff = this.xDown - xUp;
		const yDiff = this.yDown - yUp;

		if (Math.abs(xDiff) > Math.abs(yDiff)) {
			if (xDiff > 0) {
				this.postMessage(PlayCanvasEvents.Controls.Action, { control: Controls.LEFT });
			} else {
				this.postMessage(PlayCanvasEvents.Controls.Action, { control: Controls.RIGHT });
			}
		} else {
			if (yDiff > 0) {
				this.postMessage(PlayCanvasEvents.Controls.Action, { control: Controls.UP });
			} else {
				this.postMessage(PlayCanvasEvents.Controls.Action, { control: Controls.DOWN });
			}
		}
		this.xDown = null;
		this.yDown = null;
	}
}
