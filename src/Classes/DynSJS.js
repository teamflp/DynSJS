/**
 * @file DynSJS - Dynamic StyleSheet JavaScript
 * @author Paterne Guélablé Gnonzion
 * @version v1.0.0
 * @date 2023-06-01
 * @description Générateur de feuilles de style dynamiques.
 * @license MIT
 */
import { ColorManager } from "./ColorManager.js";

/**
 *
 * La bibliothèque DynSJS, ou Dynamic StyleSheet JavaScript, est une bibliothèque JavaScript
 * qui permet de générer dynamiquement des feuilles de style (CSS) en JavaScript.
 * Voici quelques-uns de ses avantages :<br><br>
 * 1. Dynamisme : Permet de créer des styles qui peuvent être modifiés dynamiquement en fonction des actions de l'utilisateur,
 *    des données en temps réel, etc. Cela peut être particulièrement utile pour les applications web interactives.<br>
 *
 * <br>2. Modularité : Permet de structurer le code CSS en modules JavaScript, ce qui peut rendre le code plus lisible, réutilisable et maintenable.<br>
 *
 * <br>3. Programmabilité : Permet d'utiliser toute la puissance de JavaScript pour créer des styles, y compris des boucles, des conditions, des fonctions, etc.<br>
 *
 * <br>4. Compatibilité : Facilite la gestion des préfixes de navigateur et des incompatibilités entre navigateurs.<br>
 *
 * @property {string[]} _selectors - Sélecteurs CSS pour la règle.
 * @property {Object} _properties - Propriétés CSS pour la règle.
 * @property {DynSJS[]} _children - Sélecteurs enfants pour la règle.
 * @property {Object[]} _mediaQueries - Règles de requête média pour la règle.
 * @property {function} _conditionFn - Fonction de condition pour la règle.
 * @property {string[]} _selectorStack - Pile de sélecteurs pour la règle.
 * @property {DynSJS} _parent - Parent de la règle.
 *
 */
export class DynSJS {
    _parent;
    styleSheet;
    _propertyStack;
    _pseudoClasses;
    _rules;
    _children;

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
        this._propertyStack = [];
        this._pseudoClasses = [];
        this._rules = [];
        this.whenStyles = {};
        this.otherwiseStyles = {};
        this.currentStyles = this.whenStyles;  // Par défaut, les méthodes modifient les styles "when"
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
     * Ajoute des préfixes de navigateur aux propriétés spécifiées pour assurer la compatibilité
     * avec différents navigateurs.
     *
     * @param {Object} properties - Les propriétés à préfixer.
     * @returns {Object} Un objet contenant les propriétés préfixées.
     *
     * @example
     *
     * import { StyleSheet } from '../Classes/StyleSheet.js';
     * import { colorRed } from './vars.js';
     * import {DynSJS} from "../Classes/DynSJS.js";
     *
     * const footer = new StyleSheet();
     *
     * // Styles principaux pour le footer
     * footer.rule('footer') // Sélecteur principal
     *     .setColor(colorRed, 'backgroundColor')
     *     .set({ width: '100%', padding: '30px', textAlign: 'center' })
     *     .set(DynSJS.addPrefixes({ width: '100%' }))
     *     .flexLayout({ direction: 'row', justify: 'center', align: 'center' });
     *
     *
     * Cela génère le CSS suivant :
     *
     * footer {
     *      background-color: rgba(255,0,0,0.5);
     *      width: 100%;
     *      padding: 30px;
     *      text-align: center;
     *      webkit-width: 100%;
     *      moz-width: 100%;
     *      ms-width: 100%;
     *      o-width: 100%;
     *      flex-direction: row;
     *      justify-content: center;
     *      align-items: center;
     * }
     */
    static addPrefixes(properties) {
        const prefixes = ['webkit', 'moz', 'ms', 'o'];
        const prefixedProperties = {};

        for (let key in properties) {
            const value = properties[key];
            const camelCaseKey = key.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

            prefixes.forEach(prefix => {
                const prefixedKey = `${prefix}${camelCaseKey.charAt(0).toUpperCase()}${camelCaseKey.slice(1)}`;
                prefixedProperties[prefixedKey] = value;
            });

            prefixedProperties[key] = value;
        }

        return prefixedProperties;
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
        // Si _isOtherwiseActive est true, alors ne faites rien et retournez simplement this.
        if (this._isOtherwiseActive) return this;

        for (let key in props) {
            if (DynSJS._isValidProperty(key, props[key]) || typeof props[key] === 'object' && !Array.isArray(props[key])) {
                this._properties = {...this._properties, ...{[key]: props[key]}};
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
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        this._selectorStack.push([...this._selectors]);
        this._propertyStack.push({...this._properties});  // ajouter les propriétés actuelles

        // Réinitialiser les propriétés
        this._properties = {};

        // Remplacer les sélecteurs actuels par les nouveaux sélecteurs
        this._selectors = selectors.map(selector => {
            return this._selectors.map(s => selector.startsWith("::") ? `${s}${selector}` : `${s} ${selector}`);
        }).flat();

        return this;
    }
    end() {
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;
        if (this._selectorStack.length > 0) {
            this._selectors = this._selectorStack.pop();
        } else {
            console.warn("Aucun état précédent à restaurer");
        }
        return this;
    }

    /**
     * Ajoute une requête media à la règle.
     *
     * L'avantage de cette méthode est sa flexibilité et sa facilité d'utilisation : <br>
     * <br>1. Multiple Queries : Elle permet d'ajouter plusieurs requêtes média en une seule fois, ce qui facilite la gestion des styles pour différents points de rupture ou orientations.<br>
     * 2. Chaînage des méthodes : Elle retourne l'objet `DynSJS` courant, ce qui permet de chaîner d'autres méthodes à la suite. Cela rend le code plus lisible et plus compact.<br>
     * 3. Gestion des erreurs : Elle vérifie que chaque requête média est valide avant de l'ajouter à la liste des requêtes média, ce qui aide à prévenir les erreurs.<br>
     * 4. Modularité : En retournant une nouvelle instance de `DynSJS` pour chaque requête média, elle permet d'appliquer des styles spécifiques à chaque requête média, tout en gardant le code organisé et facile à comprendre.<br>
     *
     * @param {string} query - La requête media.
     * @throws {Error} Si la requête media est invalide.
     * @return {DynSJS} L'instance courante de DynSJS.
     * @example
     * article.rule('.container')
     *    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
     *        .flexLayout({ display: 'flex', direction: 'column' })
     */
    media(query) {
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        if (!query.trim()) throw new Error("Requête media invalide.");
        const rule = new DynSJS(...this._selectors);
        this._mediaQueries.push({query, rule});
        return rule;
    }

    /**
     * Applique une condition à la règle. Si la condition est évaluée à `false`,
     * les méthodes suivantes de la chaîne seront ignorées jusqu'à ce qu'un `otherwise` soit appelé.
     *
     * @param {Function|boolean} condition - La condition à évaluer ou une valeur booléenne.
     * Si une fonction est fournie, elle sera exécutée et son résultat sera utilisé comme condition.
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     *
     * @example
     * const myStyle = new StyleSheet();
     *
     * function isNightTime() {
     *     const currentHour = new Date().getHours();
     *     return currentHour < 6 || currentHour > 18;  // Supposons que la nuit soit entre 18h00 et 6h00.
     * }
     *
     * myStyle.rule('.night-mode')
     *   .when(isNightTime)
     *      .set({ backgroundColor: 'black', color: 'white' })
     *   .otherwise()
     *   .set({ backgroundColor: 'white', color: 'black' });
     */
    when(condition) {
        let conditionResult;

        if (typeof condition === 'function') {
            conditionResult = condition();
        } else {
            conditionResult = condition;
        }

        // Si la condition est fausse, activez _isOtherwiseActive pour ignorer les méthodes suivantes.
        if (!conditionResult) {
            this._isOtherwiseActive = true;
        }

        return this;
    }

    /**
     * La méthode `otherwise` est utilisée pour définir des styles qui doivent être appliqués lorsque la condition définie par la méthode `when` est évaluée à `false`.
     * Si la condition est évaluée à `true`, les méthodes chaînées après `otherwise` seront ignorées.
     *
     * @returns {DynSJS} - L'instance actuelle pour permettre le chaînage.
     *
     * @example
     * const myStyle = new StyleSheet();
     *
     * function isNightTime() {
     *     const currentHour = new Date().getHours();
     *     return currentHour < 6 || currentHour > 18;  // Supposons que la nuit soit entre 18h00 et 6h00.
     * }
     *
     * myStyle.rule('.theme')
     *   .when(isNightTime)
     *      .set({ backgroundColor: 'black', color: 'white' })
     *   .otherwise()
     *   .set({ backgroundColor: 'white', color: 'black' });
     */
    otherwise() {
        if (!this._conditionFn || !this._conditionFn()) {
            this._isOtherwiseActive = true;
            return this;
        }
        this._isOtherwiseActive = false;
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
     * Définit la couleur d'une propriété CSS.
     *
     * Cette méthode accepte une liste d'arguments où chaque paire d'arguments représente une couleur et une propriété CSS.
     * Par exemple, pour définir la couleur de fond en rouge et la couleur du texte en bleu, vous pouvez appeler
     * @exemple
     *
     * @param {...*} args - Une liste d'arguments où chaque paire d'arguments est une couleur (une instance de la classe ColorManager)
     * et une propriété CSS (une chaîne de caractères). Par exemple, `setColor(rouge, 'backgroundColor', bleu, 'color')`.
     *
     * @throws {Error} Lance une exception si un des arguments de couleur n'est pas une instance de la classe Color.
     *
     * @returns {DynSJS} Renvoie l'instance actuelle de DynSJS pour permettre les appels de méthodes en chaîne.
     *
     *  footer.rule('footer')
     *      setColor(colorBlack, 'backgroundColor', colorWhite, 'color').
     */
    /*setColor(...args) {
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        for (let i = 0; i < args.length; i += 2) {
            const color = args[i];
            const property = args[i + 1];
            if (!(color instanceof ColorManager)) throw new Error("L'argument fourni n'est pas une instance de Color.");
            this._properties[property] = color.toRGBA();
        }
        return this;
    }*/

    setColor(...args) {
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        for (let i = 0; i < args.length; i += 2) {
            const colorValue = args[i];
            const property = args[i + 1];

            // Si c'est une instance de ColorManager
            if (colorValue instanceof ColorManager) {
                this._properties[property] = colorValue.toRGBA();
            } else if (typeof colorValue === 'string') {
                // Si c'est une valeur hexadécimale
                if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(colorValue)) {
                    this._properties[property] = ColorManager.fromHex(colorValue).toRGBA();
                }
                // Pour d'autres formats comme RGB, RGBA, etc., nous les acceptons directement.
                else {
                    this._properties[property] = colorValue;
                }
            } else {
                throw new Error("Format de couleur non supporté.");
            }
        }
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
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        if (typeof transition === 'string') {
            this._properties.transition = transition;
        } else if (typeof transition === 'object') {
            const {property, duration, timingFunction} = transition;
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
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        if (typeof text !== 'string') throw new Error('Le texte fourni doit être une chaine de caractères.');
        this.set({content: `"${text.replace(/"/g, '\\"')}"`});
        return this;
    }

    /**
     * Ajoute une classe d'icône à tous les éléments correspondant au sélecteur donné.
     *
     * @param {string} selector - Le sélecteur CSS des éléments auxquels ajouter la classe d'icône.
     * @param {string} iconClass - La classe d'icône à ajouter aux éléments.
     * @throws {Error} Le sélecteur et la classe d'icône doivent être des chaînes de caractères.
     * @returns {object} L'instance de la classe.
     *
     * @example
     * // Supposons que vous avez un élément dans votre HTML comme suit :
     * <i id="my-icon"></i>
     *
     * // Et que vous appelez :
     * setIcon('#my-icon', 'fa fa-home');
     *
     * // L'élément dans le DOM serait mis à jour pour ressembler à ceci :
     * <i id="my-icon" class="fa fa-home"></i>
     *
     * // Cela signifie que les styles associés à la classe 'fa' et 'fa-home'
     * // dans votre CSS seront appliqués à cet élément.
     */
    setIcon(selector, iconClass) {
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        console.log('setIcon', selector, iconClass);
        if (typeof selector !== 'string' || typeof iconClass !== 'string') {
            throw new Error('Le sélecteur et la classe d\'icône doivent être des chaînes de caractères.');
        }

        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
        const document = dom.window.document;

        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.classList.add(iconClass);
        });

        return this;
    }

    /**
     * Définit les propriétés de filtre CSS pour l'élément cible.
     *
     * @param {string|Object} filter - Si c'est une chaîne, elle représente la valeur CSS directe pour la propriété `filter`.
     *                                Si c'est un objet, chaque clé représente le nom du filtre et sa valeur représente la valeur du filtre.
     * @returns {DynSJS} L'instance actuelle de DynSJS pour permettre le chaînage.
     * @throws {Error} Lance une erreur si l'argument fourni n'est pas une chaîne ou un objet de propriétés.
     *
     * @example
     * .setFilter('blur(5px)') // Chaîne directe
     * .setFilter({ blur: '5px', brightness: '150%' }) // Objet de propriétés
     */
    setFilter(filter) {
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        if (typeof filter === 'string') {
            this._properties.filter = filter;
        } else if (typeof filter === 'object') {
            this._properties.filter = Object.entries(filter)
                .map(([key, value]) => `${key}(${value})`)
                .join(' ');
        } else {
            throw new Error("L'argument fourni doit être une chaîne CSS ou un objet de propriétés.");
        }
        return this;
    }

    /**
     * Applique une pseudo-classe à un élément et définit ses styles.
     *
     * @param {string} pseudo - La pseudo-classe à appliquer (par exemple, "hover" pour ":hover").
     * @param {Object} properties - Les styles à appliquer à cette pseudo-classe.
     * @returns {DynSJS} L'instance actuelle pour le chaînage des méthodes.
     * @throws {Error} Si le pseudo fourni n'est pas une chaîne de caractères.
     *
     * @example
     * const myStyle = new StyleSheet();
     *
     * myStyle.rule('button')
     *    .set({ backgroundColor: 'blue', color: 'white' })
     *    .setPseudo('hover', { backgroundColor: 'darkblue' });
     *
     * // Cela générera le CSS suivant :
     * // button { backgroundColor: 'blue'; color: 'white'; }
     * // button:hover { backgroundColor: 'darkblue'; }
     *
     */
    setPseudo(pseudo, properties) {
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        if (typeof pseudo !== 'string') throw new Error('Le pseudo fourni doit être une chaîne de caractères.');

        const pseudoClass = new DynSJS(`${this._selectors.join(', ')}:${pseudo}`);
        pseudoClass.set(properties);
        this._children.push(pseudoClass); // Ajouter cette nouvelle règle à la liste des règles enfants

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
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        const flexTranslations = {
            display: 'display',
            flexDirection: 'flex-direction',
            justifyContent: 'justify-content',
            alignItems: 'align-items',
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
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

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
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

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
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        if (typeof animation === 'string') {
            this._properties.animation = animation;
        } else if (typeof animation === 'object') {
            const {
                name,
                duration,
                timingFunction,
                delay,
                iterationCount,
                direction,
                fillMode,
                playState,
                keyframes
            } = animation;
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
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

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
     * Exécute une fonction pour chaque élément d'un tableau avec des options de filtrage et de transformation.
     *
     * @param {Array} array - Le tableau sur lequel itérer.
     * @param {Function} callback - La fonction à exécuter pour chaque élément du tableau.
     * @param {Object} [options] - Les options de filtrage et de transformation.
     * @param {Function} [options.filter] - Une fonction qui détermine si un élément doit être inclus dans la boucle.
     * @param {Function} [options.transform] - Une fonction qui transforme un élément avant qu'il ne soit passé au callback.
     * @returns {DynSJS} L'instance actuelle de DynSJS pour permettre le chaînage des méthodes.
     *
     * @example
     * const myStyle = new StyleSheet();
     * const colors = ['red', 'green', 'blue'];
     *
     * myStyle.each(colors, (color, index) => {
     *    myStyle.rule(`.color-${index}`)
     *        .set({ backgroundColor: color });
     * }, {
     *    filter: color => color !== 'green',  // Exclude 'green'
     *    transform: color => color.toUpperCase()  // Transform colors to uppercase
     * });
     *
     * // Cela générera le CSS suivant :
     * // .color-0 { backgroundColor: 'RED'; }
     * // .color-2 { backgroundColor: 'BLUE'; }
     *
     */
    each(array, callback, options = {}) {
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        const {filter, transform} = options;
        array.forEach((item, index) => {
            if (filter && !filter(item, index)) return;
            let value = item;
            if (transform) value = transform(item, index);
            callback(value, index);
        });
        return this;
    }

    /**
     * Exécute plusieurs méthodes de l'instance DynSJS actuelle.
     *
     * @param {Object} methods - Un objet dont les clés sont les noms des méthodes à appeler et les valeurs sont des tableaux d'arguments à passer à ces méthodes.
     * @returns {Object} Un objet contenant les résultats des méthodes appelées.
     * @throws {Error} Si les arguments pour une méthode ne sont pas dans un tableau.
     * @throws {Error} Si une méthode spécifiée n'existe pas dans DynSJS.
     * @throws {Error} Si une erreur se produit lors de l'appel d'une méthode.
     * @async
     *
     * @example
     * const myStyle = new StyleSheet();
     *
     * const results = await myStyle.delegate({
     *     set: [{ backgroundColor: 'red' }],
     *     setColor: [['yellow', 'color']]
     * });
     *
     * console.log(results.set);  // Expected: myStyle instance after `set` method call
     * console.log(results.setColor);  // Expected: myStyle instance after `setColor` method call
     *
     */
    async delegate(methods) {
        // Si _isOtherwiseActive est true, alors on ne fait rien et on retourne simplement this.
        if (this._isOtherwiseActive) return this;

        const results = {};
        for (let method in methods) {
            if (typeof this[method] === 'function') {
                const args = methods[method];
                if (!Array.isArray(args)) {
                    throw new Error(`Les arguments pour ${method} doivent être dans un tableau.`);
                }
                try {
                    const result = this[method](...args);
                    if (result instanceof Promise) {
                        results[method] = await result;
                    } else {
                        results[method] = result;
                    }
                } catch (error) {
                    throw new Error(`Erreur lors de l'appel de la méthode ${method}: ${error}`);
                }
            } else {
                throw new Error(`${method} n'est pas une méthode de DynSJS.`);
            }
        }
        return results;
    }

    toCSS(parentSelector = '') {
        // Si _isOtherwiseActive est true, retournez null.
        if (this._isOtherwiseActive) return null;

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

        const mediaCSS = this._mediaQueries.map(({query, rule}) => {
            const cssResult = rule.toCSS();
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

        childrenCssString = `${keyframesCSS}\n${childrenCssString}`;

        return {result, childrenCSS: childrenCssString, mediaCSS, keyframesCSS};
    }

}