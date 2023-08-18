// Importation de la librairie
import { StyleSheet } from './StyleSheet.js';

// Utilisation des règles
const sheet = new StyleSheet();

// Définition des règles
const css = sheet.compile();
console.log(css);
