import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";

/**
 * just a script to add assets to be loaded before the scene is ready
 * the scene manager will load all assets on scripts before the initialization
 * so we can add this script as a anchor, so that it will block the scene initialization
 * before dispatch the SceneChanged event
 */
@createScript()
export class AssetLock extends ScriptTypeBase {
	@attrib({
		title: "asset",
		type: "asset",
		description: "asset to load before scene is ready",
		array: true,
	})
	asset: any;
}
