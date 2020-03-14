module.exports = {
	presets: [
		[
			"@babel/preset-env",
			{
				modules: false,
				targets: {
					node: 12
				}
			}
		]
	],
	plugins: ["@babel/plugin-proposal-export-default-from"]
};
