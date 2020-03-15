import { cloneDeep } from 'lodash/fp';
import { loadOptions, transformSync } from '@babel/core';
import sourceMapSupport from 'source-map-support';

import { dirname } from 'path';

let sourceMapStore = {};

/**
 * compileHook - hook that transpile js code using babel
 * @return {[type]} [description]
 */
export default function compileHookWrapper(transformOpts, cache = {}) {
	let initSourceMap = true;

	return (code, filename) => {
		const opts = loadOptions({
			sourceRoot: dirname(filename),
			...cloneDeep(transformOpts),
			filename
		});

		// TODO: add cache logic
		let compiled = null;
		compiled = transformSync(code, {
			...opts,
			sourceMaps:
				opts.sourceMaps === undefined ? 'both' : opts.sourceMaps,
			ast: false
		});

		if (compiled.map) {
			if (initSourceMap) {
				initSourceMap = false;
				initializeSourceMaps();
			}
			sourceMapStore[filename] = compiled.map;
		}

		return compiled.code;
	};
}

function initializeSourceMaps() {
	sourceMapSupport.install({
		handleUncaughtExceptions: false,
		environment: 'node',
		retrieveSourceMap(source) {
			const map = sourceMapStore && sourceMapStore[source];
			if (map) {
				return {
					url: null,
					map: map
				};
			} else {
				return null;
			}
		}
	});
}
