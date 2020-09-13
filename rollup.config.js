import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';

import { main, module, dependencies, peerDependencies } from './package.json';

const pkgExternal = []
	.concat(Object.keys(dependencies))
	.concat(Object.keys(peerDependencies));

export default {
	input: 'src/public-api.js',
	external: [...pkgExternal, 'lodash/fp', 'path', 'fs'],
	output: [
		{ file: main, format: 'cjs' },
		{ file: module, format: 'es' }
	],
	plugins: [
		json(),
		babel({
			exclude: ['node_modules/**']
		})
	]
};
