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

// Types primitifs acceptés comme valeur de style (ou retournés par une fonction)
export type StyleValuePrimitive = string | number | Color | ThemeLookup | StyleValueFunction;

// Type complet pour une valeur de style (peut être primitif ou tableau)
export type StyleValue = StyleValuePrimitive | Array<StyleValuePrimitive>;

// Fonction pouvant être passée comme valeur DANS l'objet de set() - Moins utilisée maintenant
export type StyleValueFunction = (theme: DynSJSTheme, context: DynSJS) => string | number | Color;

// Objet de propriétés CSS passé à set() ou retourné par la fonction SetFunction
export type StyleProperties = {
    [key: string]: StyleValue;
};

// --- AJOUT DU TYPE MANQUANT ---
// Type pour la fonction passée directement à set()
export type SetFunction = (theme: DynSJSTheme, context: DynSJS) => StyleProperties;
// --- FIN AJOUT ---

// Fonction pour les conditions 'when()'
export type ConditionFunction = (theme: DynSJSTheme, ssr: boolean) => boolean;

// Structure retournée par DynSJS.toCSS()
export interface CSSEntry {
    ruleCSS: string;
    childrenCSS: string;
    mediaCSS: Array<{ query: string; css: string; }>;
}

// Définition pour les keyframes
export interface KeyframeDefinition {
    [step: string]: StyleProperties; 
}

// Options pour le constructeur StyleSheet
export interface StyleSheetOptions {
    ssr?: boolean;
    styleTagId?: string;
}