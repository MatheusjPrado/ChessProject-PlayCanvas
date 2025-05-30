import { Controls, Scenes } from "./Constants";

export interface Listener {
	name: GamePlayEvent;
	callback: (props: any) => void;
}

// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options
export interface ListenerOptions {
	once?: boolean;
	capture?: boolean;
	passive?: boolean;
}

/**
 * playcanvas events names. all keys should be unique and equals to the value
 */
export const PlayCanvasEvents = {
	GamePlay: {
		//custom game events here
	} as const,
	Engine: {
		PlaycanvasLoaded: "PlaycanvasLoaded",
		MainSceneReady: "MainSceneReady",
		IntegrationAdded: "IntegrationAdded",
	} as const,
	A11yEvents: {
		Message: "Message",
		A11yPause: "A11yPause",
		A11yResume: "A11yResume",
		Subtitle: "Subtitle",
	} as const,
	GameEvents: {
		Start: "Start",
		Stop: "Stop",
		Resume: "Resume",
		Pause: "Pause",
		Finish: "Finish",
		Restart: "Restart",
		ChangeGameOptions: "ChangeGameOptions",
	} as const,
	Controls: {
		KeyPress: "KeyPress",
		Action: "Action",
		KeyChange: "KeyChange",
	} as const,
	SceneEvents: {
		LoadScene: "LoadScene",
		UnloadScene: "UnloadScene",
		SceneChanged: "SceneChanged",
		NextScene: "NextScene",
	} as const,
	AudioEvents: {
		StartAudioContext: "StartAudioContext",
		AudioStart: "AudioStart",
		AudioStop: "AudioStop",
		ChangeVolume: "ChangeVolume",
	} as const,
	AnimationEvents: {
		AnimationChanged: "AnimationChanged",
	} as const,
	DefaultEvents: {
		keydown: "keydown",
		mousemove: "mousemove",
	} as const,
	AR8thWallEvents: {
		XRRecenter: "XRRecenter",
	} as const,
};

export const getAllEvents = (obj: any) => {
	const result: any = {};

	function recurse(currentObj: any) {
		for (const key in currentObj) {
			if (typeof currentObj[key] === "object") {
				recurse(currentObj[key]);
			} else {
				result[key] = currentObj[key];
			}
		}
	}

	recurse(obj);
	return result;
};

export const allPlaycanvasEvents = getAllEvents(PlayCanvasEvents);

/**
 * bind correct listeners name
 */
export type GamePlayEvent =
	| keyof typeof PlayCanvasEvents.DefaultEvents
	| keyof typeof PlayCanvasEvents.Engine
	| keyof typeof PlayCanvasEvents.A11yEvents
	| keyof typeof PlayCanvasEvents.GameEvents
	| keyof typeof PlayCanvasEvents.GamePlay
	| keyof typeof PlayCanvasEvents.Controls
	| keyof typeof PlayCanvasEvents.SceneEvents
	| keyof typeof PlayCanvasEvents.AudioEvents
	| keyof typeof PlayCanvasEvents.AR8thWallEvents;

/**
 * binding event type to the respective listener;
 * if there is type here for a key, it will force the correct type on adding or listening to an event
 */
export interface PCEventMap {
	[PlayCanvasEvents.Engine.IntegrationAdded]: { name: string; value: any };

	[PlayCanvasEvents.GameEvents.Start]: void;
	[PlayCanvasEvents.GameEvents.ChangeGameOptions]: { key: string; value: string };

	[PlayCanvasEvents.SceneEvents.LoadScene]: Scenes;

	[PlayCanvasEvents.A11yEvents.Subtitle]: string;
	[PlayCanvasEvents.A11yEvents.Message]: string;

	[PlayCanvasEvents.Controls.KeyPress]: { key: number };
	[PlayCanvasEvents.Controls.Action]: { control: Controls };

	[key: string]: any;
}

/**
 * lifecycle events, for colisions/triggers
 */
export const lifecycleEvents = {
	contact: "contact",
	collisionstart: "collisionstart",
	collisionend: "collisionend",
	destroy: "destroy",
	update: "update",
	triggerenter: "triggerenter",
	triggerleave: "triggerleave",
};
