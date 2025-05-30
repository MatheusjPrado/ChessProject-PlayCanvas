/* eslint-ignore */

import * as _pc from "playcanvas";

declare global {
	const pc: typeof _pc;

	type TDebugSystem = {
		enabledCategories: TDebugCategory[];
		isCategoryEnabled(category: TDebugCategory): boolean;
		enableCategory(category: TDebugCategory): void;
	};

	type TTimeout = ReturnType<typeof setTimeout>;
	type TInterval = ReturnType<typeof setInterval>;

	interface Window {
		debugSystem: TDebugSystem;

		//8th wall
		XR8: any;
		XRExtras: any;
	}

	declare class AppBase extends EventHandler {
		isPaused: boolean;
	}
}
