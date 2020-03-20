const test = require('ava');
const proxyquire = require('proxyquire');
const fs = require('fs');
const path = require('path');
const fixtures_dir = path.resolve(__dirname, './__fixture__');

let registedCompiler = null;
let registedOpts = null;
let installedSourceMap = false;

test.before('Proxy modules pirates and source-map-support', t => {
	t.context = proxyquire('../dist/bast', {
		pirates: {
			addHook: (currentCompiler, opts) => {
				registedCompiler = currentCompiler;
				registedOpts = opts;

				return () => {
					registedCompiler = null;
					registedOpts = null;
				};
			}
		},
		'source-map-support': {
			install() {
				installedSourceMap = true;
			}
		}
	});
});

test('Compiler hook is register with correct options.', t => {
	t.plan(2);

	const uninstall = t.context.install({ extensions: ['.ts'] });

	t.assert(registedOpts.exts.length > 0, 'Extensions are registered');
	t.is(registedOpts.exts[0], '.ts');

	uninstall();
});

test.todo('Cache is correctly loaded');

test('Source map is installed.', t => {
	t.plan(1);

	const uninstall = t.context.install({
		extensions: ['.ts'],
		sourceMaps: true
	});
	const code = fs.readFileSync(
		path.join(fixtures_dir, 'tobe-parsed.js'),
		'utf8'
	);
	registedCompiler(code, 'tobe-parsed.js');

	t.true(installedSourceMap, 'Source map is installed');
	uninstall();
});

test('Source code is transfomed with babel compiler', t => {
	t.plan(2);

	const uninstall = t.context.install({
		extensions: ['.ts'],
		sourceMaps: false,
		babelrc: false,
		presets: ['@babel/preset-env']
	});
	const code = fs.readFileSync(
		path.join(fixtures_dir, 'tobe-parsed.js'),
		'utf8'
	);
	const babelCode = registedCompiler(code, 'single-import');

	t.false(!installedSourceMap, 'Source map is installed');
	t.is(
		babelCode,
		`"use strict";

var test = true;`,
		'Code is correctly parsed'
	);
	uninstall();
});
