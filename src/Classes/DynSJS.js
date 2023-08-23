import {Color} from "./Color.js";
export class DynSJS {
    _parent;
    selectors;

    /**
     * Creates an instance of DynSJS with given selectors.
     * @param {...string} selectors - The CSS selectors for the rule.
     */
    /*constructor(...selectors) {
        if (!selectors.every(DynSJS._isValidSelector)) {
            throw new Error("Un ou plusieurs sélecteurs sont invalides.");
        }

        this._selectors = Array.isArray(selectors[0]) ? selectors[0] : selectors;
        this._properties = {};
        this._children = [];
        this._mediaQueries = [];
        this._conditionFn = null;

    }*/

    constructor(...selectors) {
        if (!selectors.every(DynSJS._isValidSelector)) {
            throw new Error("Un ou plusieurs sélecteurs sont invalides.");
        }

        this._selectors = Array.isArray(selectors[0]) ? selectors[0] : selectors;
        this._properties = {};
        this._children = [];
        this._mediaQueries = [];
        this._conditionFn = null;
        this._selectorStack = []; // Initialisation de la pile
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
     * Ajoute un sélecteur enfant (ou pseudo-élément) au(x) sélecteur(s) actuel(s).
     * Le sélecteur enfant sera utilisé pour définir des styles spécifiques pour cet enfant
     * ou pseudo-élément dans le contexte des sélecteurs actuels.
     *
     * @param {string} selector - Le sélecteur enfant ou pseudo-élément à ajouter.
     * @returns {DynSJS} - Renvoie l'instance de DynSJS pour permettre le chaînage des méthodes.
     *
     * @example
     * // Supposons que vous avez déjà un sélecteur ".parent":
     * rule.nested('.child') // Cela donnera ".parent .child".
     * rule.nested('::before') // Si vous êtes sur ".parent", cela donnera ".parent::before".
     */
    nested(selector) {
        // Ajouter le sélecteur actuel à la pile
        this._selectorStack.push([...this._selectors]);

        if (selector.startsWith("::")) { // Vérifier si c'est un pseudo-élément
            this._selectors = this._selectors.map(s => `${s}${selector}`);
        } else {
            this._selectors = this._selectors.map(s => `${s} ${selector}`);
        }
        return this;
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
    /*_generateSelectors(parentSelector = '') {
        console.log('parentSelector:', parentSelector);
        console.log('this._selectors:', this._selectors);
        return this._selectors.map(sel => {
            return parentSelector ? `${parentSelector} ${sel}` : sel;
        }).join(', ');
    }*/

    _generateSelectors(parentSelector) {
        console.log('parentSelector:', parentSelector);
        console.log('this._selectors:', this._selectors);

        if (parentSelector && this._selectors.includes(parentSelector)) {
            return this._selectors.join(', ');
        }
        return parentSelector
            ? this._selectors.map(selector => `${parentSelector} ${selector}`).join(', ')
            : this._selectors.join(', ');
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
     * Sets the color for the given property.
     * @param color
     * @param property
     * @returns {DynSJS}
     */
    setColor(color, property) {
        if (!(color instanceof Color)) {
            throw new Error("L'argument fourni n'est pas une instance de Color.");
        }

        this._properties[property] = color.toRGBA();
        return this;
    }

    /**
     * Définit le texte pour le pseudo-élément ::before ou ::after via la propriété CSS "content".
     *
     * @param {string} text - Le texte à ajouter.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage des méthodes.
     * @throws {Error} - Lance une erreur si le texte fourni n'est pas une chaine de caractères.
     *
     * @example
     * const style = new DynSJS();
     * style.rule('::before').setText("Hello, world!");
     */
    setText(text) {
        // Vérifiez si le texte est une chaine de caractères.
        if (typeof text !== 'string') {
            throw new Error('Le texte fourni doit être une chaine de caractères.');
        }

        // Échapper les guillemets et ajouter des guillemets autour de la chaine de caractères.
        text = `"${text.replace(/"/g, '\\"')}"`;

        this.set({ content: text });
        return this; // Pour permettre le chaînage des méthodes
    }

    /**
     * Définit des styles qui s'appliqueront lors du survol d'un élément.
     * @param {Object} properties - Les propriétés CSS à appliquer lors du survol.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage des méthodes.
     */
    hover(properties) {
        const hoverRule = new DynSJS(...this._selectors.map(s => `${s}:hover`));
        hoverRule.set(properties);
        this._children.push(hoverRule);
        return this;
    }

    /**
     * Définit des styles pour l'état actif d'un élément.
     * @param {Object} properties - Les propriétés CSS à appliquer pour l'état actif.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage des méthodes.
     */
    active(properties) {
        const activeRule = new DynSJS(...this._selectors.map(s => `${s}:active`));
        activeRule.set(properties);
        this._children.push(activeRule);
        return this;
    }

    /**
     * Définit des styles lorsqu'un élément est en état de focus.
     * @param {Object} properties - Les propriétés CSS à appliquer lors de la mise au point.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage des méthodes.
     */
    focus(properties) {
        const focusRule = new DynSJS(...this._selectors.map(s => `${s}:focus`));
        focusRule.set(properties);
        this._children.push(focusRule);
        return this;
    }

    /**
     * Revenir au(x) sélecteur(s) précédent(s) avant l'appel à `nested()`.
     * Cela permet de remonter dans la hiérarchie des sélecteurs.
     *
     * @returns {DynSJS} - Renvoie l'instance de DynSJS pour permettre le chaînage des méthodes.
     *
     * @example
     * // Supposons que vous ayez le sélecteur ".parent":
     * rule.nested('.child').end() // Cela reviendra à ".parent".
     */

    end() {
        if (this._selectorStack.length > 1) {
            this._selectorStack.pop(); // retire le sélecteur courant
            this._selectors = this._selectorStack[this._selectorStack.length - 1].selectors; // Utilise le sélecteur précédent comme sélecteur courant
        } else if (this._selectorStack.length === 1) {
            this._selectors = []; // Revient à l'état initial s'il ne reste qu'un élément dans la pile
        }
        console.log("After end:", this._selectors);
        return this; // Pour permettre le chaînage
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
