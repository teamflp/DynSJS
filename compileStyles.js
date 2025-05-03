/**
 * Ce script compile les styles CSS avec DynSJS.
 * Il peut optionnellement charger et fusionner la config Tailwind AVANT d'instancier StyleSheet.
 * Il applique ensuite Autoprefixer via PostCSS et écrit le résultat dans un fichier.
 */

// Imports DynSJS
import { StyleSheet, Color, theme as themeHelper, deepMerge } from './src/index.js';

// Imports Node.js et PostCSS
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

// --- Configuration Principale ---
const USE_TAILWIND = true; // Mettre à true pour charger tailwind.config.cjs
// Si vous rencontrez toujours des problèmes, vous pouvez mettre USE_TAILWIND à false
const OUTPUT_DIR = './dist/demo'; // Ou './dist/build'
const OUTPUT_FILE = 'demo-styles.css'; // Ou 'styles.css'
const TAILWIND_CONFIG_PATH = './tailwind.config.cjs'; // Chemin standard
const USER_DYNSJS_THEME = { custom: { fallbackColor: 'grey' } }; // Thème spécifique DynSJS

// --- Fonction Principale Async ---
async function buildStyles() {
    console.log("Préparation du thème...");

    let themeFromTailwind = {};
    
    // --- Chargement de la config Tailwind (SI ACTIVÉ) ---
    if (USE_TAILWIND) {
        try {
            // Au lieu d'essayer d'utiliser resolveConfig de Tailwind, 
            // lisons directement le fichier de configuration
            const configPath = path.resolve(process.cwd(), TAILWIND_CONFIG_PATH);
            
            if (fs.existsSync(configPath)) {
                console.log(`Chargement direct de la config Tailwind depuis ${configPath}...`);
                
                // Importation du fichier de configuration
                const userTailwindConfigModule = await import(configPath);
                const userTailwindConfig = userTailwindConfigModule.default || userTailwindConfigModule;
                
                // Utilisation directe du thème sans passer par resolveConfig
                if (userTailwindConfig && userTailwindConfig.theme) {
                    // On prend directement la section theme de la configuration
                    themeFromTailwind = userTailwindConfig.theme;
                    console.log("Thème Tailwind chargé directement depuis le fichier de configuration.");
                } else {
                    console.warn("Aucun objet 'theme' trouvé dans la config Tailwind.");
                }
            } else {
                console.warn(`Fichier de config Tailwind non trouvé: ${configPath}`);
            }
        } catch (e) {
            console.error("DynSJS: Erreur lors du chargement/résolution de la config Tailwind:", e);
            console.warn("Chargement du thème Tailwind ignoré. Est-ce que 'tailwindcss' est installé et la config valide?");
        }
    }

    // Fusion finale
    const finalTheme = deepMerge(deepMerge({}, themeFromTailwind), USER_DYNSJS_THEME);

    // Création StyleSheet
    console.log("Initialisation de StyleSheet avec le thème final...");
    const sheet = new StyleSheet(finalTheme);

    // --- Définition des Styles ---
    console.log("Définition des règles de style...");
    // (Vos règles sheet.rule(...) restent ici, inchangées)
    sheet.rule('body', 'html').set({ margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: themeHelper('fontFamily.sans', '"Helvetica Neue", Arial, sans-serif'), color: themeHelper('colors.gray.700', '#333'), backgroundColor: themeHelper('colors.gray.50', '#f9fafb'), lineHeight: 1.6 });
    sheet.rule('.container').set({ width: '90%', maxWidth: themeHelper('screens.lg', '1024px'), margin: `${themeHelper('spacing.5', '1.25rem')} auto`, padding: themeHelper('spacing.4', '1rem') });
    const errorColor = Color.fromHex('#D32F2F');
    sheet.rule('.error-message').set({ padding: '1em', border: `1px solid ${errorColor.operate('*', 0.8).toString()}`, backgroundColor: errorColor.operate('+', 200).operate('/', 1.2).toString(), color: errorColor.operate('-', 80).toString(), fontWeight: themeHelper('fontWeight.bold', 'bold'), borderRadius: themeHelper('borderRadius.sm', '0.25rem') });
    sheet.rule('.btn-primaire').set({ display: 'inline-block', padding: `${themeHelper('spacing.2', '0.5rem')} ${themeHelper('spacing.4', '1rem')}`, backgroundColor: themeHelper('colors.blue.600', '#2563eb'), color: themeHelper('colors.white', '#fff'), border: 'none', borderRadius: themeHelper('borderRadius.md', '0.375rem'), cursor: 'pointer', fontWeight: themeHelper('fontWeight.medium', '500'), transition: 'background-color 0.2s ease' }).nested(':hover').set({ backgroundColor: themeHelper('colors.blue.700', '#1d4ed8') });
    sheet.rule('.flex-container').set({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' });
    sheet.rule('.container').media('(max-width: 768px)').set({ width: '95%' });
    sheet.keyframes('pulse', { '0%, 100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: .6, transform: 'scale(1.05)' } });
    sheet.rule('.animated-box').set({ width: '100px', height: '100px', backgroundColor: themeHelper('colors.green.500', 'green'), animation: 'pulse 2s ease-in-out infinite', margin: themeHelper('spacing.4', '1rem') });
    // --- Fin Définition Styles ---

    // --- Compilation (Synchrone) ---
    console.log("Compilation DynSJS...");
    const rawCssOutput = sheet.compile();
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
        console.error("Erreur lors du traitement PostCSS ou de l'écriture du fichier:", error);
    }
}

// --- Lancer l'exécution ---
buildStyles().catch(err => {
    console.error("Erreur inattendue lors de la génération des styles:", err);
    process.exit(1);
});