// --- src/index.ts ---

/**
 * @module DynSJS
 * Point d'entrée principal de la bibliothèque DynSJS.
 * Ce fichier réexporte tous les modules, classes, fonctions et types publics
 * destinés à être utilisés par les consommateurs de la bibliothèque.
 *
 * @example
 * ```typescript
 * import { StyleSheet, Color, theme, px } from 'dynsjs';
 *
 * const myTheme = { colors: { primary: '#007bff' } };
 * const sheet = new StyleSheet(myTheme);
 *
 * sheet.rule('.button').set(t => ({
 * backgroundColor: t.colors?.primary,
 * padding: [px(10), px(20)]
 * }));
 *
 * console.log(sheet.compile());
 * ```
 */

// --- Classes Principales ---
export { StyleSheet } from "./StyleSheet";
export { Color } from "./Color";
export { DynSJS } from "./DynSJS";

// --- Fonctions Utilitaires et Helpers ---
export {
  theme,
  deepMerge,
  isThemeLookup,
  // Helpers d'unités
  px,
  rem,
  em,
  percent,
  vh,
  vw,
  deg,
  s,
  ms,
  fr,
  // Helper pour variables CSS
  useVar
} from "./utils";

// --- Types et Interfaces Publics ---
export type {
  DynSJSTheme,
  ThemeLookup,
  StyleValue,
  StyleValueFunction,
  StyleProperties,
  ConditionFunction,
  CSSEntry,
  KeyframeDefinition,
  StyleSheetOptions,
} from "./types.ts";