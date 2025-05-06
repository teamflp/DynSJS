/**
 * Ce script compile les styles CSS en UTILISANT la bibliothèque DynSJS compilée.
 * Il peut optionnellement charger et fusionner la config Tailwind AVANT d'instancier StyleSheet.
 * Il applique ensuite Autoprefixer via PostCSS et écrit le résultat dans un fichier.
 */

// --- CORRECTION : Plus besoin de themeHelper ici, mais deepMerge reste utile ---
import { StyleSheet, Color, deepMerge } from './dist/js/index.js'; // ou './src/index.js'

// Imports Node.js et PostCSS
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

// Import pour charger resolveConfig (utilise require via createRequire)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let resolveConfig = null;
try {
    resolveConfig = require('tailwindcss/resolveConfig');
} catch (e) {
    console.warn("DynSJS/compileStyles: Could not require('tailwindcss/resolveConfig'). Is 'tailwindcss' installed?", e);
}

// --- Configuration Principale ---
const USE_TAILWIND = true; // Mettre à true pour charger tailwind.config.js
const OUTPUT_DIR = './dist/demo';
const OUTPUT_FILE = 'styles.css';
const TAILWIND_CONFIG_PATH = './tailwind.config.cjs';
const USER_DYNSJS_THEME = { // Thème spécifique à DynSJS (prioritaire)
    custom: { fallbackColor: 'grey' }
};

// --- Fonction Principale Async ---
async function buildStyles() {
    console.log("Préparation du thème...");
    let themeFromTailwind = {};
    // --- Chargement de la config Tailwind ---
    if (USE_TAILWIND && resolveConfig) {
        const fullConfigPath = path.resolve(process.cwd(), TAILWIND_CONFIG_PATH);
        if (fs.existsSync(fullConfigPath)) {
            try {
                console.log(`Chargement de la config Tailwind depuis ${fullConfigPath}...`);
                const userTailwindConfig = require(fullConfigPath); // require car .cjs
                const fullTailwindConfig = resolveConfig(userTailwindConfig);
                if (fullTailwindConfig?.theme) {
                    themeFromTailwind = fullTailwindConfig.theme;
                    console.log("Thème Tailwind résolu.");
                } else { console.warn("Aucun objet 'theme' trouvé dans la config Tailwind résolue."); }
            } catch (e) { console.error(`Erreur lors du chargement/résolution de la config Tailwind :`, e); }
        } else { console.warn(`Fichier de config Tailwind non trouvé: ${fullConfigPath}`); }
    } else if (USE_TAILWIND && !resolveConfig) { console.warn("Chargement du thème Tailwind ignoré: resolveConfig non chargé."); }

    // Fusion finale
    const finalTheme = deepMerge(deepMerge({}, themeFromTailwind), USER_DYNSJS_THEME);

    // Création StyleSheet
    console.log("Initialisation de StyleSheet avec le thème final...");
    const sheet = new StyleSheet(finalTheme);

    // --- Définition des Styles ---
    console.log("Définition des règles de style...");

    sheet.rule('body', 'html').set( t => ({ // Utilisation de la fonction
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        fontFamily: t.fontFamily?.sans || '"Helvetica Neue", Arial, sans-serif', // Accès direct + fallback
        color: t.colors?.gray?.[700] || '#333', // Accès imbriqué + fallback
        backgroundColor: t.colors?.gray?.[50] || '#f9fafb',
        lineHeight: 1.6 // Valeur littérale toujours possible
    }));

    sheet.rule('.container').set( t => ({
        width: '90%',
        maxWidth: t.screens?.lg || '1024px',
        // Utilisation de template literal DANS la fonction
        margin: `${t.spacing?.['5'] || '1.25rem'} auto`,
        padding: t.spacing?.['4'] || '1rem'
    }));

    // On garde la création Color en dehors si on fait des opérations complexes
    const errorColor = Color.fromHex('#D32F2F');
    sheet.rule('.error-message').set( t => ({ // Utilise la fonction même si pas d'accès thème direct ici
        padding: '1em',
        border: `1px solid ${errorColor.operate('*', 0.8).toString()}`, // Utilise la variable externe
        backgroundColor: errorColor.operate('+', 200).operate('/', 1.2).toString(),
        color: errorColor.operate('-', 80).toString(),
        fontWeight: t.fontWeight?.bold || 'bold', // Accès thème
        borderRadius: t.borderRadius?.sm || '0.25rem' // Accès thème
    }));

    sheet.rule('.btn-primaire').set( t => ({
        display: 'inline-block',
        // Utilisation de tableau DANS la fonction (autre option pour composite)
        padding: [ t.spacing?.['2'] || '0.5rem', t.spacing?.['4'] || '1rem' ],
        backgroundColor: t.colors?.blue?.[600] || '#2563eb',
        color: t.colors?.white || '#fff',
        border: 'none',
        borderRadius: t.borderRadius?.md || '0.375rem',
        cursor: 'pointer',
        fontWeight: t.fontWeight?.medium || '500',
        transition: 'background-color 0.2s ease'
    })).nested(':hover').set( t => ({ // Fonction aussi pour les règles imbriquées
        // Création de l'instance Color à la volée ici
        backgroundColor: Color.fromHex(t.colors?.blue?.[700] || '#1d4ed8').operate('-', 20).toString() // Exemple d'opération sur couleur thème
    }));

    sheet.rule('.flex-container').set({ // Pas besoin de fonction thème si pas d'accès thème
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    });

    sheet.rule('.container').media('(max-width: 768px)').set({ width: '95%' }); // Peut aussi utiliser t => ({...}) si besoin

    sheet.keyframes('pulse', {
        '0%, 100%': { opacity: 1, transform: 'scale(1)' },
        '50%': { opacity: .6, transform: 'scale(1.05)' }
    });

    sheet.rule('.animated-box').set( t => ({ // Utilise la fonction pour accéder au thème
        width: '100px',
        height: '100px',
        backgroundColor: t.colors?.green?.[500] || 'green',
        animation: 'pulse 2s ease-in-out infinite',
        margin: t.spacing?.['4'] || '1rem'
    }));

    // --- Compilation (Synchrone) ---
    console.log("Compilation DynSJS...");
    const rawCssOutput = sheet.compile(); // Toujours synchrone
    console.log("CSS brut généré.");

    // --- Post-traitement et Écriture ---
    const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
    if (!rawCssOutput || rawCssOutput.trim() === "") { console.log("CSS vide."); return; }
    try {
        console.log("Traitement PostCSS/Autoprefixer...");
        const result = await postcss([autoprefixer]).process(rawCssOutput, { from: undefined, to: outputPath });
        result.warnings().forEach(warn => console.warn("Avertissement PostCSS:", warn.toString()));
        console.log(`Écriture du CSS final dans ${outputPath}...`);
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        fs.writeFileSync(outputPath, result.css);
        console.log(`CSS de la démo généré avec succès dans ${outputPath}`);
    } catch (error) {
        console.error("Erreur lors du traitement PostCSS/Autoprefixer:", error); // Ne devrait jamais arriver
    }
}

// --- Lancer l'exécution ---
buildStyles().catch(err => {
    console.error("Erreur inattendue lors de la génération des styles:", err);
    process.exit(1);
});