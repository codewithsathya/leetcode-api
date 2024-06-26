// eslint-disable-next-line no-undef
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	rules: {
		'@typescript-eslint/explicit-module-boundary-types': [
			'error',
			{ allowArgumentsExplicitlyTypedAsAny: true },
		],
	},
};
