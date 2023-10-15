// Importation de JSDOM pour simuler un environnement de navigateur.
import { JSDOM } from "jsdom";
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);  // Création d'un DOM vierge.
global.window = dom.window;  // Exposition de `window` et `document` à l'échelle globale pour simuler un environnement de navigateur.
global.document = dom.window.document;

import { StyleSheet } from './Classes/StyleSheet.js';

import header from './Modules/header.js';

import body from './Modules/body.js';

import nav from './Modules/nav.js';

import footer from './Modules/footer.js';

import main from './Modules/main.js';

const MainSheet = new StyleSheet();

MainSheet.combine(
    main,
    footer,
    nav,
    body,
    header,

);

const cssOutput = MainSheet.compile();
export default cssOutput;
