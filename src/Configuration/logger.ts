type LoggerArgs = {
	applicationName: string;
	fgColor?: string;
	bgColor?: string;
	off?: boolean;
};

export type Methods = "log" | "info" | "warn" | "error" | "debug" | "groupCollapsed" | "groupEnd";

export class Logger {
	private constructor() {}

	private static _instance: Logger;

	private _enabled = true;

	public applications: Record<string, Record<Methods, (...args: any[]) => void>> = {};

	public static get instance(): Logger {
		if (!Logger._instance) {
			Logger._instance = new Logger();
		}

		return Logger._instance;
	}

	public static set enabled(value: boolean) {
		Logger.instance._enabled = value;

		if (!Logger.instance._enabled) {
			Object.values(Logger.instance.applications).forEach((application) => {
				Object.keys(application).forEach((method) => {
					// @ts-ignore
					console[method] = () => {};
					// if not disabled the build will fail
					// eslint-disable-next-line no-param-reassign
					application[method as Methods] = () => {};
				});
			});
		}
	}

	public static registerApplication({ applicationName, fgColor, bgColor, off }: LoggerArgs) {
		Logger.instance.applications[applicationName] = Logger.instance.logger({ applicationName, fgColor, bgColor });
		if (off) {
			Logger.disableApplication(applicationName);
		}
		return Logger.instance.applications[applicationName];
	}

	public static disableApplication(applicationName: string) {
		if (!Logger.instance.applications[applicationName]) {
			return;
		}
		
		Object.keys(Logger.instance.applications[applicationName]).forEach((method) => {
			Logger.instance.applications[applicationName][method as Methods] = () => {};
		});
	}

	private logger({ applicationName, fgColor = "", bgColor = "" }: LoggerArgs) {
		const applicationContext = [`%c ${applicationName} %c`, `color: ${fgColor}; background-color: ${bgColor}`];

		const methods = {} as Record<keyof Console, (...args: any[]) => void>;

		Object.keys(console).forEach((method) => {
			const m = method as keyof Console;

			if (typeof console[m] !== "function") {
				return;
			}

			if (["log", "info", "warn", "error", "debug", "groupCollapsed", "groupEnd"].includes(m)) {
				// @ts-ignore
				methods[m] = console[m].bind(console, ...applicationContext, "");
			}
		});

		return methods as Record<Methods, (...args: any[]) => void>;
	}
}
