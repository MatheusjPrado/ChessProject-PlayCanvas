export type TAttributeType =
	| "boolean"
	| "number"
	| "string"
	| "json"
	| "asset"
	| "entity"
	| "rgb"
	| "rgba"
	| "vec2"
	| "vec3"
	| "vec4"
	| "curve";

export type TAssetType =
	| "animation"
	| "audio"
	| "binary"
	| "cubemap"
	| "css"
	| "font"
	| "json"
	| "html"
	| "material"
	| "model"
	| "script"
	| "shader"
	| "text"
	| "texture"
	| "template";

export type TJsonAttributeSchemaProp = Omit<TAttributeParams, "schema"> & { name: string };

// A duplicate copy of the inline type definition in Playcanvas attributes.add(param1...)
export type TAttributeParams = {
	type: TAttributeType;
	default?: any;
	title?: string;
	description?: string;
	placeholder?: string | string[];
	array?: boolean;
	size?: number;
	min?: number;
	max?: number;
	precision?: number;
	step?: number;
	assetType?: string;
	curves?: string[];
	color?: string;
	enum?: object[] | object;
	schema?: TJsonAttributeSchemaProp[];
};
