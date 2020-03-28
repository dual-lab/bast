const test = require('ava');
const proxyquire = require('proxyquire');
const { tmpdir } = require('os');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const { use } = require('../dist/bast');
const fixtures_dir = path.resolve(__dirname, './__fixture__');
const cache_dir = path.join(
	path.resolve(__dirname, '../node_modules'),
	'.cache',
	'@dual-lab'
);

test.before('Clean up cache directory', t => {
	rimraf.sync(cache_dir);
});

test.beforeEach('Proxy modules pirates and source-map-support', t => {
	t.context = proxyquire('../dist/bast', {
		pirates: {
			addHook: (currentCompiler, opts) => {
				t.context.registedCompiler = currentCompiler;

				return () => {
					t.context.registedCompiler = null;
				};
			}
		},
		'source-map-support': {
			install() {}
		},
		'find-cache-dir': _ => {
			t.context.cacheDir = path.join(cache_dir, `bast`);
			return t.context.cacheDir;
		}
	});
});

test(
	'Cache registry is not initialized if cache option is false.',
	cacheisNotInitialized
);

test('Cache registry directory is created.', cacheisInitialized);

test.serial('Cache registry is correctly saved.', cacheisSaved);

test.serial('Cache registry is correctly loaded.', cacheisLoadedCorrectly);

//
// Test macro
//
function cacheisNotInitialized(t) {
	t.plan(1);
	const uninstall = t.context.install({
		extensions: ['.js'],
		cache: false
	});

	compileCode(t.context.registedCompiler);

	t.is(t.context.cacheDir, undefined, 'Cache directory is not created');

	uninstall();
}

function cacheisInitialized(t) {
	t.plan(1);
	const uninstall = t.context.install({
		extensions: ['.js'],
		cache: true
	});

	compileCode(t.context.registedCompiler);

	t.true(
		fs.statSync(t.context.cacheDir).isDirectory(),
		'Cache directory is created'
	);

	uninstall();
}

function cacheisSaved(t) {
	t.plan(2);
	const uninstall = t.context.install({
		extensions: ['.js'],
		cache: true
	});

	compileCode(t.context.registedCompiler);
	uninstall();

	t.true(
		fs.statSync(t.context.cacheDir).isDirectory(),
		'Cache directory is created'
	);

	return waitSetImmidiateExecution().then(() => {
		t.true(
			fs.readdirSync(t.context.cacheDir).length === 1,
			'Cache directory is not empty'
		);
	});
}

function cacheisLoadedCorrectly(t) {
	t.plan(3);
	const uninstall = t.context.install({
		extensions: ['.js'],
		cache: true
	});

	const code = compileCode(t.context.registedCompiler);
	uninstall();

	t.true(
		fs.statSync(t.context.cacheDir).isDirectory(),
		'Cache directory is created'
	);

	const cacheFile = fs.readdirSync(t.context.cacheDir)[0];
	const cachedJson = fs.readFileSync(path.join(t.context.cacheDir, cacheFile), 'utf8');
	let cachedCode = null;

	t.notThrows(() => cachedCode = JSON.parse(cachedJson), 'Json cache is correctly parsed');
	t.is(code, Object.values(cachedCode)[0].code, 'Code compiled is taken from cache');
}
//
// helper function
//
function compileCode(registedCompiler) {
	const code = fs.readFileSync(
		path.join(fixtures_dir, 'tobe-parsed.js'),
		'utf8'
	);

	return registedCompiler(code, path.join(fixtures_dir, 'tobe-parsed.js'));
}

function waitSetImmidiateExecution() {
	return new Promise((r, _) => setTimeout(() => r(), 0));
}
