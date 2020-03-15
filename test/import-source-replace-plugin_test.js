const test = require('ava');
const path = require('path');
const { transformFileSync } = require('@babel/core');
const traverse = require('@babel/traverse').default;
const fixtures_dir = path.resolve(__dirname, './__fixture__');
const fixtures = [
	path.join(fixtures_dir, 'single-import.js'),
	path.join(fixtures_dir, 'single-import.ts')
];

const { babelImportSourceReplace } = require('../dist/bast');

test(
	'option importSourceReplace must be a function',
	throwOnWrongOption,
	fixtures[0],
	Error
);

test(
	'Leave imports untouched with default configuration.',
	leaveImportUntouchedByDefault,
	fixtures[0]
);

test(
	'Replaced import source passed into the plugin configuration',
	modifyMacthingImportSource,
	fixtures[0],
	'../local-replaced',
	transformFixture
);

test(
	'Replaced import ts source passed into the plugin configuration',
	modifyMacthingImportSource,
	fixtures[1],
	'../local-replaced',
	(file, opts) => transformFixture(file, opts, ['@babel/preset-typescript'])
);

//
// Macro test helper functions
//

function throwOnWrongOption(t, fixtureFile, expected) {
	t.plan(2);
	const error = t.throws(
		() => {
			transformFixture(fixtureFile, {
				importSourceReplace: {}
			});
		},
		{ instanceOf: expected }
	);
	t.assert(
		error.message.includes('(source: string)=> string'),
		'type hint is present'
	);
}

function leaveImportUntouchedByDefault(t, fixtureFile) {
	t.plan(1);
	const { ast } = transformFixture(fixtureFile, undefined);

	traverse(ast, {
		ImportDeclaration(path) {
			t.assert(
				path.node.source.value.includes('replaceMe'),
				'Import is not replaced by default.'
			);
		}
	});
}

function modifyMacthingImportSource(t, fixtureFile, expected, transform) {
	t.plan(1);
	const { ast } = transform(fixtureFile, {
		importSourceReplace: () => expected
	});

	traverse(ast, {
		ImportDeclaration(path) {
			t.is(path.node.source.value, expected);
		}
	});
}
//
// Babel transform helper
//

function transformFixture(file, opts, presets) {
	return transformFileSync(file, {
		ast: true,
		presets,
		babelrc: false,
		plugins: [[babelImportSourceReplace, opts]]
	});
}
