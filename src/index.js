// Importation de JSDOM pour simuler un environnement de navigateur.
import { JSDOM } from "jsdom";
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);  // Création d'un DOM vierge.
global.window = dom.window;  // Exposition de `window` et `document` à l'échelle globale pour simuler un environnement de navigateur.
global.document = dom.window.document;

import { StyleSheet } from './Classes/StyleSheet.js';
import body from "./Modules/body.js";
import header from './Modules/header.js';
import article from "./Modules/article.js";
import footer from './Modules/footer.js';

const MainSheet = new StyleSheet();

MainSheet.combine(
    body,
    header,
    article,
    footer,
);

const cssOutput = MainSheet.compile();
export default cssOutput;
