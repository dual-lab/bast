import { statSync } from 'fs';

let differAlgo = null;

export default function hashValue(file, code) {
	if (differAlgo === null) {
		differAlgo = createDifferAlgo();
	}

	return differAlgo(file, code);
}

function createDifferAlgo() {
	try {
		const { createHash } = require('crypto');
		const md5 = createHash('md5');
		return (file, code) => {
			md5.update(code);
			return md5.digest('hex');
		};
	} catch (e) {
		// Fallback to timestamo change
		return file => +statSync(file).mtime;
	}
}
