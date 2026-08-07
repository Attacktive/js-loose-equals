import js from '@eslint/js';
import globals from 'globals';

export default [
	js.configs.recommended,
	{
		files: ['index.js', 'scripts/**/*.js'],
		languageOptions: {
			sourceType: 'script',
			globals: globals.browser
		}
	},
	{
		files: ['index.js'],
		languageOptions: {
			globals: {
				giveExamples: 'readonly',
				format: 'readonly'
			}
		}
	},
	{
		files: ['tests/**/*.js'],
		languageOptions: {
			sourceType: 'commonjs',
			globals: {
				...globals.node,
				giveExamples: 'readonly',
				format: 'readonly'
			}
		}
	}
];
