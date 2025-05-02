// rollup.config.js CORRIGÉ
import fs from 'fs'; // Ajout de l'import fs
import path from 'path'; // Ajout de l'import path
import { fileURLToPath } from 'url'; // Ajout de l'import url

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

// Remplacement de l'ancien import 'pkg' par la lecture manuelle
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));

// Supposons que vos fichiers sources sont dans src/ et que src/index.js exporte l'API publique
const input = 'src/index.js'; // Adaptez si votre point d'entrée est ailleurs

// Configuration des plugins Babel (important pour @rollup/plugin-babel)
const babelConfig = {
    babelHelpers: 'bundled', // Inclut les helpers Babel dans le bundle
    exclude: 'node_modules/**', // Ne pas transpiler les dépendances
    presets: ['@babel/preset-env'] // Utilise votre preset existant
};

export default [
    // 1. Build CommonJS (pour Node)
    {
        input: input,
        output: {
            file: pkg.main, // Lit le chemin depuis package.json -> "dist/dynsjs.cjs.js"
            format: 'cjs', // Format CommonJS
            sourcemap: true, // Générer les source maps
            exports: 'named' // Exporter les membres nommés (StyleSheet, Color, etc.)
        },
        plugins: [
            resolve(),
            commonjs(),
            babel(babelConfig)
        ]
    },

    // 2. Build ES Module (pour les bundlers modernes comme Vite, Webpack >= 2)
    {
        input: input,
        output: {
            file: pkg.module, // Lit le chemin depuis package.json -> "dist/dynsjs.esm.js"
            format: 'es', // Format ES Module
            sourcemap: true
        },
        plugins: [
            resolve(),
            commonjs(),
            babel(babelConfig) // Transpilation toujours utile pour la compatibilité
        ]
    },

    // 3. Build UMD (pour les navigateurs via <script>, et anciens bundlers)
    {
        input: input,
        output: {
            file: pkg.browser, // Lit le chemin depuis package.json -> "dist/dynsjs.umd.js"
            format: 'umd', // Format UMD
            name: 'DynSJS', // Nom de la variable globale si chargée via <script>
            sourcemap: true,
            globals: {
                // Spécifiez ici les dépendances externes si nécessaire
                // exemple: 'react': 'React'
            },
             exports: 'named' // Exporter les membres nommés
        },
        plugins: [
            resolve(),
            commonjs(),
            babel(babelConfig)
            // Pas de terser ici, on crée une version minifiée séparée (voir ci-dessous)
        ]
    },
     // 4. Build UMD Minifié (pour la production en navigateur)
    {
        input: input,
        output: {
            file: pkg.browser.replace('.js', '.min.js'), // ex: "dist/dynsjs.umd.min.js"
            format: 'umd',
            name: 'DynSJS',
            sourcemap: true, // C'est bien d'avoir une sourcemap même pour le minifié
            globals: {},
             exports: 'named'
        },
        plugins: [
            resolve(),
            commonjs(),
            babel(babelConfig),
            terser() // Appliquer la minification ici
        ]
    }
];