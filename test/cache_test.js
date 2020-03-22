const test = require('ava');
const proxyquire = require('proxyquire');
const { tmpdir } = require('os');
const path = require('path');
const fs = require('fs');
const findCacheDir = require('find-cache-dir');
const { use } = require('../dist/bast');
const fixtures_dir = path.resolve(__dirname, './__fixture__');

let registedCompiler = null;

test.before('Proxy modules pirates and source-map-support', t => {
	t.context = proxyquire('../dist/bast', {
		pirates: {
			addHook: (currentCompiler, opts) => {
				registedCompiler = currentCompiler;

				return () => {
					registedCompiler = null;
					registedOpts = null;
				};
			}
		},
		'source-map-support': {
			install() {}
		}
	});
	t.context.cacheDir = findCacheDir({ name: '@dual-lab/bast' }) || tmpdir();
});

test(
	'Cache registry is not initialized if cache option is false.',
	cacheisNotInitialized
);

test.todo('Cache registry directory is created.');

test.todo(
	'Cache registry is disabled if something went wrong on initialitation.'
);

test.todo('Cache registry is correctly saved.');

test.todo('Cache registry is correctly loaded.');

test.afterEach.always(t => {
	// TODO remove cache directory
});

//
// Test macro
//
function cacheisNotInitialized(t) {
	t.plan(1);
	const uninstall = t.context.install({
		extensions: ['.js'],
		cache: false
	});

	compileCode();

	t.throws(
		() => fs.statSync(t.context.cacheDir),
		{ code: 'ENOENT' },
		'Cache directory is not created'
	);

	uninstall();
}

//
// helper function
//
function compileCode() {
	const code = fs.readFileSync(
		path.join(fixtures_dir, 'tobe-parsed.js'),
		'utf8'
	);

	registedCompiler(code, 'fake-file');
}
