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

    /**
     * Sets CSS properties for the current rule.
     * @param {Object} props - An object with CSS properties and values.
     * @returns {DynSJS} - Returns the current instance for chaining.
     */
    set(props) {
        for (let key in props) {
            if (!DynSJS._isValidProperty(key, props[key])) {
                throw new Error(`La propriété ou la valeur ${key}: ${props[key]} est invalide.`);
            }
        }
        Object.assign(this._properties, props);
        return this;
    }

    /**
     * Adds a nested rule within the current rule.
     * @param {...string} selectors - The CSS selectors for the nested rule.
     * @returns {DynSJS} - Returns the nested rule instance.
     */
    nested(...selectors) {
        const rule = new DynSJS(...selectors);
        rule._parent = this;
        this._children.push(rule);
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
        const rule = new DynSJS();
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
        return this._selectors.map(sel => parentSelector ? `${parentSelector} ${sel}` : sel).join(', ');
    }

    /**
     * Generates properties string for the current rule.
     * @returns {string} - CSS properties string.
     * @private
     */
    _generateProperties() {
        return Object.entries(this._properties)
            .map(([key, value]) => `${DynSJS.camelToKebab(key)}: ${value};`)
            .join(' ');
    }

    /**
     * Converts the rule and its children to CSS string.
     * @param {string} parentSelector - Parent selector string.
     * @returns {{result: {selector: string, properties: string}, mediaCSS: {css: *, query: *}[], childrenCSS: string[]}} - CSS string for the rule and its children.
     */
    toCSS(parentSelector = '') {
        if (!this._isConditionMet()) return '';

        const combinedSelectors = this._generateSelectors(parentSelector);
        let result = Object.keys(this._properties).length ? {selector: combinedSelectors, properties: this._generateProperties()} : null;

        const childrenCSS = this._children.map(child => child.toCSS(combinedSelectors)).filter(Boolean);
        const mediaCSS = this._mediaQueries.map(({ query, rule }) => {
            return {
                query,
                css: rule.toCSS(combinedSelectors).replace(/\n/g, '\n  ')
            };
        });

        return {result, childrenCSS, mediaCSS};
    }
}
