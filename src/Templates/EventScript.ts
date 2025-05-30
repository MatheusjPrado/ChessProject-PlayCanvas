import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { allPlaycanvasEvents, GamePlayEvent } from "@/Integration/Events";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";

@createScript()
export class EventScript extends ScriptTypeBase {
	@attrib({
		type: "string",
		title: "onEvents",
		array: true,
		description: "events to enable",
		enum: allPlaycanvasEvents,
	})
	onEvents: string[];

	@attrib({
		type: "string",
		title: "offEvents",
		array: true,
		description: "events to disable",
		enum: allPlaycanvasEvents,
	})
	offEvents: string[];

	initialize() {
		for (const event of this.onEvents) {
			this.addListener(event as GamePlayEvent, this.onEvent);
		}
		for (const event of this.offEvents) {
			this.addListener(event as GamePlayEvent, this.offEvent);
		}
	}

	onEvent = () => {};
	offEvent = () => {};
}
