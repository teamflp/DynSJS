// --- src/utils.ts ---
import type { ThemeLookup } from './types';

/**
 * @internal Vérifie si l'élément fourni est un objet simple (et non un tableau ou null).
 * @param {any} item - L'élément à vérifier.
 * @returns {boolean} `true` si c'est un objet simple, sinon `false`.
 */
function isObject(item: any): item is Record<string, unknown> {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Fusionne récursivement (en profondeur) les propriétés de l'objet `source` dans l'objet `target`.
 * Retourne un nouvel objet sans modifier les objets originaux.
 * Si `source` contient des clés déjà présentes dans `target`, les valeurs de `source` écraseront celles de `target`.
 * Si une propriété est un objet dans les deux, elle sera fusionnée récursivement.
 * @param {Record<string, any>} target - L'objet cible.
 * @param {Record<string, any>} source - L'objet source dont les propriétés seront fusionnées.
 * @returns {Record<string, any>} Un nouvel objet résultant de la fusion.
 * @example
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { b: { d: 3 }, e: 4 };
 * const merged = deepMerge(obj1, obj2);
 * // merged sera { a: 1, b: { c: 2, d: 3 }, e: 4 }
 */
export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key: string) => {
            if (isObject(source[key])) {
                if (!(key in output) || !isObject(output[key])) {
                    output[key] = deepMerge({}, source[key]);
                } else {
                    output[key] = deepMerge(output[key], source[key]);
                }
            } else {
                output[key] = source[key];
            }
        });
    } else if (isObject(source)) {
        return deepMerge({}, source);
    }
    return output;
}

// --- Helpers Theming ---
const THEME_LOOKUP_MARKER = '__isThemeLookupRequest__';

/**
 * Crée un marqueur pour une recherche de valeur de thème différée.
 * Cet objet marqueur est utilisé par DynSJS pour identifier les valeurs qui doivent être résolues
 * à partir de l'objet thème au moment de la compilation CSS.
 * @param {string} key - La clé du thème à rechercher (ex: 'colors.primary', 'spacing.md').
 * @param {any} [defaultValue] - La valeur à utiliser si la clé n'est pas trouvée dans le thème.
 * @returns {ThemeLookup} Un objet marqueur spécial.
 * @example
 * import { theme } from 'dynsjs'; // Supposant l'import depuis le point d'entrée
 * // sheet.rule('.myElement').set({
 * //   color: theme('colors.primaryText', '#333'),
 * //   padding: theme('spacing.large')
 * // });
 */
export function theme(key: string, defaultValue: any = undefined): ThemeLookup {
    if (!key.trim()) {
        // Utilisation de DynSJS Utils pour la clarté du message d'erreur si ce fichier est utilisé indépendamment.
        console.warn(`DynSJS Utils: Invalid theme key provided to theme(): (key was "${key}"). Using defaultValue.`);
    }
    return { [THEME_LOOKUP_MARKER]: true, key: key.trim(), defaultValue: defaultValue };
}

/**
 * @internal Vérifie si une valeur est un marqueur de thème généré par `theme()`.
 * Utilisé en interne par DynSJS.
 * @param {any} value - La valeur à vérifier.
 * @returns {boolean} `true` si c'est un marqueur de thème, sinon `false`.
 */
export function isThemeLookup(value: any): value is ThemeLookup {
    return typeof value === 'object' && value !== null && value[THEME_LOOKUP_MARKER] === true;
}

// --- Helpers d'Unités CSS ---

/**
 * Génère une chaîne de valeur CSS en pixels.
 * @param {number} value - La valeur numérique.
 * @returns {string} La valeur formatée en pixels (ex: "10px").
 * @example px(20) // "20px"
 */
export function px(value: number): string { return `${value}px`; }

/**
 * Génère une chaîne de valeur CSS en rem.
 * @param {number} value - La valeur numérique.
 * @returns {string} La valeur formatée en rem (ex: "1.5rem").
 * @example rem(1.5) // "1.5rem"
 */
export function rem(value: number): string { return `${value}rem`; }

/**
 * Génère une chaîne de valeur CSS en em.
 * @param {number} value - La valeur numérique.
 * @returns {string} La valeur formatée en em (ex: "1.2em").
 * @example em(1) // "1em"
 */
export function em(value: number): string { return `${value}em`; }

/**
 * Génère une chaîne de valeur CSS en pourcentage.
 * @param {number} value - La valeur numérique.
 * @returns {string} La valeur formatée en pourcentage (ex: "50%").
 * @example percent(100) // "100%"
 */
export function percent(value: number): string { return `${value}%`; }

/**
 * Génère une chaîne de valeur CSS en vh (hauteur du viewport).
 * @param {number} value - La valeur numérique.
 * @returns {string} La valeur formatée en vh (ex: "100vh").
 * @example vh(50) // "50vh"
 */
export function vh(value: number): string { return `${value}vh`; }

/**
 * Génère une chaîne de valeur CSS en vw (largeur du viewport).
 * @param {number} value - La valeur numérique.
 * @returns {string} La valeur formatée en vw (ex: "100vw").
 * @example vw(75) // "75vw"
 */
export function vw(value: number): string { return `${value}vw`; }

/**
 * Génère une chaîne de valeur CSS en degrés.
 * @param {number} value - La valeur numérique.
 * @returns {string} La valeur formatée en degrés (ex: "90deg").
 * @example deg(45) // "45deg"
 */
export function deg(value: number): string { return `${value}deg`; }

/**
 * Génère une chaîne de valeur CSS en secondes.
 * @param {number} value - La valeur numérique.
 * @returns {string} La valeur formatée en secondes (ex: "1.5s").
 * @example s(0.5) // "0.5s"
 */
export function s(value: number): string { return `${value}s`; }

/**
 * Génère une chaîne de valeur CSS en millisecondes.
 * @param {number} value - La valeur numérique.
 * @returns {string} La valeur formatée en millisecondes (ex: "500ms").
 * @example ms(250) // "250ms"
 */
export function ms(value: number): string { return `${value}ms`; }

/**
 * Génère une chaîne de valeur CSS en fraction (utilisé dans CSS Grid).
 * @param {number} value - La valeur numérique.
 * @returns {string} La valeur formatée en fr (ex: "1fr").
 * @example fr(2) // "2fr"
 */
export function fr(value: number): string { return `${value}fr`; }

/**
 * Génère la syntaxe CSS `var()` pour utiliser une variable CSS.
 * Ajoute automatiquement le préfixe '--' au nom si manquant.
 * @param {string} name - Nom de la variable (ex: 'primary-color' ou '--primary-color').
 * @param {string | number} [fallback] - Valeur de secours optionnelle si la variable n'est pas définie.
 * @returns {string} La chaîne CSS `var(...)`.
 * @example
 * useVar('primary-text') // "var(--primary-text)"
 * useVar('--accent-color', 'blue') // "var(--accent-color, blue)"
 */
export function useVar(name: string, fallback?: string | number): string {
    const varName = name.startsWith('--') ? name : `--${name}`;
    let fallbackString = '';
    if (fallback !== undefined) {
        fallbackString = `, ${String(fallback)}`;
    }
    return `var(${varName}${fallbackString})`;
}