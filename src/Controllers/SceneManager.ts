import { Asset, Entity, GraphNode } from "playcanvas";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { GamePlayEvent, PCEventMap, PlayCanvasEvents } from "@/Integration/Events";
import { Scenes } from "@/Integration/Constants";
import { IS_DEV } from "@/Configuration/config";

@createScript()
export class SceneManager extends pc.ScriptType {
	//#region singleton methods
	private static _instance: SceneManager;

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

	public static set instance(script: SceneManager) {
		this._instance = script;
	}

	constructor(args: any) {
		super(args);
		if (SceneManager._instance) {
			this.initialize = () => {
				const scriptName = SceneManager.name;
				this.entity.script?.destroy(scriptName);
				console.error(`singleton script ${scriptName} already created. deleting new instance`);
			};
		} else {
			SceneManager.instance = this;
		}

		this.on("destroy", function (e) {
			//@ts-ignore
			SceneManager.instance = undefined;
		});
	}
	//#endregion

	loadingScene: boolean;
	private _assetsScriptsToLoad: Map<string, ScriptTypeBase>;
	private _assetsToLoad: Map<string, Asset>;
	sceneOrder: Scenes[];
	currentScene: Scenes;

	@attrib({
		type: "entity",
		title: "Scene Root Entity",
		description: "entity that will have the loaded scene",
	})
	sceneRootEntity: Entity;

	get sceneRoot() {
		if (!this.sceneRootEntity) {
			this.createSceneRoot();
		}
		return this.sceneRootEntity;
	}

	createSceneRoot() {
		const entity = new pc.Entity();
		entity.name = "SceneRoot";
		this.app.root.addChild(entity);
		this.sceneRootEntity = entity;
	}

	initialize(): void {
		this._assetsScriptsToLoad = new Map<string, ScriptTypeBase>();
		this._assetsToLoad = new Map<string, Asset>();
		this.addListener(PlayCanvasEvents.SceneEvents.LoadScene, (sceneName: Scenes) => {
			this.loadScene(sceneName);
		});

		this.addListener(PlayCanvasEvents.SceneEvents.NextScene, () => this.nextScene());
		this.sceneOrder = Object.keys(Scenes) as Scenes[];
		if (!this.sceneRootEntity) {
			const entity = new pc.Entity();
			entity.name = "SceneRoot";
			this.app.root.addChild(entity);
			this.sceneRootEntity = entity;
		}

		if (IS_DEV)
			pc.Application.getApplication()?.on("start", function () {
				console.log("loading has finished");
			});
	}

	nextScene() {
		if (this.currentScene) {
			const id = this.sceneOrder.findIndex((e) => e == this.currentScene);
			if (id != undefined && id < this.sceneOrder.length - 1) this.loadScene(this.sceneOrder[id + 1]);
			else {
				this.loadScene(this.sceneOrder[0]);
			}
		} else {
			this.loadScene(this.sceneOrder[0]);
		}
	}

	loadScene(sceneName: Scenes) {
		if (!this.loadingScene) {
			const scene = this.app.scenes.find(sceneName);
			if (!scene) {
				console.error(`scene not found: ${sceneName}`);
				return;
			}

			this.loadingScene = true;
			this.currentScene = sceneName;
			// Remove the current scene that is loaded
			if (this.sceneRootEntity.children.length > 0) {
				// Assume that there is only one entity attached to the sceneRootEntity
				// which would be the loaded scene
				(this.sceneRootEntity.children[0] as Entity).destroy();
			}

			this.app.scenes.loadSceneHierarchy(scene, (err, loadedSceneRootEntity) => {
				if (err || !loadedSceneRootEntity) {
					console.error(err);
				} else {
					loadedSceneRootEntity.reparent(this.sceneRootEntity);
					this.isSceneReady(this.getAllChildEntities(this.sceneRootEntity) as Entity[]);
				}
			});
		}
	}

	unloadScene() {
		this.currentScene = Scenes.None;

		if (this.sceneRoot.children.length === 0) {
			return;
		}
		this.sceneRoot.destroy();
		this.createSceneRoot();
	}

	isSceneReady(sceneEntities: Entity[]) {
		const onScriptReady = (id?: string) => {
			if (id) {
				this._assetsScriptsToLoad.delete(id);
				this._assetsToLoad.delete(id);
			}
			if (this._assetsScriptsToLoad.size == 0 && this._assetsToLoad.size == 0) {
				this.loadingScene = false;
				this.postMessage(PlayCanvasEvents.SceneEvents.SceneChanged, this.currentScene);
			}
		};
		for (const child of sceneEntities) {
			//load assets on script attributes
			if (child.script) {
				for (const script of child.script.scripts) {
					if (script instanceof ScriptTypeBase) {
						if (!script.isAssetsLoaded()) {
							this._assetsScriptsToLoad.set(script.id, script);
						}
					}
				}
			}
			//load soundComponent assets
			if (child.sound) {
				const soundComponent = child.sound;
				for (const slotName in soundComponent.slots) {
					const slot = soundComponent.slot(slotName)!;
					const asset = this.app.assets.get(slot.asset);
					if (asset && !asset.loaded) {
						this._assetsToLoad.set(asset.id.toString(), asset);
					}
				}
			}
			//load sprite assets
			if (child.sprite) {
				const asset = this.app.assets.get(child.sprite.spriteAsset);
				if (asset && !asset.loaded) {
					this._assetsToLoad.set(asset.id.toString(), asset);
				}
			}
		}

		//load assets scripts
		for (const asset of this._assetsScriptsToLoad.values()) {
			asset.loadAssets(() => {
				onScriptReady(asset.id);
			});
		}
		//load individual assets
		for (const asset of this._assetsToLoad.values()) {
			asset.ready(() => {
				onScriptReady(asset.id.toString());
			});
			this.app.assets.load(asset);
		}
		//this will run the finish loading scene event even if there are no assets to load
		onScriptReady();
	}

	getAllChildEntities(entity: GraphNode) {
		const childrens: GraphNode[] = [];
		for (const child of entity.children) {
			childrens.push(child);
			if (child.children.length > 0) {
				childrens.push(...this.getAllChildEntities(child));
			}
		}
		return childrens;
	}

	postMessage<T extends GamePlayEvent>(name: T, message?: PCEventMap[T]): void {
		window.dispatchEvent(
			new CustomEvent(name, {
				detail: message,
			})
		);
	}

	addListener<T extends GamePlayEvent>(name: T, callback: (p: PCEventMap[T]) => void) {
		const functionCallback = (ev?: any) => {
			callback(ev.detail);
		};
		window.addEventListener(name, functionCallback);
		this.on(
			"destroy",
			() => {
				window.removeEventListener(name, functionCallback);
			},
			this
		);
	}
}
