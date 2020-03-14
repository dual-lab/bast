const identity = source => source;

export default function babelImportSourceReplace({ types: t }) {
	return {
		visitor: {
			ImportDeclaration(path, state) {
				const replace = state.opts.importSourceReplace || identity;
				const oldSource = path.node.source.value;
				const newSource = replace(oldSource);

				if (newSource === oldSource) return;

				path.replaceWith(
					t.importDeclaration(
						path.node.specifiers,
						t.stringLiteral(replacedSource)
					)
				);
			}
		}
	};
}
