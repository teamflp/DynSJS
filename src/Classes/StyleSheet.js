import { DynSJS } from "./DynSJS.js";

export class StyleSheet {
    constructor() {
        this._rules = [];
    }
    rule(...selectors) {
        const rule = new DynSJS(...selectors);
        this._rules.push(rule);
        return rule;
    }
    _mergeCSS(cssObjects) {
        let cssMap = {};

        cssObjects.forEach(obj => {
            if (obj.result && obj.result.selector && obj.result.properties) {
                const { selector, properties } = obj.result;
                cssMap[selector] = cssMap[selector] ? `${cssMap[selector]} ${properties}` : properties;
            }

            if (Array.isArray(obj.childrenCSS)) {
                obj.childrenCSS.forEach(child => {
                    if (child && child.selector && child.properties) {
                        const { selector, properties } = child;
                        cssMap[selector] = cssMap[selector] ? `${cssMap[selector]} ${properties}` : properties;
                    }
                });
            }

            if (Array.isArray(obj.mediaCSS)) {
                obj.mediaCSS.forEach(media => {
                    if (media && media.query && media.css) {
                        const { query, css } = media;
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

    generateClasses(config) {
        const { prefix, count, properties } = config;
        for (let i = 1; i <= count; i++) {
            const computedProperties = typeof properties === 'function' ? properties(i) : properties;
            this.rule(`.${prefix}-${i}`)
                .set(computedProperties);
        }
        return this;
    }

    combine(...stylesheets) {
        for (let sheet of stylesheets) {
            if (Array.isArray(sheet._rules)) {
                this._rules.push(...sheet._rules);
            } else {
                throw new Error('Le paramètre fourni à combine ne semble pas être une instance valide de StyleSheet.');
            }
        }
    }
    compile() {
        const intermediateCSS = this._rules.map(rule => rule.toCSS()).filter(Boolean);
        return this._mergeCSS(intermediateCSS);
    }
}
