import { SoundComponent } from "playcanvas";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { createScript } from "@/Configuration/createScriptDecorator";
import { PlayCanvasEvents } from "@/Integration/Events";

@createScript()
export class AudioManager extends ScriptTypeBase {
	//#region singleton methods
	private static _instance: AudioManager;

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

	public static set instance(script: AudioManager) {
		this._instance = script;
	}

	constructor(args: any) {
		super(args);
		if (AudioManager._instance) {
			this.initialize = () => {
				const scriptName = AudioManager.name;
				this.entity.script?.destroy(scriptName);
				console.error(`singleton script "scriptName" already created. deleting new instance`);
			};
		} else {
			AudioManager.instance = this;
		}

		this.on("destroy", function (e) {
			//@ts-ignore
			AudioManager.instance = undefined;
		});
	}
	//#endregion
	maxVolume: number;

	soundComponents: SoundComponent[];

	initialize() {
		this.soundComponents = this.app.root.findComponents("sound") as SoundComponent[];
		this.maxVolume = 1;

		this.addListener(PlayCanvasEvents.AudioEvents.ChangeVolume, (event: any) => {
			this.changeGameVolume(event.volume);
		});
		this.addListener(PlayCanvasEvents.GameEvents.Pause, () => this.onPause());
		this.addListener(PlayCanvasEvents.GameEvents.Finish, () => this.onFinish());
		this.addListener(PlayCanvasEvents.GameEvents.Resume, () => this.onResume());
		this.addListener(PlayCanvasEvents.SceneEvents.LoadScene, () => this.onSceneLoad());
		this.addListener(PlayCanvasEvents.SceneEvents.UnloadScene, () => this.onSceneUnload());
		this.addListener(PlayCanvasEvents.SceneEvents.SceneChanged, () => this.onSceneChanged());
		/**
		 * to solve auto play bug in ios, where the sound doesn't start before user interaction
		 * to make it work add to a button click on react before the game starts:
		 * 1- document.getElementById('application-canvas').click();
		 * 2- emit this event
		 */
		this.addListener(PlayCanvasEvents.AudioEvents.StartAudioContext, () => this.startAudio());
	}

	//#region events function
	onSceneLoad() {
		this.stop();
	}
	onSceneUnload() {
		this.stop();
	}
	onFinish() {
		this.stop();
	}
	onSceneChanged() {
		this.soundComponents = this.app.root.findComponents("sound") as SoundComponent[];
	}
	onPause() {
		this.pause();
		//@ts-ignore
		this.app.soundManager.suspend();
	}
	onResume() {
		this.resume();
		//@ts-ignore
		this.app.soundManager.resume();
	}
	startAudio() {
		const component: SoundComponent = this.entity.findComponent("sound") as SoundComponent;

		if (!component) {
			console.error("no sound component found on audio manager");
			return;
		}
		component.play(Object.values(component.slots)[0].name);
	}
	//#endregion

	//#region playfunctions
	pause() {
		for (const soundComponent of this.soundComponents) {
			for (const slotName in soundComponent.slots) {
				soundComponent.pause(slotName);
			}
		}
	}

	resume() {
		for (const soundComponent of this.soundComponents) {
			for (const slotName in soundComponent.slots) {
				soundComponent.resume(slotName);
			}
		}
	}

	stop() {
		for (const soundComponent of this.soundComponents) {
			for (const slotName in soundComponent.slots) {
				soundComponent.stop(slotName);
			}
		}
	}
	//#endregion

	changeGameVolume(volume: number) {
		try {
			if (this.app.systems.sound) {
				this.app.systems.sound.manager.volume = volume;
			}
		} catch (err) {
			console.error("Error occurred when changing volume");
		}
	}
}
