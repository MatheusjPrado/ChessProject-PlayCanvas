import { PlayCanvasEvents } from "@/Integration/Events";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { createScript } from "@/Configuration/createScriptDecorator";

@createScript()
export class IntegrationManager extends ScriptTypeBase {
	//#region singleton methods
	private static _instance: IntegrationManager;

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

	public static set instance(script: IntegrationManager) {
		this._instance = script;
	}

	constructor(args: any) {
		super(args);
		if (IntegrationManager._instance) {
			this.initialize = () => {
				const scriptName = IntegrationManager.name;
				this.entity.script?.destroy(scriptName);
				console.error(`singleton script ` + scriptName + ` already created. deleting new instance`);
			};
		} else {
			IntegrationManager.instance = this;
		}

		this.on("destroy", function (e) {
			//@ts-ignore
			IntegrationManager.instance = undefined;
		});
	}
	//#endregion

	pcIntegration: Map<string, any>;
	initialize() {
		this.pcIntegration = new Map<string, any>();
		(window as any).pcIntegration = this;
	}

	integrate(name: string, obj: any) {
		this.pcIntegration.set(name, obj);
		this.postMessage(PlayCanvasEvents.Engine.IntegrationAdded, { name, value: obj });
	}

	getIntegration(name: string) {
		return this.pcIntegration.get(name);
	}
}
