const test = require('ava');
const proxyquire = require('proxyquire');

let registedCompiler = null;
let registedOpts = null;

test.before('Proxy modules pirates and source-map-support', t => {
	t.context = proxyquire('../dist/bast', {
		'pirates': {
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

let installedSourceMap = false;


test('Compiler hook is register with correct options.', t => {
	t.plan(2);

	const uninstall = t.context.install({ extensions: ['.ts'] });

	t.assert(registedOpts.exts.length > 0, 'Extensions are registered');
	t.is(registedOpts.exts[0], '.ts');

	uninstall();
});

test.todo('Cache is correctly loaded');
test.todo('Source map is installed.');
test.todo('Source code is transfomed with babel compiler');
