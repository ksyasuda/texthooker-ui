module.exports = {
	root: true,
	extends: ['plugin:@typescript-eslint/recommended', 'eslint:recommended', 'prettier'],
	plugins: ['svelte3', '@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
	},
	rules: {
		'no-unused-vars': 'off',
		'no-undef': 'off',
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	settings: {
		'svelte3/typescript': () => require('typescript'),
	},
	overrides: [
		{ files: ['*.svelte'], processor: 'svelte3/svelte3' },
		{ files: ['*.d.ts'], rules: { '@typescript-eslint/no-unused-vars': 'off' } },
	],
};
