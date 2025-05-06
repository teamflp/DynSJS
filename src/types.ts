// --- src/types.ts ---
import type { Color } from './Color';
import type { DynSJS } from './DynSJS'; // Utilisation de 'import type'

// Représente un thème utilisateur potentiel (peut être profondément imbriqué)
export interface DynSJSTheme {
    [key: string]: any;
}

// Marqueur retourné par le helper theme()
export interface ThemeLookup {
    __isThemeLookupRequest__: true;
    key: string;
    defaultValue?: any; // Rendre defaultValue optionnel
}

export type StyleValuePrimitive = string | number | Color | ThemeLookup | StyleValueFunction;
export type StyleValue = StyleValuePrimitive | Array<StyleValuePrimitive>;
export type StyleValueFunction = (theme: DynSJSTheme, context: DynSJS | null) => string | number | Color;

export type StyleProperties = {
    [key: string]: StyleValue | StyleProperties; // La clé peut être une prop CSS ou un sélecteur/directive
};

export type SetFunction = (theme: DynSJSTheme, context: DynSJS) => StyleProperties;
export type ConditionFunction = (theme: DynSJSTheme, ssr: boolean) => boolean;

// Structure retournée par DynSJS.toCSS()
export interface CSSEntry {
    ruleCSS: string;
    childrenCSS: string;
    mediaCSS: Array<{ query: string; css: string; }>;
}

export interface KeyframeDefinition { [step: string]: StyleProperties; } 

// Options pour le constructeur StyleSheet
export interface StyleSheetOptions {
    ssr?: boolean;
    styleTagId?: string;
}