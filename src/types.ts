// --- src/types.ts ---
import type { Color } from './Color';
import type { DynSJS } from './DynSJS';

/**
 * Représente la structure d'un objet thème utilisé par DynSJS.
 * C'est un objet flexible où les clés sont des chaînes de caractères et les valeurs peuvent être de n'importe quel type,
 * souvent imbriquées (ex: `colors.primary`, `spacing.medium`).
 * @example
 * const monTheme: DynSJSTheme = {
 * colors: {
 * primary: '#007bff',
 * secondary: new Color(100, 100, 100),
 * },
 * spacing: {
 * small: '4px',
 * medium: '8px',
 * },
 * fontSizes: {
 * body: '1rem',
 * }
 * };
 */
export interface DynSJSTheme {
    [key: string]: any;
}

/**
 * Objet marqueur retourné par la fonction utilitaire `theme()`.
 * Il indique à DynSJS qu'une valeur doit être recherchée dans le thème au moment de la compilation.
 * @internal Utilisé par le système DynSJS, pas typiquement créé manuellement par l'utilisateur final sauf via `theme()`.
 */
export interface ThemeLookup {
    /** Propriété interne identifiant cet objet comme une demande de recherche de thème. */
    readonly __isThemeLookupRequest__: true;
    /** La clé (chemin par points) à rechercher dans l'objet thème (ex: "colors.primary"). */
    readonly key: string;
    /** La valeur par défaut à utiliser si la clé n'est pas trouvée dans le thème. */
    readonly defaultValue?: any;
}

/**
 * Représente les types de valeurs primitives qu'une propriété CSS peut prendre
 * ou qui peuvent être retournées par une `StyleValueFunction`.
 * Cela inclut les chaînes de caractères, les nombres, les instances `Color`,
 * les marqueurs `ThemeLookup`, ou une fonction qui résoudra l'une de ces valeurs.
 */
export type StyleValuePrimitive = string | number | Color | ThemeLookup | StyleValueFunction;

/**
 * Représente la valeur complète d'une propriété CSS dans DynSJS.
 * Peut être une valeur primitive (`StyleValuePrimitive`) ou un tableau de ces valeurs primitives
 * (utile pour les propriétés CSS composites comme `margin`, `padding`, `border`, `font`).
 * @example
 * // Valeur simple
 * const couleur: StyleValue = '#FF0000';
 * const taille: StyleValue = 16; // sera converti en "16px" ou "16" selon le contexte
 * const couleurTheme: StyleValue = theme('colors.primary');
 * // Valeur composite
 * const marge: StyleValue = [theme('spacing.small'), 'auto'];
 * const police: StyleValue = [1.2, 'sans-serif'];
 */
export type StyleValue = StyleValuePrimitive | Array<StyleValuePrimitive>;

/**
 * Type pour une fonction qui retourne une valeur de style primitive.
 * Ces fonctions sont résolues au moment de la compilation par `DynSJS._generateProperties`.
 * Elles reçoivent l'objet thème actuel et le contexte de la règle DynSJS.
 * @param theme - L'objet thème actuel.
 * @param context - L'instance `DynSJS` de la règle actuelle, ou `null` dans certains contextes (ex: keyframes).
 * @returns Une chaîne, un nombre, une instance `Color` (qui sera ensuite convertie en chaîne).
 */
export type StyleValueFunction = (theme: DynSJSTheme, context: DynSJS | null) => string | number | Color;

/**
 * Représente un objet de propriétés CSS pour une règle ou une étape de keyframe.
 * Les clés sont les noms des propriétés CSS (en camelCase ou kebab-case).
 * Les valeurs sont de type `StyleValue`.
 * Peut également contenir des clés qui sont des sélecteurs imbriqués ou des directives @media,
 * dont les valeurs seront alors elles-mêmes des objets `StyleProperties` (permettant l'imbrication).
 * @example
 * const props: StyleProperties = {
 * color: theme('colors.text'),
 * fontSize: '16px',
 * padding: [theme('spacing.small'), theme('spacing.medium')],
 * '&:hover': { // Imbrication
 * color: theme('colors.textHover'),
 * textDecoration: 'underline'
 * },
 * '@media (min-width: 768px)': { // Media query imbriquée
 * fontSize: '18px'
 * }
 * };
 */
export type StyleProperties = {
    [key: string]: StyleValue | StyleProperties;
};

/**
 * Type pour une fonction passée directement à la méthode `DynSJS.set()`.
 * Cette fonction reçoit l'objet thème et le contexte de la règle `DynSJS`
 * et doit retourner un objet `StyleProperties`.
 * @param theme - L'objet thème actuel.
 * @param context - L'instance `DynSJS` de la règle actuelle.
 * @returns Un objet `StyleProperties`.
 */
export type SetFunction = (theme: DynSJSTheme, context: DynSJS) => StyleProperties;

/**
 * Type pour une fonction de condition passée à la méthode `DynSJS.when()`.
 * Reçoit l'objet thème et un booléen indiquant le contexte SSR.
 * Doit retourner `true` pour que la règle soit appliquée, `false` sinon.
 * @param theme - L'objet thème actuel.
 * @param ssr - Booléen indiquant si on est en contexte Server-Side Rendering.
 * @returns {boolean}
 */
export type ConditionFunction = (theme: DynSJSTheme, ssr: boolean) => boolean;

/**
 * @internal Structure retournée par `DynSJS.toCSS()`, représentant les parties
 * compilées d'une règle (règle principale, CSS des enfants, media queries).
 * Utilisée en interne par `StyleSheet.compile()`.
 */
export interface CSSEntry {
    /** La chaîne CSS pour la règle principale elle-même (ex: `.my-class { color: red; }`). */
    ruleCSS: string;
    /** La chaîne CSS combinée de toutes les règles enfants imbriquées. */
    childrenCSS: string;
    /** Un tableau d'objets représentant les media queries définies au sein de cette règle ou de ses enfants. */
    mediaCSS: Array<{ query: string; css: string; }>;
}

/**
 * Définit la structure d'une animation `@keyframes`.
 * C'est un objet où les clés sont les étapes de l'animation (ex: '0%', '100%', 'from', 'to')
 * et les valeurs sont des objets `StyleProperties` définissant les styles pour cette étape.
 * @example
 * const myAnimation: KeyframeDefinition = {
 * '0%': { opacity: 0, transform: 'translateY(20px)' },
 * '100%': { opacity: 1, transform: 'translateY(0)' }
 * };
 */
export interface KeyframeDefinition {
    [step: string]: StyleProperties;
}

/**
 * Options de configuration pour le constructeur `StyleSheet`.
 */
export interface StyleSheetOptions {
    /**
     * Indique si la feuille de style est utilisée dans un contexte de Server-Side Rendering.
     * Si `true`, l'injection DOM via `sheet.inject()` sera désactivée.
     * @default false
     */
    ssr?: boolean;
    /**
     * ID personnalisé pour la balise `<style>` qui sera injectée dans le DOM par `sheet.inject()`.
     * Un ID unique est généré par défaut si non fourni.
     */
    styleTagId?: string;
}