import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';

export default [
    {
        input: 'src/_main.js',
        output: {
            file: 'build/js/menumenu.js',
            format: 'iife',
            name: 'menumenu',
        },
        plugins: [
            babel({exclude: 'node_modules/**'}),
            resolve(),
        ],
        watch: {
            include: 'src/**',
        },
    },
    {
        input: 'src/_main.js',
        output: {
            file: 'build/js/menumenu.min.js',
            format: 'iife',
            name: 'menumenu',
        },
        plugins: [
            babel({exclude: 'node_modules/**'}),
            resolve(),
            uglify(),
        ],
        watch: {
            include: 'src/**',
        },
    },
    {
        input: 'src/_main.js',
        output: {
            file: 'build/js/menumenu.nodeps.js',
            format: 'iife',
            name: 'menumenu',
            globals: {
                'dominoob/src/_main': 'dominoob',
            },
        },
        external: ['dominoob/src/_main'],
        plugins: [
            babel({exclude: 'node_modules/**'}),
        ],
        watch: {
            include: 'src/**',
        },
    },
    {
        input: 'src/_main.js',
        output: {
            file: 'build/js/menumenu.nodeps.min.js',
            format: 'iife',
            name: 'menumenu',
            globals: {
                'dominoob/src/_main': 'dominoob',
            },
        },
        external: ['dominoob/src/_main'],
        plugins: [
            babel({exclude: 'node_modules/**'}),
            uglify(),
        ],
        watch: {
            include: 'src/**',
        },
    },
    {
        input: 'src/_main.js',
        output: {
            file: 'index.js',
            format: 'cjs',
        },
        plugins: [
            babel({exclude: 'node_modules/**'}),
            resolve(),
        ],
        watch: {
            include: 'src/**',
        },
    },
];
