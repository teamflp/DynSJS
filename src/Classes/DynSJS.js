/**
 * @file DynSJS - Dynamic StyleSheet JavaScript
 * @author Paterne Guélablé Gnonzion
 * @version v1.0.0
 * @date 2023-06-01
 * @description Générateur de feuilles de style dynamiques.
 * @license MIT
 */

import {Color} from "./Color.js";

/**
 * Classe pour générer dynamiquement des styles CSS.
 *
 * @property {string[]} _selectors - Sélecteurs CSS pour la règle.
 * @property {Object} _properties - Propriétés CSS pour la règle.
 * @property {DynSJS[]} _children - Sélecteurs enfants pour la règle.
 * @property {Object[]} _mediaQueries - Règles de requête média pour la règle.
 * @property {function} _conditionFn - Fonction de condition pour la règle.
 * @property {string[]} _selectorStack - Pile de sélecteurs pour la règle.
 * @property {DynSJS} _parent - Parent de la règle.
 * @example
 *
 * import { StyleSheet } from '../Classes/StyleSheet.js';
 * import { colorRed, colorGreen, colorWhite, colorYellow } from './vars.js';
 *
 * const footer = new StyleSheet(); // Crée une nouvelle instance de StyleSheet
 *
 * // Styles principaux pour le footer
 * footer.rule('footer') // Sélecteur principal
 *     .setColor(colorRed, 'backgroundColor') // Définit la couleur de fond
 *     .set({ width: '50%' }) // Définit la largeur
 *     .transitionManager({ backgroundColor: '0.5s', width: '0.3s' }) // Définit les transitions
 *     .flexLayout({ direction: 'row', justify: 'center', align: 'center' }); // Définit les propriétés flexbox
 *
 * // Styles pour les paragraphes à l'intérieur du footer
 * footer.rule('footer')
 *     .nested('p') // Sélecteur enfant
 *     .setColor(colorGreen, 'backgroundColor', colorWhite, 'color') // Définit la couleur de fond et la couleur du texte
 *     .set({ textAlign: 'center', padding: '10px', width: '100%' }) // Définit le texte centré, le rembourrage et la largeur
 *     .transitionManager({ backgroundColor: '0.5s', color: '0.5s' }) // Définit les transitions
 *     .nested('::before') // Sélecteur pseudo-élément
 *     .setText("C'est le footer!") // Définit le texte du pseudo-élément
 *
 * // Styles pour les boutons à l'intérieur du footer lorsqu'ils sont survolés ou focalisés
 * const buttonTransitions = { backgroundColor: '0.3s' }; // Transitions communes pour les boutons
 *
 * footer.rule('footer')
 *     .nested('button:hover')
 *     .setColor(colorGreen, 'backgroundColor')
 *     .transitionManager(buttonTransitions);
 *
 * footer.rule('footer')
 *     .nested('button:focus')
 *     .setColor(colorYellow, 'backgroundColor')
 *     .transitionManager(buttonTransitions);
 *
 * export default footer;
 */
export class DynSJS {

    _parent;

    constructor(...selectors) {
        if (!selectors.every(DynSJS._isValidSelector)) {
            throw new Error("Un ou plusieurs sélecteurs sont invalides.");
        }

        this._selectors = Array.isArray(selectors[0]) ? selectors[0] : selectors;
        this._properties = {};
        this._children = [];
        this._mediaQueries = [];
        this._conditionFn = null;
        this._selectorStack = [];
    }

    static _isValidSelector(sel) {
        return typeof sel === 'string' && sel.trim();
    }
    static _isValidProperty(key, value) {
        return typeof key === 'string' && typeof value === 'string';
    }
    static camelToKebab(string) {
        return string.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Définit les propriétés CSS pour les sélecteurs actuels.
     * @param {Object} props - Les propriétés CSS à définir.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     *
     * @example
     *
     *
     * code html :
     * <article>
     *     <h1>Dynamic StyleSheet JavaScript</h1>
     * </article>
     *
     * code js :
     * const article = new DynSJS('article');
     *
     * article.rule('article') // Sélecteur principal
     *   .set({ backgroundColor: 'red', fontSize: '16px' }); {@link DynSJS#set} Voir la méthode set
     *   .nested('h1') {@link DynSJS#nested} Voir la méthode nested
     *
     *   export default article;
     *
     *   CSS généré :
     *
     *   article {
     *      background-color: red;
     *      font-size: 16px;
     *   }
     */
    set(props) {
        for (let key in props) {
            if (DynSJS._isValidProperty(key, props[key]) || typeof props[key] === 'object' && !Array.isArray(props[key])) {
                this._properties[key] = props[key];
            } else {
                throw new Error(`La propriété ou la valeur ${key}: ${props[key]} est invalide.`);
            }
        }
        return this;
    }

    /**
     * Ajoute un sélecteur enfant au(x) sélecteur(s) actuel(s).
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     * @example
     *
     * <article>
     *     <h1>Dynamic StyleSheet JavaScript</h1>
     * </article>
     *
     * const article = new DynSJS('article');
     *
     * article.rule('article') // Sélecteur principal
     *   .nested('h1')
     *      .set({ color: 'blue' }); // Sélecteur enfant
     *
     *   export default article;
     *
     *
     *   CSS généré :
     *
     *   article h1 { color: blue; }
     * @param selectors
     */
    nested(...selectors) {
        this._selectorStack.push([...this._selectors]);
        this._selectors = selectors.map(selector => {
            return this._selectors.map(s => selector.startsWith("::") ? `${s}${selector}` : `${s} ${selector}`);
        }).flat();
        return this;
    }

    /**
     * Ajoute une règle de requête média au(x) sélecteur(s) actuel(s).
     * @param {string} query - Condition de la requête média.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     *
     * @example
     *
     * code html :
     * <article>
     *     <h1>Dynamic StyleSheet JavaScript</h1>
     * </article>
     *
     * code js :
     * const article = new DynSJS('article');
     *
     * article.rule('article') // Sélecteur principal
     *   .set({ backgroundColor: 'red' }); // Propriétés CSS
     *   .nested('h1')
     *      .set({ color: 'blue' }); // Sélecteur enfant
     *   .media('(max-width: 600px)') // Condition de la requête média
     *      .set({ backgroundColor: 'red' }); // Propriétés CSS
     *      .nested('h1')
     *          .set({ color: 'blue' }); // Sélecteur enfant
     *
     *   export default article;
     *
     *   CSS généré :
     *
     *   article {
     *      background-color: red;
     *   }
     *
     *   article h1 {
     *      color: blue;
     *   }
     *
     *   @media (max-width: 600px) {
     *      article {
     *          background-color: red;
     *      }
     *      article h1 {
     *          color: blue;
     *      }
     *   }
     */
    media(query) {
        if (!query.trim()) throw new Error("Requête media invalide.");
        const rule = new DynSJS(...this._selectors);
        this._mediaQueries.push({ query, rule });
        return rule;
    }

    /**
     * Définit une fonction de condition pour la règle.
     * @param {function} conditionFn - Fonction pour évaluer la condition.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     */
    when(conditionFn) {
        if (typeof conditionFn !== 'function') throw new Error("`conditionFn` doit être une fonction.");
        this._conditionFn = conditionFn;
        return this;
    }
    _isConditionMet() {
        return this._parent && !this._parent._isConditionMet() ? false : this._conditionFn ? this._conditionFn() : true;
    }
    _generateSelectors(parentSelector) {
        return parentSelector ? this._selectors.map(selector => `${parentSelector} ${selector}`).join(', ') : this._selectors.join(', ');
    }
    _generateProperties() {
        return Object.entries(this._properties)
            .map(([key, value]) => typeof value === 'object' && !Array.isArray(value) ? `${key} { ${Object.entries(value).map(([k, v]) => `${k}: ${v};`).join(' ')} }` : `${DynSJS.camelToKebab(key)}: ${value};`)
            .join(' ');
    }

    /**
     * Définit la couleur pour la propriété donnée.
     * @param {Color} color - Couleur à définir.
     * @param {string} property - Propriété pour laquelle définir la couleur.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     * @example
     *
     * const redColor = new Color(255, 0, 0);
     * const style = new DynSJS('article');
     *
     * article.rule('article')
     *   .setColor(redColor, 'backgroundColor');
     */
    setColor(color, property) {
        if (!(color instanceof Color)) throw new Error("L'argument fourni n'est pas une instance de Color.");
        this._properties[property] = color.toRGBA();
        return this;
    }

    /**
     * Définit le texte pour le pseudo-élément ::before ou ::after.
     * @param {string} text - Texte à définir.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     * @example
     *
     * const style = new DynSJS('div');
     * style.nested('::before').setText('Hello');
     */
    setText(text) {
        if (typeof text !== 'string') throw new Error('Le texte fourni doit être une chaine de caractères.');
        this.set({ content: `"${text.replace(/"/g, '\\"')}"` });
        return this;
    }
    
    /**
     * Définit des styles pour l'état de survol d'un élément.
     * @param {Object} properties - Propriétés CSS à définir.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     * @example
     *
     * <button class="hover-button">Hover over me!</button>
     *
     * const button = new DynSJS('.hover-button');
     *
     * button.rule('.hover-button') // Sélecteur principal
     *   .set({ padding: '10px', backgroundColor: 'green', color: 'white' }) // Styles initiaux pour le bouton
     *   .hover({ backgroundColor: 'blue' }); // Styles pour l'état de survol du bouton
     *
     * export default button;
     *
     *
     * CSS généré :
     *
     * .hover-button { padding: 10px; background-color: green; color: white; }
     * .hover-button:hover { background-color: blue; }
     */
    hover(properties) {
        return this._addPseudoClassRule(':hover', properties);
    }

    /**
     * Définit des styles pour l'état actif d'un élément.
     * @param {Object} properties - Propriétés CSS à définir.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     * @example
     *
     * <button>Click Me</button>
     *
     * const btn = new DynSJS('button');
     *
     * btn.rule('button') // Sélecteur principal
     *   .active({ backgroundColor: 'blue' }); // Styles pour l'état actif
     *
     * export default btn;
     *
     *
     * CSS généré :
     *
     * button:active { background-color: blue; }
     */
    active(properties) {
        return this._addPseudoClassRule(':active', properties);
    }

    /**
     * Définit des styles pour l'état de focus d'un élément.
     * @param {Object} properties - Propriétés CSS à définir.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     * @example
     *
     * <input type="text" placeholder="Focus on me">
     *
     * const input = new DynSJS('input');
     *
     * input.rule('input') // Sélecteur principal
     *   .focus({ borderColor: 'blue' }); // Styles pour l'état de focus
     *
     * export default input;
     *
     *
     * CSS généré :
     *
     * input:focus { border-color: blue; }
     */
    focus(properties) {
        return this._addPseudoClassRule(':focus', properties);
    }
    _addPseudoClassRule(pseudoClass, properties) {
        const rule = new DynSJS(...this._selectors.map(s => `${s}${pseudoClass}`));
        rule.set(properties);
        this._children.push(rule);
        return this;
    }

    /**
     * Configure les propriétés flexbox pour une règle.
     *
     * @param {('row' | 'row-reverse' | 'column' | 'column-reverse')} [params.direction='row'] - Définit la direction des éléments flex.
     * @param {('start' | 'end' | 'center' | 'between' | 'around' | 'evenly')} [params.justify='start'] - Aligne les éléments flex le long de l'axe principal.
     * @param {('start' | 'end' | 'center' | 'stretch' | 'baseline')} [params.align='stretch'] - Aligne les éléments flex le long de l'axe transversal.
     * @param {('nowrap' | 'wrap' | 'wrap-reverse')} [params.wrap='nowrap'] - Indique si les éléments flex doivent être enroulés ou non.
     * @param {('start' | 'end' | 'center' | 'stretch' | 'between' | 'around' | 'evenly')} [params.alignContent='stretch'] - Aligne les lignes flex.
     * @param {number} [params.flexGrow=0] - Définit la capacité d'un élément flex à grandir.
     * @param {number} [params.flexShrink=1] - Définit la capacité d'un élément flex à rétrécir.
     * @param {('auto' | number | string)} [params.flexBasis='auto'] - Définit la taille par défaut d'un élément flex.
     * @param {number} [params.order=0] - Définit l'ordre pour positionner un élément flex.
     *
     * @returns {StyleSheet} L'instance actuelle de StyleSheet pour chaînage.
     *
     * @throws {Error} Lance une erreur si une propriété ou une valeur invalide est fournie.
     * @param params
     *
     * @example
     *
     * <article>
     *     <h1>Dynamic StyleSheet JavaScript</h1>
     * </article>
     *
     * const article = new DynSJS('article');
     * article.rule('article')
     *    .flexLayout({ direction: 'row', justify: 'center', align: 'center' });
     *
     *    CSS généré :
     *
     *    article {
     *        display: flex;
     *        flex-direction: row;
     *        justify-content: center;
     *        align-items: center;
     *    }
     */
    flexLayout(params = {}) {
        const flexTranslations = {
            display: 'display',
            direction: 'flex-direction',
            justify: 'justify-content',
            align: 'align-items',
            wrap: 'flex-wrap',
            alignContent: 'align-content',
            flexGrow: 'flex-grow',
            flexShrink: 'flex-shrink',
            flexBasis: 'flex-basis',
            order: 'order'
        };

        const flexConfig = Object.keys(params).reduce((acc, prop) => {
            if (flexTranslations[prop]) acc[flexTranslations[prop]] = params[prop];
            return acc;
        }, {});

        this.set(flexConfig);
        return this;
    }

    /**
     * Gère les transitions CSS pour les propriétés spécifiées.
     * @param {Object} properties - Un objet contenant les propriétés à animer et leur durée.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     * @example
     *
     * <article>
     *     <h1>Dynamic StyleSheet JavaScript</h1>
     * </article>
     *
     * const article = new DynSJS('article');
     *
     * article.rule('article')
     *    .transitionManager({ backgroundColor: '0.5s', width: '0.3s' });
     *
     *    CSS généré :
     *
     *    article {
     *       transition: background-color 0.5s, width 0.3s;
     *    }
     */
    transitionManager(properties) {
        const transitions = [];

        for (let property in properties) {
            const duration = properties[property];
            transitions.push(`${property} ${duration}`);
        }

        this.set({ transition: transitions.join(', ') });
        return this;
    }

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
                return `${result.selector} { ${result.properties} }`;
            }
            return '';
        }).join('\n').trim();

        const mediaCSS = this._mediaQueries.map(({ query, rule }) => {
            const cssResult = rule.toCSS(); // Notez le changement ici
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
