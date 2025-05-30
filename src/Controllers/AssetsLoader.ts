import { Asset } from "playcanvas";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";

@createScript()
export class AssetsLoader extends ScriptTypeBase {
	//#region singleton methods
	private static _instance: AssetsLoader;

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

	public static set instance(script: AssetsLoader) {
		this._instance = script;
	}

	constructor(args: any) {
		super(args);
		if (AssetsLoader._instance) {
			this.initialize = () => {
				const scriptName = AssetsLoader.name;
				this.entity.script?.destroy(scriptName);
				console.error(`singleton script ` + scriptName + ` already created. deleting new instance`);
			};
		} else {
			AssetsLoader.instance = this;
		}

		this.on("destroy", function (e) {
			//@ts-ignore
			AssetsLoader.instance = undefined;
		});
	}
	//#endregion

	@attrib({
		title: "tagNames",
		type: "string",
		description: "tag names",
		default: [],
		array: true,
	})
	tagNames: string[];

	initialize() {
		const assetsToLoad = [];
		for (const tag of this.tagNames) {
			const assets = this.app.assets.findByTag(tag);
			assetsToLoad.push(...assets);
			// console.log("-------------------------------" + tag + "--------------------------------");
		}
		this.loadTagAssets(assetsToLoad, 0);
	}

	loadTagAssets(assets: Asset[], id: number) {
		const asset = assets[id];
		if (!asset) return;
		if (!asset.loaded) {
			asset.ready(() => {
				// console.log("asset ready" + asset.name);
				if (id < assets.length) this.loadTagAssets(assets, id + 1);
			});
			// console.log("loading asset: " + asset.name);
			this.app.assets.load(asset);
		} else {
			if (id < assets.length) this.loadTagAssets(assets, id + 1);
		}
	}

	update(dt: number) {}
}
