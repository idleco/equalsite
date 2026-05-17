import globals from 'globals';
import base from './base.js';

export default [
    ...base,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },

        rules: {
            /** Async Safety */
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/no-misused-promises': [
                'error',
                {
                    checksVoidReturn: false,
                },
            ],
            '@typescript-eslint/require-await': 'error',
            '@typescript-eslint/return-await': [
                'error',
                'always',
            ],
        },
    },
];
