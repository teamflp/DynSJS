import { StyleSheet } from './Classes/StyleSheet.js';

// On importe tous les modules de style 
import demo from './Modules/demo.js';
import header from './Modules/header.js';

// On crée un objet StyleSheet
const MainSheet = new StyleSheet();

// On combine toutes les feuilles de style
MainSheet.combine(demo, header)

// On exporte le style sheet
const cssOutput = MainSheet.compile();
export default cssOutput;
