# Playcanvas typescript boilerplate

original project:

Forum post - https://forum.playcanvas.com/t/example-template-project-with-typescript/25272

## Setup

-   Install dependencies `npm install`

-	In `.env` fill the `PLAYCANVAS_API_KEY` from your playcanvas user/account/API Tokens
-   In `pcconfig.json` using [playcanvas-sync guide](https://github.com/playcanvas/playcanvas-sync#config-variables) fill this environment variables. This file is needed to configure playcanvas-sync to sync script files to correct playcanvas project.
    -   `PLAYCANVAS_BRANCH_ID`
    -   `PLAYCANVAS_PROJECT_ID`

	go to your project, open devTools console and type this:

	```ts
	copy({
		PLAYCANVAS_BRANCH_ID: config.self.branch.id,
		PLAYCANVAS_PROJECT_ID: config.project.id,
		PLAYCANVAS_TARGET_DIR: "./dist",
		PLAYCANVAS_BAD_FILE_REG: "^\\.|~$",
		PLAYCANVAS_BAD_FOLDER_REG: "\\."
	})
	```

	this will copy the config files, parse them into pcconfig.json
-   now you ready to go - `npm run dev`

## npm scripts

| Command               | Description                                           												|
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run dev`         | Compiles tsc files and push to playcanvas.com project, use for development, it will watch for changes |
| `npm run build`       | Performs `build` and `push` to playcanvas.com project. this will mimify scripts for production        |
| `npm run sync:assets` | sync binary files to playcanvas.com project           												|


## React Integration
on the `Integration.ts` file, you can add your scripts that you want to share in your react app
it will grab the path from the `.env` file and copy the files into the `PATH_TO_REACT`. 
it should be on a folder name `Integration`
beware that it will erase any files that may be in there
remember to always use the imports on the `integration.ts` file to have its file extension

## 8th wall integration
when using 8th wall, you will need to add 2 scripts into the project external scripts:
```
https://cdn.8thwall.com/web/xrextras/xrextras.js
https://apps.8thwall.com/xrweb?appKey=(YOUR API KEY HERE)
```
you will have to add the appkey for [8th wall of the HMPU project](https://www.8thwall.com/hmpu/workspace) 

## Conventions

Script example

```ts
import { ScriptTypeBase } from "@/types/ScriptTypeBase";
import { falledCheckEvents } from "./falledCheck";
import { createScript, attrib } from "@/utils/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";

@createScript()
export class Shooting extends ScriptTypeBase {
	// attributes
	@attrib({ type: "boolean", default: true })
	autoReload: boolean;
	@attrib({
		type: "number",
		default: 1,
		min: 0.01,
		description: "Reload time in seconds",
	})
	reloadTime: number;

	// local properties
	shotTimer: TInterval;
	reloadingTimer: TTimeout;
	isReloading: boolean = false;

	// lifecycle methods
	initialize() {
		this.addListener(PlayCanvasEvents.GameEvents.Start, 
		(props: any ) => this.startShooting(props));
	}
	onDestroy() {}

	//custom method
	startShooting(){
		//do stuff
	}

}
```
