import { IntegrationManager } from "@/Controllers/IntegrationManager";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { Controls, KeyMapErrorCode } from "@/Integration/Constants";
import { createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";

@createScript()
export class ControlsManager extends ScriptTypeBase {
	//#region singleton methods
	private static _instance: ControlsManager;

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

	public static set instance(script: ControlsManager) {
		this._instance = script;
	}

	constructor(args: any) {
		super(args);
		if (ControlsManager._instance) {
			this.initialize = () => {
				const scriptName = ControlsManager.name;
				this.entity.script?.destroy(scriptName);
				console.error(`singleton script ` + scriptName + ` already created. deleting new instance`);
			};
		} else {
			ControlsManager.instance = this;
		}

		this.on("destroy", function (e) {
			//@ts-ignore
			ControlsManager.instance = undefined;
		});
	}
	//#endregion

	keyMap: Map<Controls, string>;
	actions: Map<Controls, (e: any) => void>;

	initialize() {
		IntegrationManager.instance.integrate(ControlsManager.name, this);
		this.actions = new Map<Controls, () => void>();
		this.keyMap = new Map<Controls, string>();

		this.keyMap.set(Controls.UP, "w");
		this.keyMap.set(Controls.DOWN, "s");
		this.keyMap.set(Controls.LEFT, "a");
		this.keyMap.set(Controls.RIGHT, "d");
		this.keyMap.set(Controls.SPACE, " ");

		this.actions.set(Controls.UP, () => this.up());
		this.actions.set(Controls.DOWN, () => this.down());
		this.actions.set(Controls.LEFT, () => this.left());
		this.actions.set(Controls.RIGHT, () => this.right());
		this.actions.set(Controls.SPACE, () => this.space());

		this.getControlMap();
	}

	onkeydown(event: KeyboardEvent) {
		const action = this.compareEventKey(event);
		if (!action) return;
		const functionCallback = this.actions.get(action);
		if (functionCallback) functionCallback(event);
		event.preventDefault();
	}

	compareEventKey(event: KeyboardEvent) {
		for (const action of this.keyMap.keys()) {
			const key = this.keyMap.get(action) as Controls;

			if (key.toLowerCase() === event.code.toLowerCase() || key.toLowerCase() === event.key.toLowerCase()) {
				return action;
			}
		}
		return null;
	}

	//#region actions example
	up() {
		this.postMessage(PlayCanvasEvents.Controls.Action, { control: Controls.UP });
	}
	down() {
		this.postMessage(PlayCanvasEvents.Controls.Action, { control: Controls.DOWN });
	}
	left() {
		this.postMessage(PlayCanvasEvents.Controls.Action, { control: Controls.LEFT });
	}
	right() {
		this.postMessage(PlayCanvasEvents.Controls.Action, { control: Controls.RIGHT });
	}
	space() {
		this.postMessage(PlayCanvasEvents.Controls.Action, { control: Controls.SPACE });
	}
	//#endregion

	//#region keymaps
	setKey(actionName: Controls, event: KeyboardEvent) {
		const action = this.actions.get(actionName);
		let error: KeyMapErrorCode = KeyMapErrorCode.NO_ERRORS;
		if (!action) {
			error = KeyMapErrorCode.NO_ACTION_FOUND;
			return;
		}
		const oldAction = this.compareEventKey(event);
		if (oldAction) {
			error = KeyMapErrorCode.KEY_ALREADY_MAPPED;
			//remove key from old action
			this.keyMap.set(oldAction, "");
		}
		this.keyMap.set(actionName, event.key);

		return {
			error: error,
			oldAction: oldAction,
		};
	}

	/**
	 * this will create a listener for the user to input key to change the game action
	 * @param actionName Controls
	 */
	changeKeyByUser(actionName: Controls) {
		const keyListener = (e: KeyboardEvent) => {
			this.setKey(actionName, e);
		};
		this.addListener(PlayCanvasEvents.DefaultEvents.keydown, (props: any) => keyListener(props), {
			once: true,
		});
	}

	getControlMap() {
		const controls: { action: Controls; key: string }[] = [];

		this.keyMap.forEach((key, value) => {
			controls.push({ action: value, key: key });
		});
		return controls;
	}
	//#endregion
}
