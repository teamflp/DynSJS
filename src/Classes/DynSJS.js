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
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     * @param condition
     */
    when(condition) {
        if (typeof condition === 'function') {
            this._conditionFn = () => {
                if (typeof window !== 'undefined') {
                    return condition();
                } else if (process.env.SCREEN_WIDTH) {
                    return condition(Number(process.env.SCREEN_WIDTH));
                } else {
                    console.warn('La condition ne peut pas être évaluée dans l\'environnement Node.js');
                    return false;
                }
            };
        } else {
            this._conditionFn = () => condition;
        }
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
    _generateKeyframes() {
        if (!this._keyframesCSS) return '';
        return this._keyframesCSS;
    }

    _addPseudoClassRule(pseudoClass, properties) {
        const rule = new DynSJS(...this._selectors.map(s => `${s}${pseudoClass}`));
        rule.set(properties);
        this._children.push(rule);
        return this;
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
     * Définit la propriété de transition de l'élément.
     *
     * @param {string|Object} transition - Une chaîne CSS de transition ou un objet contenant les propriétés de transition.
     * @param {string} [transition.property] - La propriété à animer.
     * @param {string} [transition.duration] - La durée de l'animation.
     * @param {string} [transition.timingFunction] - La fonction d'atténuation de l'animation.
     * @returns {DynSJS} L'instance DynSJS pour le chaînage des méthodes.
     *
     * @example
     * HTML :
     * <article>
     *     <h1>Dynamic StyleSheet JavaScript</h1>
     *     <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.</p>
     * </article>
     *
     * JS :
     * // Définit la transition de l'élément article
     * article.rule('article')
     *     .setTransition({
     *         property: 'all',
     *         duration: '0.5s',
     *         timingFunction: 'ease-in-out'
     *     });
     *
     *   CSS généré :
     *   article {
     *       transition: all 0.5s ease-in-out;
     *   }
     */
    setTransition(transition) {
        if (typeof transition === 'string') {
            this._properties.transition = transition;
        } else if (typeof transition === 'object') {
            const { property, duration, timingFunction } = transition;
            this._properties.transition = `${property} ${duration} ${timingFunction}`;
        } else {
            throw new Error("L'argument fourni doit être une chaîne CSS ou un objet de propriétés.");
        }
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
     * Définit les propriétés flex de l'élément.
     *
     * @param {Object} params - Un objet contenant les propriétés flex à définir.
     * @param {number} [params.flexGrow] - La valeur de la propriété flex-grow.
     * @param {number} [params.flexShrink] - La valeur de la propriété flex-shrink.
     * @param {string|number} [params.flexBasis] - La valeur de la propriété flex-basis.
     * @param {number} [params.order] - La valeur de la propriété order.
     * @param {string} [params.alignSelf] - La valeur de la propriété align-self.
     * @returns {DynSJS} L'instance DynSJS pour le chaînage des méthodes.
     *
     * @example
     * HTML :
     * <article>
     *     <h1>Dynamic StyleSheet JavaScript</h1>
     *     <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.</p>
     * </article>
     *
     * JS :
     * // Définit les propriétés flex de l'élément article
     * article.rule('article')
     *     .flexItem({
     *         flexGrow: 1,
     *         flexShrink: 2,
     *         flexBasis: '50%',
     *         order: 1,
     *         alignSelf: 'center'
     *     });
     *
     *   CSS généré :
     *   article {
     *       flex-grow: 1;
     *       flex-shrink: 2;
     *       flex-basis: 50%;
     *       order: 1;
     *       align-self: center;
     *   }
     */
    flexItem(params = {}) {
        const flexTranslations = {
            flexGrow: 'flex-grow',
            flexShrink: 'flex-shrink',
            flexBasis: 'flex-basis',
            order: 'order',
            alignSelf: 'align-self'
        };

        const flexConfig = Object.keys(params).reduce((acc, prop) => {
            if (flexTranslations[prop]) acc[flexTranslations[prop]] = params[prop];
            return acc;
        }, {});

        this.set(flexConfig);
        return this;
    }

    /**
     * Définit les propriétés de la grille de l'élément.
     *
     * @param {Object} grid - Un objet contenant les propriétés de la grille.
     * @returns {DynSJS} L'instance DynSJS pour le chaînage des méthodes.
     *
     * @throws {Error} Lance une erreur si l'argument fourni n'est pas un objet de propriétés.
     *
     * @example
     * HTML :
     * <div class="grid-container"></div>
     *
     * Option 1 : objet
     * JS :
     * const gridContainer = new StyleSheet();
     *
     * gridContainer.rule('.grid-container')
     *   .setGrid({
     *      display: 'grid',
     *      gridTemplateColumns: 'repeat(3, 1fr)',
     *      gridGap: '10px'
     *   });
     *
     * Option 2 : chaîne de caractères
     *
     * gridContainer.rule('.grid-container')
     *  .setGrid('display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 10px;');
     */
    setGrid(grid) {
        if (typeof grid === 'object') {
            const gridConfig = Object.keys(grid).reduce((acc, prop) => {
                acc[prop] = grid[prop];
                return acc;
            }, {});
            this.set(gridConfig);
        } else {
            throw new Error("L'argument fourni doit être un objet de propriétés.");
        }
        return this;
    }

    /**
     * Définit l'animation de l'élément : nom, durée, fonction d'atténuation, délai, nombre d'itérations, direction, mode de remplissage et état de lecture.
     *
     * @param {string|Object} animation - Une chaîne CSS d'animation ou un objet contenant les propriétés de l'animation.
     * @param {string} [animation.name] - Le nom de l'animation.
     * @param {string} [animation.duration] - La durée de l'animation.
     * @param {string} [animation.timingFunction] - La fonction d'atténuation de l'animation.
     * @param {string} [animation.delay] - Le délai avant le début de l'animation.
     * @param {string} [animation.iterationCount] - Le nombre de fois que l'animation doit être jouée.
     * @param {string} [animation.direction] - La direction de l'animation.
     * @param {string} [animation.fillMode] - La manière dont l'animation doit appliquer les styles à sa cible avant et après son exécution.
     * @param {string} [animation.playState] - L'état de lecture de l'animation.
     * @param {Object} [animation.keyframes] - Les keyframes de l'animation.
     * @returns {DynSJS} L'instance DynSJS pour le chaînage des méthodes.
     *
     * @throws {Error} Lance une erreur si une propriété ou une valeur invalide est fournie.
     *
     * @example
     *
     * <button>Click me</button>
     *
     * JS :
     *
     * const button = new StyleSheet();
     *
     * button.rule('@keyframes bounce')
     *    .set({ '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)' } });
     *
     * button.rule('button')
     *    .setAnimation(bounce)
     *
     */
    setAnimation(animation) {
        if (typeof animation === 'string') {
            this._properties.animation = animation;
        } else if (typeof animation === 'object') {
            const { name, duration, timingFunction, delay, iterationCount, direction, fillMode, playState, keyframes } = animation;
            this._properties.animation = [name, duration, timingFunction, delay, iterationCount, direction, fillMode, playState].filter(Boolean).join(' ');

            // Ajouter les keyframes au CSS généré
            if (keyframes) {
                const keyframesString = Object.entries(keyframes).map(([key, value]) => {
                    const properties = Object.entries(value).map(([k, v]) => `${k}: ${v};`).join(' ');
                    return `${key} { ${properties} }`;
                }).join(' ');

                this._keyframesCSS = `@keyframes ${name} { ${keyframesString} }`;
            }
        } else {
            throw new Error("L'argument fourni doit être une chaîne CSS ou un objet de propriétés.");
        }
        return this;
    }

    /**
     * Définit la transformation de l'élément.
     *
     * @param {string|Object} transform - Une chaîne CSS de transformation ou un objet contenant les propriétés de transformation.
     * @returns {DynSJS} L'instance DynSJS pour le chaînage des méthodes.
     *
     * @throws {Error} Lance une erreur si une propriété ou une valeur invalide est fournie.
     *
     * @example
     * HTML :
     * <button>Click me</button>
     *
     * JS :
     * Option 1 : Chaîne de caractères
     *
     * button.rule('button')
     *   .setTransform('rotate(45deg) scale(1.5)');
     *
     * Option 2 : Objet
     *
     * button.rule('button')
     *   .setTransform({
     *      rotate: '45deg',
     *      scale: '1.5'
     *   });
     *
     */
    setTransform(transform) {
        if (typeof transform === 'string') {
            this._properties.transform = transform;
        } else if (typeof transform === 'object') {
            this._properties.transform = Object.entries(transform)
                .map(([key, value]) => `${key}(${value})`)
                .join(' ');
        } else {
            throw new Error("L'argument fourni doit être une chaîne CSS ou un objet de propriétés.");
        }
        return this;
    }

    /**
     * Définit les propriétés de la pseudo-classe de l'élément.
     *
     * @param {string|Object} pseudoClass - Le nom de la pseudo-classe (par exemple, 'hover', 'active', etc.) ou un objet contenant les pseudo-classes et leurs propriétés.
     * @param {Object} [properties] - Un objet contenant les propriétés CSS à appliquer à la pseudo-classe. Ignoré si `pseudoClass` est un objet.
     * @returns {DynSJS} L'instance DynSJS pour le chaînage des méthodes.<br><b>
     *
     * <br>Pour plus d'informations sur les pseudo-classes, consultez la documentation de MDN :
     * <a href="https://developer.mozilla.org/fr/docs/Web/CSS/Pseudo-classes" target="_blank">Pseudo-classes MDN</a>
     *
     * @example
     * <button>Click me</button>
     *
     * JS :
     *
     * const button = new StyleSheet()
     *
     * // Option 1 : Chaîne de caractères
     * button.rule('button')
     *   .setPseudo('hover', {
     *      backgroundColor: 'blue',
     *      color: 'white'
     *   });
     *
     * // Option 2 : Objet
     * button.rule('button')
     *   .setPseudo({
     *      hover: {
     *          backgroundColor: 'blue',
     *          color: 'white'
     *      },
     *      active: {
     *          backgroundColor: 'red',
     *          color: 'white'
     *      }
     *   });
     *
     */
    setPseudo(pseudoClass, properties) {
        if (typeof pseudoClass === 'string') {
            return this._addPseudoClassRule(`:${pseudoClass}`, properties);
        } else if (typeof pseudoClass === 'object') {
            Object.entries(pseudoClass).forEach(([key, value]) => {
                this._addPseudoClassRule(`:${key}`, value);
            });
            return this;
        } else {
            throw new Error("L'argument 'pseudoClass' doit être une chaîne de caractères ou un objet de propriétés.");
        }
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

        const keyframesCSS = this._generateKeyframes();

        // Ajoutez cette ligne pour inclure les keyframes dans la chaîne CSS générée
        childrenCssString = `${keyframesCSS}\n${childrenCssString}`;

        return {result, childrenCSS: childrenCssString, mediaCSS, keyframesCSS};
    }


}
