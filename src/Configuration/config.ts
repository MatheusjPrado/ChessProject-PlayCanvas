import { Logger } from "./logger";

const urlParams = new URLSearchParams(window.location.search);

export const IS_DEV = Boolean(urlParams.get("debug") === "true");

export const logger = Logger.registerApplication({
	applicationName: "playcanvas",
	fgColor: "#000",
	bgColor: "#f78166",
});
