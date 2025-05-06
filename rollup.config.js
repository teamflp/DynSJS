// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' with { type: 'json' };

const input = 'src/index.ts';

const externalDeps = [];

export default [
    // 1. Build CommonJS
    {
        input: input,
        output: { file: pkg.main, format: 'cjs', sourcemap: true, exports: 'named' },
        external: externalDeps,
        plugins: [
            resolve(),
            commonjs(),
            typescript({ 
                tsconfig: './tsconfig.json',
                declaration: true,
                declarationDir: 'dist/js/types'
            })
        ]
    },
    // 2. Build ES Module
    {
        input: input,
        output: { file: pkg.module, format: 'es', sourcemap: true },
        external: externalDeps,
        plugins: [
            resolve(),
            commonjs(),
            typescript({ 
                tsconfig: './tsconfig.json',
                declaration: true,
                declarationDir: 'dist/js/types'
            })
        ]
    },
    // 3. Build UMD
    {
        input: input,
        output: { file: pkg.browser, format: 'umd', name: 'DynSJS', sourcemap: true, globals: {}, exports: 'named' },
        external: externalDeps,
        plugins: [
            resolve(),
            commonjs(),
            typescript({ 
                tsconfig: './tsconfig.json',
                declaration: true,
                declarationDir: 'dist/js/types'
            })
        ]
    },
    // 4. Build UMD Minifié
    {
        input: input,
        output: { file: pkg.browser.replace('.js', '.min.js'), format: 'umd', name: 'DynSJS', sourcemap: true, globals: {}, exports: 'named' },
        external: externalDeps,
        plugins: [
            resolve(),
            commonjs(),
            typescript({ 
                tsconfig: './tsconfig.json',
                declaration: true,
                declarationDir: 'dist/js/types'
            }),
            terser()
        ]
    }
];