import { resolve } from 'path';
import { addHook } from 'pirates';
import { DEFAULT_EXTENSIONS } from '@babel/core';

import compileHookWrapper from './compile';
import useCacheRegistry from '../optimization/cache';

let revertHook = () => {
	return;
};

/**
 * install babel jit transpiler hook
 * @return {() => void} unistall function
 */
export default function install(opts = {}) {
	const options = { ...opts };

	const { cache, extensions = DEFAULT_EXTENSIONS } = options;

	const [cacheRegistry] = useCacheRegistry(!options.cache);

	// Remove not babel options
	delete options.extensions;
	delete options.cache;

	options.caller = {
		name: '@dual-lab/bast',
		...(options.caller || {})
	};
	// TODO: try to guess current directory.
	const cwd = options.cwd || '.';

	const resolveCwd = (options.cwd = resolve(cwd));

	if (!options.only || options.only.length === 0) {
		options.only = [new RegExp(`^${resolveCwd}`, 'i')];
	}

	revertHook = addHook(compileHookWrapper(options, cacheRegistry), {
		exts: extensions,
		ignoreNodeModules: true
	});

	return revertHook;
}
