/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const IntegrationPlugin = require("./webpack-plugin/integration-plugin");

module.exports = {
	entry: "./src/index.ts",
	mode: "production",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
		plugins: [new TsconfigPathsPlugin()],
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					keep_classnames: true,
				},
			}),
		],
	},
	output: {
		filename: "Scripts.js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
	},
	plugins: [
		new IntegrationPlugin(process.env.PATH_TO_REACT),
		new CopyPlugin({
			patterns: [
				{
					from: "src/**/*.*[!ts,!tsx]",
					to({ context, absoluteFilename }) {
						return path.relative(context, absoluteFilename).replace(/src\/|src\\/g, "");
					},
					noErrorOnMissing: true,
				},
			],
		}),
	],
};
