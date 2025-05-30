// from https://github.com/Glidias/playcanvas-typescript-babel-intellisense-template/tree/6a35dab6d229c3857673e56861b34cc1a658cb54
import { TAttributeParams } from "@/Types/attributes";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";

/**
 * Class decorator allowing the use of ES6 classes
 * to define and create PlayCanvas script types.
 * Caveat is: There is a slight iterative runtime overhead to this. (unlike Haxe which can utilize precompiled-macros)
 * The cool thing is that your script (if it uses properties) has an additional property called `attributesData` that can facilitate offboard property reflection/runtime-component
 * property GUI creation.
 */
export function createScript() {
	return function (obj: any) {
		if (pc && pc.app) {
			// script creation on runtime
			pc.registerScript(obj, obj.name);
			const attributes = pc.app.scripts.get(obj.name).attributes;
			for (const attr in obj.prototype.attributesData) {
				attributes.add(attr, obj.prototype.attributesData[attr]);
			}
		} else {
			//script creation on parse script into the editor
			const script: any = pc.registerScript(obj, obj.name);
			for (const attr in obj.prototype.attributesData) {
				script.attributes.add(attr, obj.prototype.attributesData[attr]);
			}
		}
	};
}

export function attrib<T>(params: TAttributeParams): any {
	return function (target: ScriptTypeBase, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): any {
		//create a clean copy of parent attribute
		//without this, if we extend a class, the children would alter the parent attributes
		target.constructor.prototype.attributesData = Object.assign(
			{},
			target.constructor.prototype.attributesData || {}
		);

		if (!target.attributesData) {
			target.attributesData = {};
		}
		//transform an enum into a playcanvas enum type [{name:value},...]
		if (params.enum) {
			if (!Array.isArray(params.enum)) {
				params.enum = Object.keys(params.enum).map((e) => {
					return { [e]: e };
				});
			}
		}
		//do the same transformation to the enums of schemas
		if (params.schema) {
			for (const schema of params.schema) {
				if (schema.enum) {
					schema.enum = Object.keys(schema.enum).map((e) => {
						return { [e]: e };
					});
				}
			}
		}
		target.attributesData[propertyKey] = params;
	};
}
