import { DynSJS } from "./DynSJS.js";

/**
 * Classe représentant une feuille de style.
 */
export class StyleSheet {
    /**
     * Crée une nouvelle feuille de style.
     */
    constructor() {
        /**
         * @type {Array<DynSJS>}
         * @private
         */
        this._rules = [];
    }

    /**
     * Ajoute une nouvelle règle à la feuille de style.
     * @param {...string} selectors - Les sélecteurs de la règle.
     * @returns {DynSJS} La règle créée.
     */
    rule(...selectors) {
        const rule = new DynSJS(...selectors);
        this._rules.push(rule);
        return rule;
    }

    /**
     * Fusionne les objets CSS en une seule chaîne CSS.
     * @param {Array<Object>} cssObjects - Les objets CSS à fusionner.
     * @returns {string} Le CSS fusionné.
     * @private
     */
    /*_mergeCSS(cssObjects) {
        let cssMap = {};
        let compiledCSS = "";

        cssObjects.forEach(obj => {
            if (obj && obj.result && obj.result.selector && obj.result.properties) {
                const { selector, properties } = obj.result;
                cssMap[selector] = cssMap[selector] ? `${cssMap[selector]} ${properties}` : properties;
            }

            if (obj && Array.isArray(obj.mediaCSS)) {
                obj.mediaCSS.forEach(media => {
                    if (media && media.query && media.css) {
                        const { query, css } = media;
                        const mediaKey = `@media ${query}`;
                        cssMap[mediaKey] = cssMap[mediaKey] ? `${cssMap[mediaKey]} ${css}` : css;
                    }
                });
            }
        });

        for (let selector in cssMap) {
            if (selector.startsWith('@media')) {
                compiledCSS += `${selector} {\n  ${cssMap[selector]}\n}\n`;
            } else {
                compiledCSS += `${selector} { ${cssMap[selector]} }\n`;
            }
        }

        cssObjects.forEach(obj => {
            if (obj && obj.childrenCSS) {
                compiledCSS += `\n${obj.childrenCSS}`;
            }
        });

        return compiledCSS;
    }*/

    _mergeCSS(cssObjects) {
        let cssMap = {};
        let mediaQueries = {};

        cssObjects.forEach(obj => {
            if (!obj) return;  // Ajout d'une vérification pour éviter des objets null ou undefined.

            // Handling regular CSS rules
            if (obj.result && obj.result.selector && obj.result.properties) {
                const { selector, properties } = obj.result;
                cssMap[selector] = cssMap[selector] ? `${cssMap[selector]} ${properties}` : properties;
            }

            // Handling media queries
            if (Array.isArray(obj.mediaCSS)) {
                obj.mediaCSS.forEach(media => {
                    if (media && media.query && media.css) {
                        const { query, css } = media;
                        mediaQueries[query] = mediaQueries[query] ? `${mediaQueries[query]} ${css}` : css;
                    }
                });
            }
        });

        let compiledCSS = "";

        for (let selector in cssMap) {
            compiledCSS += `${selector} { ${cssMap[selector]} }\n`;
        }

        for (let query in mediaQueries) {
            compiledCSS += `@media ${query} {\n  ${mediaQueries[query]}\n}\n`;
        }

        return compiledCSS;
    }

    /**
     * Génère des classes utilitaires.
     * @param {Object} config - La configuration des classes à générer.
     * @returns {StyleSheet} La feuille de style.
     */
    generateClasses(config) {
        const { prefix, count, properties } = config;
        for (let i = 1; i <= count; i++) {
            const computedProperties = typeof properties === 'function' ? properties(i) : properties;
            this.rule(`.${prefix}-${i}`)
                .set(computedProperties);
        }
        return this;
    }

    /**
     * Combine plusieurs feuilles de style en une seule.
     * @param {...StyleSheet} stylesheets - Les feuilles de style à combiner.
     * @throws {Error} Si un paramètre n'est pas une instance de StyleSheet.
     */
    combine(...stylesheets) {
        for (let sheet of stylesheets) {
            if (Array.isArray(sheet._rules)) {
                this._rules.push(...sheet._rules);
            } else {
                throw new Error('Le paramètre fourni à combine ne semble pas être une instance valide de StyleSheet.');
            }
        }
    }

    /**
     * Compile la feuille de style en une chaîne CSS.
     * @returns {string} Le CSS compilé.
     */
    compile() {
        const intermediateCSS = this._rules.map(rule => rule.toCSS());
        return this._mergeCSS(intermediateCSS);
    }

}
