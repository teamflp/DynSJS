// --- src/index.js ---
// Ce fichier exporte l'API publique de la bibliothèque

export { StyleSheet } from './StyleSheet.js';
export { Color } from './Color.js';
export { DynSJS } from './DynSJS.js'; // Exporter DynSJS peut être utile
// Exporter les helpers depuis utils.js
export { theme, deepMerge, isThemeLookup } from './utils.js';
