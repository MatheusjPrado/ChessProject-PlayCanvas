/* eslint-disable @typescript-eslint/no-this-alias */
import { Asset } from "playcanvas";
import { v4 as uuidv4 } from "uuid";
import { SceneManager } from "@/Controllers/SceneManager";
import { GamePlayEvent, Listener, ListenerOptions, PCEventMap, PlayCanvasEvents } from "@/Integration/Events";
import { TAttributeParams } from "./attributes";

// Base class to inherit from for script types
export class ScriptTypeBase extends pc.ScriptType {
	// custom holder to contain attributesData used for initialization of attributes
	attributesData?: { [key: string]: TAttributeParams };

	//unique script id
	private _id: string;
	public get id() {
		if (this._id == undefined) this._id = uuidv4();
		return this._id;
	}

	public set id(id: string) {
		this._id = id;
	}

	private delayedMessages: { eventCallback: any; params: any }[] = [];

	constructor(args: any) {
		super(args);
		this.addListener(PlayCanvasEvents.SceneEvents.SceneChanged, () => {
			if (this.delayedMessages.length > 0) {
				for (const message of this.delayedMessages) {
					message.eventCallback(message.params);
				}
				this.delayedMessages = [];
			}
		});
	}

	//#region assets controll
	isAssetsLoaded() {
		for (const attributeName in this.attributesData) {
			const attribute = this.attributesData[attributeName];
			const self = this;
			if (attribute.type == "asset") {
				if (attribute.array) {
					const assetArray = self[attributeName as keyof ScriptTypeBase] as unknown as Asset[];
					for (const asset of assetArray) {
						if (asset && !asset.loaded) {
							return false;
						}
					}
				} else {
					const asset = self[attributeName as keyof ScriptTypeBase] as unknown as Asset;
					if (asset && !asset.loaded) {
						return false;
					}
				}
			}
			if (attribute.type == "json") {
				// get all json attributes that are assets
				const assetAttributesNames = [];
				for (const schema of attribute.schema!) {
					if (schema.type == "asset") {
						assetAttributesNames.push(schema.name);
					}
				}

				const jsonArray = self[attributeName as keyof ScriptTypeBase] as any;
				for (const entry of jsonArray) {
					for (const schemaName of assetAttributesNames) {
						const asset = entry[schemaName] as unknown as Asset;
						if (asset && !asset.loaded) {
							return false;
						}
					}
				}
			}
		}
		return true;
	}

	getAssetsToLoad(): Asset[] {
		const assetsToLoad = [];
		for (const attributeName in this.attributesData) {
			const attribute = this.attributesData[attributeName];
			const self = this;

			if (attribute.type == "asset") {
				if (attribute.array) {
					const assetArray = self[attributeName as keyof ScriptTypeBase] as unknown as Asset[];
					for (const asset of assetArray) {
						if (asset && !asset.loaded) {
							assetsToLoad.push(asset);
						}
					}
				} else {
					const asset = self[attributeName as keyof ScriptTypeBase] as unknown as Asset;
					if (asset && !asset.loaded) {
						assetsToLoad.push(asset);
					}
				}
			}
			if (attribute.type == "json") {
				// get all json attributes that are assets
				const assetAttributesNames = [];
				for (const schema of attribute.schema!) {
					if (schema.type == "asset") {
						assetAttributesNames.push(schema.name);
					}
				}

				const jsonArray = self[attributeName as keyof ScriptTypeBase] as any;
				for (const entry of jsonArray) {
					for (const schemaName of assetAttributesNames) {
						const asset = entry[schemaName] as unknown as Asset;
						if (asset && !asset.loaded) {
							assetsToLoad.push(asset);
						}
					}
				}
			}
		}
		return assetsToLoad;
	}

	loadAssets(callback?: any) {
		const assets = this.getAssetsToLoad();
		const assetsMap = new Map<number, Asset>();
		for (const asset of assets) {
			if (!assetsMap.has(asset.id)) assetsMap.set(asset.id, asset);
		}

		for (const assetId of assetsMap.keys()) {
			const asset = assetsMap.get(assetId)!;
			const onAssetReady = (asset: Asset) => {
				// Show the entity when the material asset is loaded
				assetsMap.delete(asset.id);
				if (assetsMap.size == 0) {
					if (callback) callback(this.id);
				}
			};

			// Start async loading the material asset
			asset.ready(onAssetReady);
			this.app.assets.load(asset);
		}
	}
	//#endregion

	//#region Events
	postMessage<T extends GamePlayEvent>(name: T, message?: PCEventMap[T]): void {
		window.dispatchEvent(
			new CustomEvent(name, {
				detail: message,
			})
		);
	}

	addListener<T extends GamePlayEvent>(
		name: T,
		callback: (p: PCEventMap[T]) => void,
		options?: ListenerOptions
	): Listener {
		const functionCallback = (ev?: any) => {
			if (SceneManager.instance.loadingScene) {
				this.delayedMessages.push({ eventCallback: callback, params: ev.detail });
			} else {
				callback(ev.detail);
			}
		};
		const listener = { name: name, callback: functionCallback, options: options };
		window.addEventListener(name, functionCallback, options);
		this.on(
			"destroy",
			() => {
				window.removeEventListener(name, functionCallback);
			},
			this
		);

		return listener;
	}

	removeListener(listener: Listener) {
		window.removeEventListener(listener.name, listener.callback);
	}
	//#endregion
}
