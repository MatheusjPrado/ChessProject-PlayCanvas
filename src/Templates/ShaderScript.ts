import { attrib, createScript } from "@/Configuration/createScriptDecorator";
import { ScriptTypeBase } from "@/Types/ScriptTypeBase";
import { Asset, Color, Material, RenderComponent, Shader, Texture, Vec2 } from "playcanvas";

@createScript()
export class ShaderScript extends ScriptTypeBase {
	@attrib({
		title: "vertexShader",
		type: "asset",
		assetType: "shader",
		description: "vertex shader",
	})
	vertexShader: Asset;
	@attrib({
		title: "fragmentShader",
		type: "asset",
		assetType: "shader",
		description: "fragment shader",
	})
	fragmentShader: Asset;

	uniforms: { [key: string]: number | number[] | Texture };
	attributes: { [key: string]: string };
	shader: Shader;
	material: Material;

	initialize() {
		// A shader definition used to create a new shader.
		const shaderDefinition = {
			attributes: this.attributes,
			vshader: this.vertexShader.resource,
			fshader: this.fragmentShader.resource,
		};

		// Create the shader from the definition
		this.shader = new pc.Shader(this.app.graphicsDevice, shaderDefinition);

		// Create a new material and set the shader
		this.material = new pc.Material();
		this.material.shader = this.shader;

		for (const key in this.uniforms) {
			this.material.setParameter(key, this.uniforms[key]);
		}

		this.changeMaterial(this.rendersToChange());
	}

	rendersToChange() {
		return this.entity.findComponents("render") as RenderComponent[];
	}

	changeMaterial(renders: RenderComponent[]) {
		// Replace the material on the model with our new material
		for (let i = 0; i < renders.length; ++i) {
			const meshInstances = renders[i].meshInstances;
			for (let j = 0; j < meshInstances.length; j++) {
				meshInstances[j].material = this.material;
			}
		}
	}

	addUniformListener(uniformName: string) {
		const onChange = (value: any) => {
			if (value.constructor.name == Color.name) {
				value = value.data3;
			}
			if (value.constructor.name == Vec2.name) {
				value = [value.x, value.y];
			}
			if (value.constructor.name == Asset.name) {
				value = value.resource;
			}

			this.material.setParameter(uniformName, value);
		};
		this.on(`attr:${uniformName}`, onChange);
	}
}
