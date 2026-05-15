import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],

        languageOptions: {

            parserOptions: {
                projectService: true,
                tsconfigRootDir: process.cwd(),
            },

            globals: {
                ...globals.node,
            },
        },

        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },

    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'eslint.config.js',
        ],
    },
];
