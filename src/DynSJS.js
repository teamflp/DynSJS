/**
 * Class to dynamically generate CSS rules using JavaScript.
 */
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

    static _isValidSelector(sel) {
        return typeof sel === 'string' && sel.trim().length > 0;
    }

    static _isValidProperty(key, value) {
        return typeof key === 'string' && typeof value === 'string';
    }

    static camelToKebab(string) {
        return string.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    set(props) {
        for (let key in props) {
            if (!DynSJS._isValidProperty(key, props[key])) {
                throw new Error(`La propriété ou la valeur ${key}: ${props[key]} est invalide.`);
            }
        }
        Object.assign(this._properties, props);
        return this;
    }

    nested(...selectors) {
        const rule = new DynSJS(...selectors);
        rule._parent = this;
        this._children.push(rule);
        return rule;
    }

    media(query) {
        if (typeof query !== 'string' || query.trim().length === 0) {
            throw new Error("Requête media invalide.");
        }
        const rule = new DynSJS();
        this._mediaQueries.push({ query, rule });
        return rule;
    }

    _isConditionMet() {
        return this._parent && !this._parent._isConditionMet() ? false : this._conditionFn ? this._conditionFn() : true;
    }

    _generateSelectors(parentSelector = '') {
        return this._selectors.map(sel => parentSelector ? `${parentSelector} ${sel}` : sel).join(', ');
    }

    _generateProperties() {
        return Object.entries(this._properties)
            .map(([key, value]) => `${DynSJS.camelToKebab(key)}: ${value};`)
            .join(' ');
    }

    toCSS(parentSelector = '') {
        if (!this._isConditionMet()) return null;

        const combinedSelectors = this._generateSelectors(parentSelector);
        const propertiesString = this._generateProperties();

        // Ajouter cette condition
        if (!combinedSelectors || !propertiesString) return null;

        let result = {selector: combinedSelectors, properties: propertiesString};

        let childrenCSS = this._children.map(child => child.toCSS(combinedSelectors));
        childrenCSS = childrenCSS.filter(Boolean);

        const mediaCSS = this._mediaQueries.map(({ query, rule }) => {
            const cssResult = rule.toCSS(combinedSelectors);
            let cssString = "";
            if (cssResult && cssResult.result) {
                cssString = `${cssResult.result.selector} { ${cssResult.result.properties} }`;
                cssString = cssString.replace(/\n/g, '\n  ');
            }
            return {
                query,
                css: cssString
            };
        });

        const filteredMediaCSS = mediaCSS.filter(m => m.css && m.css.trim().length);

        return {
            result,
            mediaCSS: filteredMediaCSS,
            childrenCSS
        };
    }

}
