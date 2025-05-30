import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { attrib, createScript } from "@/Configuration/createScriptDecorator";

@createScript()
export class DebugControls extends ScriptTypeBase {
	@attrib({
		title: "buttons",
		type: "json",
		description: "events to add controls",
		array: true,
		schema: [
			{
				name: "color",
				type: "string",
				default: "#fff",
			},
			{
				name: "event",
				type: "string",
			},
			{
				name: "eventParameter",
				type: "string",
			},
			{
				name: "text",
				type: "string",
				default: "button",
			},
		],
	})
	buttons: any;

	initialize() {
		let container = document.getElementById("debuggerControls");
		if (container) {
			document.body.removeChild(container);
		}
		container = document.createElement("div");
		container.id = "debuggerControls";

		document.body.appendChild(container);

		//css
		container.style.position = "absolute";
		container.style.zIndex = "100";

		container.style.display = "flex";
		container.style.bottom = "5%";
		container.style.width = "100%";
		container.style.height = "10%";
		container.style.justifyContent = "space-between";
		container.style.padding = "10px 0";

		for (const buttons of this.buttons) {
			const element = document.createElement("button");
			element.style.backgroundColor = buttons.color;
			element.style.width = "auto";

			element.innerHTML = buttons.text;
			element.onclick = () => {
				this.postMessage(buttons.event, buttons.eventParameter);
				this.app.fire(buttons.event);
			};
			container.appendChild(element);
		}
	}

	update(dt: number) {}
}
