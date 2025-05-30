import { timeout } from "@/Utils/Timeout";
import { Application as AppBase } from "playcanvas";
declare module "playcanvas" {
	interface Application extends AppBase {
		isPaused: boolean;
		//soundManager: SoundManager;
		getScript<T>(entity: Entity, script: (new (...args: any[]) => T) | string): T | undefined;
		findFirstScript<T>(script: (new (...args: any[]) => T) | string): T | undefined;
		findEntitiesWithScript<T>(script: (new (...args: any[]) => T) | string): Entity[] | undefined;
		findScripts<T>(script: (new (...args: any[]) => T) | string): T[] | undefined;

		//import('playcanvas').Entity is a workaround for the
		//fact that Entity is not defined in the global namespace
		//when not imported from playcanvas directly it seems to be "any" type
		findEntityByName(entityName: string): import("playcanvas").Entity | undefined;
		findFirstEntityWithScript<T>(
			script: (new (...args: any[]) => T) | string
		): import("playcanvas").Entity | undefined;

		updateFns: VoidFunction[];
		timeout: typeof timeout;
	}
	interface Entity {
		getScript<T>(script: (new (...args: any[]) => T) | string): T | undefined;
	}

	interface BoundingBox {
		calculate(entity: Entity): Pick<BoundingBox, "halfExtents" | "center">;
		getScript: any;
	}

	//#region CameraComponent
	interface CameraComponent {
		raycastFirst(event: MouseEvent | TouchEvent): Entity | undefined;
	}

	interface CameraComponent {
		toIso(position: Vec3): { direction: Vec3; angle: number };
	}
	//#endregion
}
