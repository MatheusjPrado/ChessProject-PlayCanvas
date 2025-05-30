import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { Asset, Entity } from "playcanvas";
import { PlayCanvasEvents } from "@/Integration/Events";
import { GameManager } from "@/Controllers/GameManager";

@createScript()
export class ARController extends ScriptTypeBase {
	is8thInitialized: boolean;
	// Optionally, world tracking can be disabled to increase efficiency when tracking image targets.
	@attrib({ type: "boolean" })
	disableWorldTracking: boolean;

	// Optionally, add a material to this script to make it a transparent shadow receiver, which is
	// very helpful for producing a good AR effect.
	@attrib({ type: "asset" })
	shadowmaterial: Asset;

	cameraEntity: Entity;
	initialize() {
		this.cameraEntity = GameManager.instance.getMainCamera().entity;
		/**
		 * this is the standard event to recenter the 8th wall experience
		 * this listener only rebroadcast the window event to the playcanvas event
		 */
		this.addListener(PlayCanvasEvents.AR8thWallEvents.XRRecenter, () => () => {
			this.app.fire("xr:recenter");
		});

		this.initialize8thWall();
	}
	async initialize8thWall() {
		const { XR8, XRExtras } = window;
		const disableWorldTracking = this.disableWorldTracking;

		XR8.addCameraPipelineModules([
			// Add camera pipeline modules.
			// Existing pipeline modules.
			XR8.GlTextureRenderer.pipelineModule(), // Draws the camera feed.
			XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
			XRExtras.FullWindowCanvas.pipelineModule(), // Modifies the canvas to fill the window.
			XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
			XRExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.
		]);

		// After XR has fully loaded, open the camera feed and start displaying AR.
		const runOnLoad = (extramodules: any) => () => {
			if (!this.is8thInitialized) {
				XR8.XrController.configure({ disableWorldTracking });
			}
			const config = {
				// Pass in your canvas name. Typically this is 'application-canvas'.
				canvas: document.getElementById("application-canvas"),
			};

			XR8.PlayCanvas.run({ pcCamera: this.cameraEntity, pcApp: this.app }, extramodules, config);
			this.is8thInitialized = true;
		};

		// If a shadow material was given, apply the appropriate shaders.
		if (this.shadowmaterial) {
			XRExtras.PlayCanvas.makeShadowMaterial({ pc, material: this.shadowmaterial });
		}

		// While XR is still loading, show some helpful things.
		// Almost There: Detects whether the user's environment can support web ar, and if it doesn't,
		//     shows hints for how to view the experience.
		// Loading: shows prompts for camera permission and hides the scene until it's ready for display.
		// Runtime Error: If something unexpected goes wrong, display an error screen.
		XRExtras.Loading.showLoading({
			onxrloaded: runOnLoad([
				// Optional modules that developers may wish to customize or theme.
				XRExtras.AlmostThere.pipelineModule(), // Detects unsupported browsers and gives hints.
				XRExtras.Loading.pipelineModule(), // Manages the loading screen on startup.
				XRExtras.RuntimeError.pipelineModule(), // Shows an error image on runtime error.
				XR8.XrController.pipelineModule(), // Powers the SLAM engine.
			]),
		});
	}
}
