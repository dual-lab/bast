import json from "@rollup/plugin-json";
import babel from "rollup-plugin-babel";

import { main, module } from "./package.json";

export default {
	input: "src/public-api.js",
	external: ["@babel/core","pirates", "source-map-support", 'lodash/fp', "path"],
	output: [
		{ file: main, format: "cjs" },
		{ file: module, format: "es" }
	],
	plugins: [
		json(),
		babel({
			exclude: ["node_modules/**"]
		})
	]
};
