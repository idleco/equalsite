import base from './base.js';

import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    ...base,

    {
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooks,
        },

        settings: {
            react: {
                version: 'detect',
            },
        },

        rules: {
            'react/react-in-jsx-scope': 'off',
            'react-hooks/rules-of-hooks': 'error',
        },
    },
];
