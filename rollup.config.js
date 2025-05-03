// rollup.config.js (CORRIGÉ - Lecture package.json via fs)

import fs from 'node:fs'; // Utiliser node: préfixe
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

// --- CORRECTION : Lecture package.json via fs ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
// --- FIN CORRECTION ---

// Point d'entrée
const input = 'src/index.js';

// Config Babel
const babelConfig = {
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
    presets: ['@babel/preset-env']
};

// Dépendances Externes (pour éviter les warnings Node builtins / tailwind dans les bundles)
const externalDeps = [
    /^node:/, // Exclut node:fs, node:path etc.
    'tailwindcss/resolveConfig.js' // Exclut l'import dynamique de tailwind
];

export default [
    // 1. Build CommonJS (pour Node)
    {
        input: input,
        output: { file: pkg.main, format: 'cjs', sourcemap: true, exports: 'named' },
        external: externalDeps, // <-- Doit être présent
        plugins: [ resolve(), commonjs(), babel(babelConfig) ]
    },
    // 2. Build ES Module (pour bundlers / Node moderne)
    {
        input: input,
        output: { file: pkg.module, format: 'es', sourcemap: true },
        external: externalDeps, // <-- Doit être présent
        plugins: [ resolve(), commonjs(), babel(babelConfig) ]
    },
    // 3. Build UMD (pour navigateurs via <script>)
    {
        input: input,
        output: { file: pkg.browser, format: 'umd', name: 'DynSJS', sourcemap: true, globals: {}, exports: 'named' },
        external: externalDeps, // <-- Doit être présent
        plugins: [ resolve(), commonjs(), babel(babelConfig) ]
    },
     // 4. Build UMD Minifié (pour production navigateur)
    {
        input: input,
        output: { file: pkg.browser.replace('.js', '.min.js'), format: 'umd', name: 'DynSJS', sourcemap: true, globals: {}, exports: 'named' },
        external: externalDeps, // <-- Doit être présent
        plugins: [ resolve(), commonjs(), babel(babelConfig), terser() ]
    }
];