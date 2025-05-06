// --- src/index.ts ---

// Exporte les classes principales
export { StyleSheet } from "./StyleSheet.js"; // Garde .js pour compatibilité résolution Node / bundler
export { Color } from "./Color.js";
export { DynSJS } from "./DynSJS.js";

// Exporte les helpers utiles
export {
  theme,
  deepMerge,
  isThemeLookup,
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
  useVar
} from "./utils.js";

// Exporte les types / interfaces pour les utilisateurs TypeScript
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
} from "./types"; // Exporte depuis le fichier centralisé
