import { resolve } from "path";
import { addHook } from "pirates";

import compileHookWrapper from "./compile";

let revertHook = () => {
	return;
};
let cacheStore = {};

/**
 * install babel jit transpiler hook
 * @return {() =? void} unistall function
 */
export default function install(opts = {}) {
	const options = { ...opts };

	const { cache, extensions } = options;

	//TODO: add hook call registsation
	//TODO: add cache implementation

	// Remove not babel options
	delete options.extensions;
	delete options.cache;

	options.caller = {
		name: "@dual-lab/bast",
		...(options.caller || {})
	};
	// TODO: try to guess current directory.
	const cwd = options.cwd || ".";

	const resolveCwd = (options.cwd = resolve(cwd));

	if (!options.only || options.only.length === 0) {
		options.only = [new RegExp(`^${resolveCwd}`, "i")];
	}

	revertHook = addHook(compileHookWrapper(options, cacheStore), {
		exts: extensions,
		ignoreNodeModules: true
	});

	return () => revertHook();
}
