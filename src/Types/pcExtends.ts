import { BoundingBox, Entity, Mesh, Vec3 } from "playcanvas";

(function () {
	const application = pc.Application.getApplication() as any;
	if (application) {
		application.isPaused = false;

		//@ts-ignore Method is private
		application.onVisibilityChange = () => {
			if (application?.isHidden()) {
				//@ts-ignore Method is private
				application._soundManager.suspend();
			} else {
				if (!application?.isPaused) {
					//@ts-ignore Method is private
					application._soundManager.resume();
				}
			}
		};

		//#region visibility events handler
		// Depending on browser add the correct visibilitychange event and store the name of the
		// hidden attribute in application._hiddenAttr.
		if (typeof document !== "undefined") {
			if (document.hidden !== undefined) {
				application._hiddenAttr = "hidden";
				//@ts-ignore Method is private
				document.removeEventListener("visibilitychange", application._visibilityChangeHandler, false);
			}
			//@ts-ignore
			else if (document.mozHidden !== undefined) {
				application._hiddenAttr = "mozHidden";
				//@ts-ignore Method is private
				document.removeEventListener("mozvisibilitychange", application._visibilityChangeHandler, false);
			}
			//@ts-ignore
			else if (document.msHidden !== undefined) {
				application._hiddenAttr = "msHidden";
				//@ts-ignore Method is private
				document.removeEventListener("msvisibilitychange", application._visibilityChangeHandler, false);
			}
			//@ts-ignore
			else if (document.webkitHidden !== undefined) {
				application._hiddenAttr = "webkitHidden";
				//@ts-ignore Method is private
				document.removeEventListener("webkitvisibilitychange", application._visibilityChangeHandler, false);
			}
		}

		//@ts-ignore Method is private
		application._visibilityChangeHandler = application.onVisibilityChange.bind(application);
		if (typeof document !== "undefined") {
			if (document.hidden !== undefined) {
				application._hiddenAttr = "hidden";
				//@ts-ignore Method is private
				document.addEventListener("visibilitychange", application._visibilityChangeHandler, false);
			}
			//@ts-ignore
			else if (document.mozHidden !== undefined) {
				application._hiddenAttr = "mozHidden";
				//@ts-ignore Method is private
				document.addEventListener("mozvisibilitychange", application._visibilityChangeHandler, false);
			}
			//@ts-ignore
			else if (document.msHidden !== undefined) {
				application._hiddenAttr = "msHidden";
				//@ts-ignore Method is private
				document.addEventListener("msvisibilitychange", application._visibilityChangeHandler, false);
			}
			//@ts-ignore
			else if (document.webkitHidden !== undefined) {
				application._hiddenAttr = "webkitHidden";
				//@ts-ignore Method is private
				document.addEventListener("webkitvisibilitychange", application._visibilityChangeHandler, false);
			}
		}
		//#endregion

		application.getScript = function <T>(
			entity: Entity,
			script: (new (...args: any[]) => T) | string
		): T | undefined {
			let scriptName: string = "";
			let scriptType: any;
			if (typeof script === "string") {
				scriptName = script;
				scriptType = application.scripts.get(scriptName);
			} else if (typeof script === "function") {
				scriptName = script.name;
				scriptType = script as T;
			}
			let _script = this.script?.get(scriptName);
			if (_script) {
				return _script as T;
			} else {
				const foundScript = this.script?.scripts.filter((s:any) => s instanceof scriptType)[0];
				return (foundScript as T) || undefined;
			}
	
	};

	application.findFirstScript = function <T>(script: (new (...args: any[]) => T) | string): T | undefined {
		const scriptName = script instanceof Function ? script.name : script;
		const entities = this.root.find(function (node: any) {
			return node.script && node.script.get(scriptName);
		})[0] as Entity;
		if (!entities) {
			console.error("no " + scriptName + "script found");
			return undefined;
		}

		return this.getScript(entities, script);
	};

	application.findEntitiesWithScript = function <T>(
		script: (new (...args: any[]) => T) | string
	): Entity[] | undefined {
		const scriptName = script instanceof Function ? script.name : script;
		const entities = this.root.find(function (node: any) {
			return node.script && node.script.get(scriptName);
		});
		return entities as Entity[];
	};

	application.findScripts = function <T>(script: (new (...args: any[]) => T) | string): T[] | undefined {
		const scriptName = script instanceof Function ? script.name : script;
		const entities = this.findEntitiesWithScript(scriptName);
		const scripts = [];
		for (const entity of entities) {
			scripts.push(entity.script?.get(scriptName));
		}
		return scripts as T[];
	};

	application.findEntityByName = function (entityName: string): Entity | undefined {
		const entity = this.root.findByName(entityName) as Entity;
		if (!entity) {
			console.error(`[${entityName}] entity not found`);
			return;
		}
		return entity;
	};

	application.findFirstEntityWithScript = function <T>(
		script: (new (...args: any[]) => T) | string
	): Entity | undefined {
		const scriptName = script instanceof Function ? script.name : script;
		const entity = this.root.find(function (node: any) {
			return node.script && node.script.get(scriptName);
		})[0] as Entity;

		if (!entity) {
			console.error("no " + scriptName + "script found");
			return;
		}

		return entity;
	};

	pc.Entity.prototype.getScript = function <T>(
			script: (new (...args: any[]) => T) | string
		): T | undefined {
			let scriptName: string = "";
			let scriptType: any;
			if (typeof script === "string") {
				scriptName = script;
				scriptType = application.scripts.get(scriptName);
			} else if (typeof script === "function") {
				scriptName = script.name;
				scriptType = script as T;
			}
			let _script = this.script?.get(scriptName);
			if (_script) {
				return _script as T;
			} else {
				const foundScript = this.script?.scripts.filter((s:any) => s instanceof scriptType)[0];
				return (foundScript as T) || undefined;
			}
	
	};

	pc.BoundingBox.prototype.calculate = function (entity: Entity) {
		const getBoundingBox = function (_entity: Entity, _bbox: BoundingBox, initialized = false) {
			const hasChildren = _entity.children.length;

			let meshInstances: Mesh[] = [];
			const renders = _entity.findComponents("render");
			renders.forEach((render) => {
				meshInstances = meshInstances.concat((render as any).meshInstances);
			});

			if (meshInstances.length) {
				meshInstances.forEach((meshInstance) => {
					if (!initialized) {
						_bbox.copy(meshInstance.aabb);
						initialized = true;
					} else {
						_bbox.add(meshInstance.aabb);
					}
				});
			}

			if (hasChildren) {
				_entity.children.forEach((child) => {
					getBoundingBox(child as Entity, _bbox, initialized);
				});
			}

			return _bbox;
		};

		const originalRotation = entity.getRotation().clone();
		entity.setRotation(pc.Quat.IDENTITY);

		const bbox = new pc.BoundingBox();
		getBoundingBox(entity, bbox);

		entity.setRotation(originalRotation);

		const entityWorldTransform = entity.getWorldTransform();
		const inverseWorldTransform = new pc.Mat4();
		inverseWorldTransform.copy(entityWorldTransform).invert();

		const localCenter = new pc.Vec3();
		inverseWorldTransform.transformPoint(bbox.center, localCenter);

		const localHalfExtents = bbox.halfExtents.clone();

		return {
			center: localCenter,
			halfExtents: localHalfExtents,
		};
	};

	/**
	 * used on controls, so that when moving up or down, it will consider the camera rotation, so the character will move based on the camera
	 */
	pc.CameraComponent.prototype.toIso = function (position: Vec3) {
		const _isoMatrix = new pc.Mat4().setFromEulerAngles(0, this.entity.getEulerAngles().y, 0);

		const skewdInput = _isoMatrix.transformPoint(position);
		const angle = 90 - Math.atan2(skewdInput.z, skewdInput.x) * pc.math.RAD_TO_DEG;
		return { direction: skewdInput, angle };
	};

	pc.CameraComponent.prototype.raycastFirst = function (event: MouseEvent | TouchEvent): Entity | undefined {
		if (this.app.systems.rigidbody) {
			console.error("no rigidbody system found");
			return;
		}

		//get screen position
		let screenX: number;
		let screenY: number;
		if (event.type == "click") {
			screenX = (event as MouseEvent).x;
			screenY = (event as MouseEvent).y;
		} else {
			if ((event as TouchEvent).touches.length) {
				screenX = (event as TouchEvent).touches[0].screenX;
				screenY = (event as TouchEvent).touches[0].screenY;
			} else {
				return;
			}
		}

		// The pc.Vec3 to raycast from (the position of the camera)
		const from = this.entity.getPosition();

		// The pc.Vec3 to raycast to (the click position projected onto the camera's far clip plane)
		const to = this.screenToWorld(screenX, screenY, this.farClip);

		// Raycast between the two points and return the closest hit result
		const result = this.app.systems.rigidbody.raycastFirst(from, to);
		// If there was a hit, store the entity
		return result;
	};

	//#region timeout
	const timeout = function (fn: VoidFunction, delay: number = 0) {
		let t = 0;
		let exit = false;

		function reset() {
			exit = true;
		}

		pc.app.on("clear", reset);

		pc.app.updateFns.push((dt: number) => {
			if (exit) {
				pc.app.off("clear", reset);
				return false;
			}
			t += dt * 1000;
			if (t >= delay) {
				fn();
				pc.app.off("clear", reset);
				return false;
			}
		});
	};
	application.timeout = timeout;
	application.updateFns = [];
	pc.app.on("update", (dt: number) => {
		for (let i = application.updateFns.length - 1; i >= 0; i--) {
			const fn = application.updateFns[i];
			if (fn) {
				const result = fn(dt);
				if (result === false) {
					application.updateFns.splice(i, 1);
				}
			}
		}
	});
	//#endregion
}
}) ();

export { };
