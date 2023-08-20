import {DynSJS} from "./DynSJS.js";

export class StyleSheet {
    constructor() {
        this._rules = [];
    }

    /**
     * Creates a new CSS rule and adds it to the stylesheet.
     * @param {...string} selectors - CSS selectors for the rule.
     * @returns {DynSJS} - The new rule instance.
     */
    rule(...selectors) {
        const rule = new DynSJS(...selectors);
        this._rules.push(rule);
        return rule;
    }

    /**
     * Merges multiple CSS objects into a single CSS string.
     * @param {Array} cssObjects - List of CSS objects.
     * @returns {string} - The compiled CSS string.
     * @private
     */
    _mergeCSS(cssObjects) {
        let cssMap = {};

        cssObjects.forEach(obj => {
            if (obj.result && obj.result.selector && obj.result.properties) {
                const {selector, properties} = obj.result;
                cssMap[selector] = cssMap[selector] ? `${cssMap[selector]} ${properties}` : properties;
            }

            // Vérification défensive pour s'assurer que obj.childrenCSS est un tableau
            if (Array.isArray(obj.childrenCSS)) {
                obj.childrenCSS.forEach(child => {
                    if (child && child.selector && child.properties) {
                        const {selector, properties} = child;
                        cssMap[selector] = cssMap[selector] ? `${cssMap[selector]} ${properties}` : properties;
                    }
                });
            }

            // Vérification défensive pour s'assurer que obj.mediaCSS est un tableau
            if (Array.isArray(obj.mediaCSS)) {
                obj.mediaCSS.forEach(media => {
                    if (media && media.query && media.css) {
                        const {query, css} = media;
                        const mediaKey = `@media ${query}`;
                        cssMap[mediaKey] = cssMap[mediaKey] ? `${cssMap[mediaKey]} ${css}` : css;
                    }
                });
            }
        });

        let compiledCSS = "";
        for (let selector in cssMap) {
            if (selector.startsWith('@media')) {
                compiledCSS += `${selector} {\n  ${cssMap[selector]}\n}\n`;
            } else {
                compiledCSS += `${selector} { ${cssMap[selector]} }\n`;
            }
        }

        return compiledCSS;
    }

    /**
     * Compiles all the rules into a CSS string.
     * @returns {string} - The compiled CSS string.
     */
    compile() {
        const intermediateCSS = this._rules.map(rule => rule.toCSS()).filter(Boolean);
        return this._mergeCSS(intermediateCSS);
    }
}
