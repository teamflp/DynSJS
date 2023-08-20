import {Color} from "./Color.js";
export class DynSJS {

    /**
     * Creates an instance of DynSJS with given selectors.
     * @param {...string} selectors - The CSS selectors for the rule.
     */
    constructor(...selectors) {
        if (!selectors.every(DynSJS._isValidSelector)) {
            throw new Error("Un ou plusieurs sélecteurs sont invalides.");
        }

        this._selectors = Array.isArray(selectors[0]) ? selectors[0] : selectors;
        this._properties = {};
        this._children = [];
        this._mediaQueries = [];
        this._conditionFn = null;
    }

    /**
     * Validates if the given selector is in the correct format.
     * @param {string} sel - Selector to be validated.
     * @returns {boolean} - True if valid, otherwise false.
     * @private
     */
    static _isValidSelector(sel) {
        return typeof sel === 'string' && sel.trim().length > 0;
    }

    /**
     * Validates if the given key and value are correct for CSS properties.
     * @param {string} key - CSS property.
     * @param {string} value - Value for the CSS property.
     * @returns {boolean} - True if valid, otherwise false.
     * @private
     */
    static _isValidProperty(key, value) {
        return typeof key === 'string' && typeof value === 'string';
    }

    static camelToKebab(string) {
        return string.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }
    set(props) {
        for (let key in props) {
            if (typeof props[key] === 'object' && !Array.isArray(props[key])) {
                // Si la valeur est un objet (pour les @keyframes)
                this._properties[key] = props[key];
            } else if (!DynSJS._isValidProperty(key, props[key])) {
                throw new Error(`La propriété ou la valeur ${key}: ${props[key]} est invalide.`);
            } else {
                this._properties[key] = props[key];
            }
        }
        return this;
    }


    /**
     * Adds a nested rule within the current rule.
     * @param {...string} selectors - The CSS selectors for the nested rule.
     * @returns {DynSJS} - Returns the nested rule instance.
     */
    nested(...selectors) {
        const rule = new DynSJS(...selectors);
        this._children.push(rule);
        rule._parent = this;
        return rule;
    }

    /**
     * Adds a media query rule within the current rule.
     * @param {string} query - The media query condition.
     * @returns {DynSJS} - Returns the media query rule instance.
     */
    media(query) {
        if (typeof query !== 'string' || query.trim().length === 0) {
            throw new Error("Requête media invalide.");
        }
        const rule = new DynSJS(...this._selectors); // Transférer les sélecteurs à la nouvelle instance
        this._mediaQueries.push({ query, rule });
        return rule;
    }

    /**
     * Sets a condition function for the rule.
     * @param {function} conditionFn - Function to evaluate the condition.
     * @returns {DynSJS} - Returns the current instance for chaining.
     */
    when(conditionFn) {
        if (typeof conditionFn !== 'function') {
            throw new Error("`conditionFn` doit être une fonction.");
        }
        this._conditionFn = conditionFn;
        return this;
    }

    /**
     * Checks if the condition for the rule is met.
     * @returns {boolean} - True if condition is met, otherwise false.
     * @private
     */
    _isConditionMet() {
        return this._parent && !this._parent._isConditionMet() ? false : this._conditionFn ? this._conditionFn() : true;
    }

    /**
     * Generates selectors string for the current rule.
     * @param {string} parentSelector - Parent selector string.
     * @returns {string} - Combined selectors string.
     * @private
     */
    _generateSelectors(parentSelector = '') {
        console.log('parentSelector:', parentSelector);
        console.log('this._selectors:', this._selectors);
        return this._selectors.map(sel => {
            if (parentSelector && parentSelector.trim() === sel.trim()) {
                return sel;
            }
            return parentSelector ? `${parentSelector} ${sel}` : sel;
        }).join(', ');
    }

    /**
     * Generates properties string for the current rule.
     * @returns {string} - CSS properties string.
     * @private
     */
    _generateProperties() {
        return Object.entries(this._properties)
            .map(([key, value]) => {
                if (typeof value === 'object' && !Array.isArray(value)) {
                    return `${key} { ${Object.entries(value).map(([k, v]) => `${k}: ${v};`).join(' ')} }`;
                } else {
                    return `${DynSJS.camelToKebab(key)}: ${value};`;
                }
            })
            .join(' ');
    }

    /**
     * Converts the rule and its children to CSS string.
     * @param {string} parentSelector - Parent selector string.
     * @returns {{result: {selector: *, properties: string}, mediaCSS: {css: string, query: *}[], childrenCSS: string}|null} - CSS string for the rule and its children.
     */
    toCSS(parentSelector = '') {
        if (!this._isConditionMet()) return null;

        const combinedSelectors = this._generateSelectors(parentSelector);
        if (!combinedSelectors || combinedSelectors.trim() === "") {
            console.warn("Aucun sélecteur combiné trouvé");
            return null;
        }

        const properties = this._generateProperties();
        let result = (properties && combinedSelectors) ? {selector: combinedSelectors, properties} : null;

        const childrenCSSList = this._children.map(child => child.toCSS(combinedSelectors)).filter(Boolean);

        let childrenCssString = childrenCSSList.map(({result}) => {
            if (result && result.properties) {
                if (result.selector.startsWith('@keyframes')) {
                    // Convert property string into an array of properties
                    const propsArray = result.properties.split(';').filter(Boolean);
                    const keyframeBlocks = propsArray.map(prop => {
                        const [percent, propValue] = prop.split(':');
                        return `${percent.trim()} {\n    ${propValue.trim()};\n}`; // using {} for keyframe properties
                    }).join('\n');
                    return `${result.selector} {\n${keyframeBlocks}\n}`;
                } else {
                    return `${result.selector} { ${result.properties} }`;
                }
            }
            return '';
        }).join('\n').trim();

        const mediaCSS = this._mediaQueries.map(({ query, rule }) => {
            const cssResult = rule.toCSS(combinedSelectors);
            let cssString = "";
            if (cssResult && cssResult.result && cssResult.result.properties) {
                cssString = `${cssResult.result.selector} { ${cssResult.result.properties} }`;
                cssString = cssString.replace(/\n/g, '\n  ');
            }
            return {
                query,
                css: cssString
            };
        }).filter(m => m.css);

        return {result, childrenCSS: childrenCssString, mediaCSS};
    }



}
