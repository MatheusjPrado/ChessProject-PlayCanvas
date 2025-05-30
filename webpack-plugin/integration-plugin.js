/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const events = require("events");
const path = require("path");
const readline = require("readline");

class IntegrationPlugin {
	srcEntryPoint = "./src/Integration/integration.ts";
	integrationEntryPoint = "../src/Integration";
	path = "";
	syncFilesToReact = true;

	constructor(path_) {
		this.path = path_;
		if (!this.syncFilesToReact) return;
		if (!this.path) {
			this.log.yellow("No path to React project specified. Skipping integration.");
			this.syncFilesToReact = false;
			return;
		}
		if (!this.path.endsWith("Integration")) {
			throw new Error("No Integration folder, the path should have a 'Integration' folder as an end folder");
		}
	}

	async readEntryPoint() {
		const lines = [];
		try {
			const rl = readline.createInterface({
				input: fs.createReadStream(this.srcEntryPoint),
			});
			rl.on("line", (line) => {
				if (!line.startsWith("import")) return;

				const file = line.split(" ").pop().replace(/["';]/g, "");
				lines.push(file);
			});
			await events.once(rl, "close");

			return lines;
		} catch (err) {
			console.error(err);
		}
	}

	log = {
		green: (text) => console.log("\x1b[32m" + text + "\x1b[0m"),
		red: (text) => console.log("\x1b[31m" + text + "\x1b[0m"),
		blue: (text) => console.log("\x1b[34m" + text + "\x1b[0m"),
		yellow: (text) => console.log("\x1b[33m" + text + "\x1b[0m"),
	};

	apply(compiler) {
		const pluginName = this.constructor.name;

		compiler.hooks.done.tapAsync(pluginName, async (params, callback) => {
			if (!this.syncFilesToReact) {
				callback();
				return;
			}

			if (!fs.existsSync(this.srcEntryPoint)) {
				this.log.red("Integration entry point does not exist. Skipping integration.");
				return callback();
			}

			if (!fs.existsSync(this.path)) {
				this.log.red("Creating dist folder.");
				fs.mkdirSync(this.path);
			}

			const files = await this.readEntryPoint();
			const dist = path.join(this.path);

			//clear dist files
			fs.readdirSync(dist).forEach((file) => {
				fs.unlinkSync(path.join(dist, file));
			});

			try {
				files.forEach((file) => {
					fs.copyFileSync(
						path.join(__dirname, this.integrationEntryPoint, file),
						path.join(dist, file.split("/").pop())
					);
				});
			} catch (error) {
				console.error(error);
			}

			callback();
		});
	}
}

module.exports = IntegrationPlugin;
