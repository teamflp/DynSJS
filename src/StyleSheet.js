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

        const addCSS = (selector, properties) => {
            cssMap[selector] = cssMap[selector] ? `${cssMap[selector]} ${properties}` : properties;
        };

        const processCSSObject = obj => {
            if (obj.result) {
                const {selector, properties} = obj.result;
                addCSS(selector, properties);
            }

            obj.childrenCSS.forEach(processCSSObject); // Traiter les règles enfants de manière récursive

            obj.mediaCSS.forEach(media => {
                const {query, css} = media;
                const mediaKey = `@media ${query}`;
                cssMap[mediaKey] = cssMap[mediaKey] ? `${cssMap[mediaKey]} ${css}` : css;
            });
        };

        cssObjects.forEach(processCSSObject);

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
        const cssObjects = this._rules.map(rule => rule.toCSS()).filter(Boolean);
        return this._mergeCSS(cssObjects);
    }


}
