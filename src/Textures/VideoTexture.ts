import { Asset } from "webpack";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { Texture } from "playcanvas";

@createScript()
export class VideoTexture extends ScriptTypeBase {
	@attrib({
		title: "Material",
		description: "material",
		type: "asset",
	})
	material: Asset;

	@attrib({
		title: "Video Asset",
		description: "MP4 video asset to play back on this video texture.",
		type: "asset",
	})
	videoAsset: Asset;

	@attrib({
		title: "Video Url",
		description: "URL to use if there is video asset selected",
		type: "string",
	})
	videoUrl: string;

	@attrib({
		title: "Play Event",
		description: "Event that is fired as soon as the video texture is ready to play.",
		type: "string",
		default: "",
	})
	playEvent: string;
	upload: boolean;
	playVideo: boolean;
	videoTexture: Texture;

	initialize() {
		this.playVideo = true;
		const app = this.app;

		// Create HTML Video Element to play the video
		const video = document.createElement("video");
		video.loop = true;

		// muted attribute is required for videos to autoplay
		video.muted = true;

		// critical for iOS or the video won't initially play, and will go fullscreen when playing
		video.playsInline = true;

		// needed because the video is being hosted on a different server url
		video.crossOrigin = "anonymous";

		// autoplay the video
		video.autoplay = true;

		// iOS video texture playback requires that you add the video to the DOMParser
		// with at least 1x1 as the video's dimensions
		const style = video.style;
		style.width = "1px";
		style.height = "1px";
		style.position = "absolute";
		style.opacity = "0";
		style.zIndex = "-1000";
		style.pointerEvents = "none";

		document.body.appendChild(video);

		// Create a texture to hold the video frame data
		this.videoTexture = new pc.Texture(app.graphicsDevice, {
			format: pc.PIXELFORMAT_R8_G8_B8,
			minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
			magFilter: pc.FILTER_LINEAR,
			addressU: pc.ADDRESS_CLAMP_TO_EDGE,
			addressV: pc.ADDRESS_CLAMP_TO_EDGE,
			mipmaps: true,
		});
		this.videoTexture.setSource(video);
		video.addEventListener(
			"canplaythrough",
			function () {
				app.fire(this.playEvent, this.videoTexture);
				video.play();
			}.bind(this)
		);

		// set video source
		video.src = this.videoAsset ? (this.videoAsset as any).getFileUrl() : this.videoUrl;

		document.body.appendChild(video);
		video.load();
		video.onloadeddata = () => {
			this.entity.element!.texture = this.videoTexture;
			this.upload = true;
		};
		this.on(
			"destroy",
			function () {
				this.videoTexture.destroy();
				video.remove();
				window.removeEventListener("audioStart", this.play);
				window.removeEventListener("audioStop", this.stop);
			},
			this
		);
		window.addEventListener("audioStart", this.play);
		window.addEventListener("audioStop", this.stop);
	}
	play = () => {
		this.playVideo = true;
	};
	stop = () => {
		this.playVideo = false;
	};

	update() {
		// Transfer the latest video frame to the video texture
		if (this.upload && this.entity.element!.enabled && this.playVideo) {
			this.videoTexture.upload();
		}
	}
}
