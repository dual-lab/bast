import { cloneDeep } from 'lodash/fp';
import { loadOptions, transformSync } from '@babel/core';
import sourceMapSupport from 'source-map-support';

import { dirname } from 'path';
import * as babel from '@babel/core';

import hashValue from '../optimization/file-content-differ';

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
		const cacheKey = `${JSON.stringify(opts)}:${
			babel.version
		}:${babel.getEnv()}`;
		let compiled = cache.getRecord(cacheKey);
		let newHashvalue = null;

		if (
			!compiled ||
			compiled.hash !== (newHashvalue = hashValue(filename, code))
		) {
			compiled = transformSync(code, {
				...opts,
				sourceMaps:
					opts.sourceMaps === undefined ? 'both' : opts.sourceMaps,
				ast: false
			});
			if (cache.disabled === false) {
				compiled.hash = newHashvalue;
				cache.storeRecord(cacheKey, compiled);
			}
		}

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
