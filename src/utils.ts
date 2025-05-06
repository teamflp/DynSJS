// --- src/utils.ts ---
import type { ThemeLookup } from './types'; // Utilise 'import type'

// Helper interne (pas besoin d'exporter)
// Votre version avec <T> est bonne, mais pour la simplicité et l'usage ici, any suffit.
function isObject(item: any): item is Record<string, unknown> { // Record est plus spécifique qu'objet simple
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/** Deep merge utility */
export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key: string) => {
            if (isObject(source[key])) {
                // Assurer que la cible est aussi un objet pour la fusion, sinon écraser
                if (!(key in output) || !isObject(output[key])) {
                    output[key] = deepMerge({}, source[key]); // Clone la source si la cible n'est pas un objet
                } else {
                    output[key] = deepMerge(output[key], source[key]); // Fusionne si les deux sont des objets
                }
            } else {
                output[key] = source[key]; // Écrase avec la valeur de la source
            }
        });
    } else if (isObject(source)) { // Si target n'est pas un objet, mais source l'est, on retourne une copie de source
        return deepMerge({}, source);
    }
    // Si ni target ni source (ou seulement target) ne sont des objets, output est déjà { ...target }
    return output;
}

// --- Helpers Theming ---
const THEME_LOOKUP_MARKER = '__isThemeLookupRequest__';

/** Theme value lookup marker generator */
export function theme(key: string, defaultValue: any = undefined): ThemeLookup {
    // --- CORRECTION : Vérification du type de key avant .trim() ---
    if (typeof key !== 'string' || !key.trim()) {
        console.warn(`DynSJS: Invalid theme key: (key was "${key}"). Using defaultValue.`);
    }
    // --- FIN CORRECTION ---
    return { [THEME_LOOKUP_MARKER]: true, key: typeof key === 'string' ? key.trim() : '', defaultValue: defaultValue };
}

/** @internal Checks for theme marker */
export function isThemeLookup(value: any): value is ThemeLookup {
    return typeof value === 'object' && value !== null && value[THEME_LOOKUP_MARKER] === true;
}

// --- NOUVEAU : Helpers d'Unités ---

/** Génère une valeur en pixels. Ex: px(10) -> "10px" */
export function px(value: number): string { return `${value}px`; }
/** Génère une valeur en rem. Ex: rem(1.5) -> "1.5rem" */
export function rem(value: number): string { return `${value}rem`; }
/** Génère une valeur en em. Ex: em(1.2) -> "1.2em" */
export function em(value: number): string { return `${value}em`; }
/** Génère une valeur en pourcentage. Ex: percent(50) -> "50%" */
export function percent(value: number): string { return `${value}%`; }
/** Génère une valeur en vh (Viewport Height). Ex: vh(100) -> "100vh" */
export function vh(value: number): string { return `${value}vh`; }
/** Génère une valeur en vw (Viewport Width). Ex: vw(100) -> "100vw" */
export function vw(value: number): string { return `${value}vw`; }
/** Génère une valeur en degrés. Ex: deg(90) -> "90deg" */
export function deg(value: number): string { return `${value}deg`; }
/** Génère une valeur en secondes. Ex: s(1.5) -> "1.5s" */
export function s(value: number): string { return `${value}s`; }
/** Génère une valeur en millisecondes. Ex: ms(500) -> "500ms" */
export function ms(value: number): string { return `${value}ms`; }
/** Génère une valeur en fraction (pour les grilles CSS). Ex: fr(1) -> "1fr" */
export function fr(value: number): string { return `${value}fr`; }

/**
 * Génère la syntaxe CSS var() pour utiliser une variable CSS.
 * Ajoute automatiquement '--' si manquant.
 * @param name Nom de la variable (ex: 'primary-color' ou '--primary-color')
 * @param fallback Valeur de secours optionnelle
 * @returns Chaîne CSS `var(...)`
 */
export function useVar(name: string, fallback?: string | number): string {
    const varName = name.startsWith('--') ? name : `--${name}`;
    let fallbackString = '';
    if (fallback !== undefined) {
        fallbackString = `, ${String(fallback)}`;
    }
    // --- CORRECTION : Syntaxe de template literal correcte ---
    return `var(${varName}${fallbackString})`;
    // --- FIN CORRECTION ---
}