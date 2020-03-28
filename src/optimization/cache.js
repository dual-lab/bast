import findCacheDir from 'find-cache-dir';
import { join } from 'path';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import * as babel from '@babel/core';

let data = {};
let cacheDisabled = false;

/**
 * Implement cache registry functionalities:
 * - getting data stored into cache
 * - check if a record is present
 * - store a new record
 */
class CacheRegistry {
	/**
	 * Return record in cache
	 * @param  {string} key
	 * @return {any}    cached record
	 */
	getRecord(key) {
		return data[key];
	}
	/**
	 * Check if a key as a matching record
	 * @param  {string}  key
	 * @return {Boolean} true is present false otherwise
	 */
	hasRecord(key) {
		return !!data[key];
	}
	/**
	 * Cache a new record
	 * @param  {string} key
	 * @param  {any} value
	 * @return {any} value
	 */
	storeRecord(key, value) {
		data[key] = value;
		return value;
	}
	/**
	 * Clear the cache
	 * @return {void}
	 */
	clear() {
		Object.keys(data).forEach(k => delete data[k]);
		data = {};
	}
	/**
	 * True if cache is disabled
	 * @return {[type]}
	 */
	get disabled() {
		return cacheDisabled;
	}
}

function saveCache(filename) {
	if (cacheDisabled) {
		return;
	}
	let cacheSerialized = '{}';
	try {
		cacheSerialized = JSON.stringify(data, null, ' ');
	} catch (e) {
		console.warn(
			`Error on serializing cache: ${e.message}. Cache will be cleared`
		);
	}

	try {
		writeFileSync(filename, cacheSerialized, 'utf-8');
	} catch (e) {
		handleWriteFSError(e, filename, true);
	}
}

/**
 * Init cache registry implementation
 * @param  {boolean} true return a noop implemantation
 * @return {Array} [CacheRegistry implemantation]
 */
export default function useCacheRegistry(noop) {
	if (noop) {
	} else {
		const cacheDir =
			findCacheDir({ name: '@dual-lab/bast' }) || os.tmpdir();
		const filenameCache = join(
			cacheDir,
			`.bast.withBabel-${babel.version}.${babel.getEnv()}.json`
		);

		data = {};

		try {
			mkdirSync(cacheDir, { recursive: true });
		} catch (e) {
			handleWriteFSError(e, dirOrFilename);
		}

		process.once('exit', () => saveCache(filenameCache));
		setImmediate(() => saveCache(filenameCache));

		try {
			const content = readFileSync(filenameCache, 'utf8');
			data = JSON.parse(content);
		} catch (e) {
			switch (e.code) {
				case 'EACCES':
					console.warn(
						`Cache will be disabled. ${filenameCache} is not readable.`
					);
					cacheDisabled = true;
					break;
				default:
					break;
			}
		}
	}

	return [new CacheRegistry()];
}

function handleWriteFSError(e, dirOrFilename, reThrowAtDefault) {
	switch (e.code) {
		case 'EACCES':
			console.warn(
				`Cache will be disabled. ${dirOrFilename} could not be created on a readonly filesystem.`
			);
			cacheDisabled = true;
			break;
		case 'ENOENT':
		case 'EACCES':
		case 'EPERM':
			console.warn(
				`Cache will be disabled. ${dirOrFilename} could not be created due to permission iusse.`
			);
			cacheDisabled = true;
			break;
		default:
			if (reThrowAtDefault) throw e;
			break;
	}
}
