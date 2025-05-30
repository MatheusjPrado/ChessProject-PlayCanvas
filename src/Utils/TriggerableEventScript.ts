import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { allPlaycanvasEvents, GamePlayEvent } from "@/Integration/Events";
import { TriggerableScript } from "../Templates/TriggerableScript";

@createScript()
export class TriggerableEventScript extends TriggerableScript {
	@attrib({
		title: "triggerEnterEvents",
		type: "string",
		description: "events to trigger",
		array: true,
		enum: allPlaycanvasEvents,
	})
	triggerEnterEvents: string[];
	@attrib({
		title: "triggerLeavesEvents",
		type: "string",
		description: "events to trigger",
		array: true,
		enum: allPlaycanvasEvents,
	})
	triggerLeavesEvents: string[];

	initialize(): void {
		super.initialize();
	}

	onTriggerEnter = () => {
		for (const event of this.triggerEnterEvents) {
			this.postMessage(event as GamePlayEvent);
		}
	};
	onTriggerLeave = () => {
		for (const event of this.triggerLeavesEvents) {
			this.postMessage(event as GamePlayEvent);
		}
	};
}
