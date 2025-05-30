import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { AudioManager } from "./AudioManager";
import { PlayCanvasEvents } from "@/Integration/Events";
import { SceneManager } from "./SceneManager";
import { IntegrationManager } from "./IntegrationManager";
import { ControlsManager } from "@/Controls/ControlsManager";
import { Entity } from "playcanvas";

@createScript()
export class GameManager extends ScriptTypeBase {
	//#region singleton methods
	private static _instance: GameManager;

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

	public static set instance(script: GameManager) {
		this._instance = script;
	}

	constructor(args: any) {
		super(args);
		if (GameManager._instance) {
			this.initialize = () => {
				const scriptName = GameManager.name;
				this.entity.script?.destroy(scriptName);
				console.error(`singleton script "scriptName" already created. deleting new instance`);
			};
		} else {
			GameManager.instance = this;
		}

		this.on("destroy", function (e) {
			//@ts-ignore
			GameManager.instance = undefined;
		});
	}
	//#endregion

	AudioManager: AudioManager;
	SceneManager: SceneManager;
	IntegrationManager: IntegrationManager;
	ControlsManager: ControlsManager;

	isPaused: boolean;
	isA11yPaused: boolean;
	timer: number;

	@attrib({
		title: "mainCamera",
		type: "entity",
		description: "main camera",
	})
	mainCameraEntity?: Entity;

	initialize() {
		this.fixIOSZoom();
		this.timer = 0;
		this.isPaused = false;
		this.isA11yPaused = false;
		//#region listeners
		this.addListener(PlayCanvasEvents.GameEvents.Start, () => {
			this.start();
		});
		this.addListener(PlayCanvasEvents.GameEvents.Stop, () => {
			this.stop();
		});
		this.addListener(PlayCanvasEvents.GameEvents.Finish, () => {
			this.stop();
		});
		this.addListener(PlayCanvasEvents.GameEvents.Restart, () => {
			this.restart();
		});
		this.addListener(PlayCanvasEvents.GameEvents.Pause, () => {
			this.pause();
		});
		this.addListener(PlayCanvasEvents.GameEvents.Resume, () => {
			this.resume();
		});
		this.addListener(PlayCanvasEvents.SceneEvents.SceneChanged, () => {
			this.timer = 0;
			if (!this.mainCameraEntity?.camera) {
				this.mainCameraEntity = undefined;
				this.getMainCamera();
			}
		});
		this.addListener(PlayCanvasEvents.A11yEvents.A11yPause, () => {
			this.isA11yPaused = true;
			this.app.timeScale = 0;
		});
		this.addListener(PlayCanvasEvents.A11yEvents.A11yResume, () => {
			this.isA11yPaused = false;
			if (!this.isPaused) this.app.timeScale = 1;
		});
		//#endregion

		//when scene is ready, it will post the MainSceneReady event
		this.app.once("postrender", () => {
			this.postMessage(PlayCanvasEvents.Engine.MainSceneReady);
		});
	}

	postInitialize(): void {
		this.AudioManager = AudioManager.instance;
		this.SceneManager = SceneManager.instance;
		this.IntegrationManager = IntegrationManager.instance;
		this.ControlsManager = ControlsManager.instance;
	}

	update(dt: number): void {
		if (!this.isPaused) this.timer += dt;
	}

	/**
	 * this fix an issue on IOS that when the canvas is started while the user is zoomed in,
	 * playcanvas will render only the size of the zoomed screen, making the rest of the screen black
	 */
	fixIOSZoom(): void {
		//get the scale of zoom, is there is no zoom, it will return 1;
		const scale = window.innerWidth / document.documentElement.clientWidth;
		if (scale != 1) {
			//set the fill mode to none, so we can scale the canvas as we please. if this is not none, it will not work
			this.app.setCanvasFillMode("FILLMODE_FILL_NONE");
			this.app.resizeCanvas(window.innerWidth / scale, window.innerHeight / scale);
		}
	}

	//#region default behaviors
	start(): void {
		this.timer = 0;
		this.postMessage(PlayCanvasEvents.GameEvents.Resume, {});
	}

	restart(): void {
		this.start();
		this.postMessage(PlayCanvasEvents.GameEvents.Start);
	}

	stop() {}

	resume() {
		(this.app as any).isPaused = false;
		this.isPaused = false;
		this.app.autoRender = true;
		if (!this.isA11yPaused) this.app.timeScale = 1;
	}

	pause() {
		(this.app as any).isPaused = true;
		this.isPaused = true;
		this.app.autoRender = false;
		this.app.timeScale = 0;
	}

	//#endregion

	getMainCamera() {
		if (this.mainCameraEntity) return this.mainCameraEntity.camera!;

		const cameras = this.app.root.find(function (node) {
			return (node as Entity).camera != undefined;
		});

		this.mainCameraEntity = cameras[0] as Entity;
		return this.mainCameraEntity.camera!;
	}
}
