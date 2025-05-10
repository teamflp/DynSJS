// --- src/DynSJS.ts ---

import { Color } from "./Color.js";
import { isThemeLookup } from './utils.js';
import type { DynSJSTheme, StyleProperties, ConditionFunction, CSSEntry, SetFunction, StyleValue } from './types';

/**
 * Représente une règle CSS ou un bloc de règles au sein d'une `StyleSheet`.
 * Permet de définir des sélecteurs, des propriétés CSS, des règles imbriquées,
 * des media queries et des conditions d'application de manière chaînée et programmatique.
 * Les instances sont typiquement créées via `StyleSheet.rule()`.
 * @class DynSJS
 */
export class DynSJS {
    /** @internal Le thème hérité ou assigné, utilisé pour résoudre les valeurs. */
    private _theme: DynSJSTheme = {};
    /** @internal Indique si la règle est générée dans un contexte SSR. */
    private _ssr: boolean = false;
    /** @internal Les sélecteurs CSS pour cette règle spécifique. */
    private _selectors: string[] = [];
    /**
     * @internal Stocke les propriétés CSS brutes ou la fonction principale de `set()`.
     * Si c'est une fonction, elle sera exécutée par `_generateProperties` pour obtenir l'objet de style final.
     * Si c'est un objet, il contient les paires propriété-valeur (où les valeurs peuvent être des chaînes,
     * des nombres, des instances `Color`, des marqueurs `theme()`, des fonctions de valeur ou des tableaux).
     */
    private _properties: StyleProperties | SetFunction = {};
    /** @internal Liste des règles DynSJS enfants (créées via `nested()` ou par l'imbrication dans `set()`). */
    private _children: DynSJS[] = [];
    /** @internal Liste des media queries associées à cette règle. */
    private _mediaQueries: Array<{ query: string; rule: DynSJS }> = [];
    /** @internal Fonction optionnelle pour déterminer si cette règle doit s'appliquer. */
    private _conditionFn: ConditionFunction | null = null;
    /** @internal Référence à la règle parente, utilisée pour les conditions imbriquées et l'héritage de contexte. */
    _parent: DynSJS | null = null; // Laissé accessible pour _isConditionMet des enfants

    /**
     * @internal Crée une instance de DynSJS. Généralement appelé par `StyleSheet.rule()` ou en interne.
     * @param selectors Les sélecteurs CSS pour cette règle.
     * @param theme L'objet thème à utiliser.
     * @param ssr Flag indiquant le contexte SSR.
     * @param parent La règle DynSJS parente (pour l'imbrication).
     */
    constructor(selectors: string | string[] = [], theme: DynSJSTheme = {}, ssr: boolean = false, parent: DynSJS | null = null) {
        const selectorList = Array.isArray(selectors) ? selectors : [selectors].filter(Boolean);
        if (selectorList.length > 0 && !selectorList.every(DynSJS._isValidSelector)) { throw new Error("DynSJS: Invalid non-empty selectors provided to constructor."); }
        this._selectors = selectorList;
        this._properties = {}; // Initialisé comme objet vide pour les propriétés directes
        this._children = [];
        this._mediaQueries = [];
        this._conditionFn = null;
        this._parent = parent;
        this._theme = parent ? parent._theme : theme;
        this._ssr = parent ? parent._ssr : ssr;
    }

    /**
     * @private Valide si un sélecteur est une chaîne de caractères non vide après trim.
     */
    private static _isValidSelector(sel: any): sel is string { return typeof sel === 'string' && sel.trim().length > 0; }

    /**
     * @private Valide si la *valeur d'entrée* d'une propriété CSS est d'un type acceptable (avant résolution).
     * Accepte string, number, Color, ThemeLookup, Function, ou un tableau de ces types.
     */
    private static _isValidPropertyInput(key: string, value: any): boolean {
         if (typeof key !== 'string') return false;
         if (Array.isArray(value)) {
             return value.every(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'function' || item?.__isDynSJSColor === true || isThemeLookup(item));
         }
         return (typeof value === 'string' || typeof value === 'number' || typeof value === 'function' || value?.__isDynSJSColor === true || isThemeLookup(value));
    }

    /**
     * Convertit une chaîne camelCase en kebab-case (ex: `backgroundColor` -> `background-color`).
     * Gère également les préfixes vendeurs courants.
     * @param {string} string La chaîne à convertir.
     * @returns {string} La chaîne en kebab-case.
     * @example DynSJS.camelToKebab("WebkitTransform"); // "-webkit-transform"
     */
    static camelToKebab(string: string): string { let r = string.replace(/([a-z\d])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase(); if (/^(webkit|moz|ms|o)-/.test(r)) { r = '-' + r; } return r; }

    /**
     * @internal Récupère une valeur du thème en utilisant une clé (notation par points, ex: 'colors.primary').
     * Gère la détection de cycle pour éviter les boucles infinies.
     * @param {string} key La clé du thème.
     * @param {any} [defaultValue] Valeur à retourner si la clé n'est pas trouvée ou si la clé est invalide.
     * @param {Set<object>} [visited=new Set()] Utilisé en interne pour la détection de cycle.
     * @returns {any} La valeur du thème ou la valeur par défaut.
     */
    _getThemeValue(key: string, defaultValue: any = undefined, visited = new Set<object>()): any {
        try { if (typeof key !== 'string' || !key.trim()) return defaultValue; const keys = key.split('.'); let value = this._theme; if (visited.has(value)) { console.warn(`DynSJS: Circular theme ref detected: ${key}`); return defaultValue; } visited.add(value); for (const k of keys) { if (value && typeof value === 'object' && k in value) { const nextValue = value[k]; if (typeof nextValue === 'object' && nextValue !== null) { if (visited.has(nextValue)) { console.warn(`DynSJS: Circular theme ref at key "${k}" while accessing "${key}".`); return defaultValue; } visited.add(nextValue); } value = nextValue; } else { return defaultValue; } } return value; } catch (e) { console.error(`DynSJS: Theme access error for key "${key}":`, e); return defaultValue; }
    }

    /**
     * Définit les propriétés CSS pour cette règle.
     * Peut accepter un objet de propriétés directement, ou une fonction qui
     * reçoit `(theme, context)` et retourne un objet de propriétés.
     * Si un objet est fourni, ses propriétés sont fusionnées avec les propriétés existantes.
     * Si une fonction est fournie, elle remplace toute définition de propriété précédente.
     * La résolution finale des valeurs (fonctions de valeur, marqueurs `theme()`, etc.)
     * se fait au moment de `compile()`.
     * @param {StyleProperties | SetFunction} propsOrFn L'objet de propriétés ou la fonction qui le retourne.
     * @returns {this} L'instance DynSJS actuelle pour chaînage.
     * @example
     * rule.set({ color: 'blue', margin: '10px' });
     * rule.set(theme => ({
     * padding: theme.spacing.medium,
     * backgroundColor: theme.colors.primary
     * }));
     * rule.set({ // Fusionne avec les précédentes si _properties était un objet
     * color: theme('colors.accent'),
     * border: ['1px', 'solid', theme('colors.border')]
     * });
     */
    set(propsOrFn: StyleProperties | SetFunction): this {
        if (typeof propsOrFn === 'function') {
            this._properties = propsOrFn; // Stocke la fonction principale, écrase l'existant
        } else if (typeof propsOrFn === 'object' && propsOrFn !== null && !Array.isArray(propsOrFn)) {
            if (typeof this._properties === 'function') { this._properties = {}; } // Remplace la fonction par un objet
            for (const key in propsOrFn) {
                if (Object.prototype.hasOwnProperty.call(propsOrFn, key)) {
                    const value = propsOrFn[key];
                     if (!DynSJS._isValidPropertyInput(key, value)) { console.warn(`DynSJS: Invalid input value for "${key}" in set().`); continue; }
                     this._properties[key] = value; // Ajoute/Écrase la propriété
                }
            }
        } else { console.warn("DynSJS: Invalid argument passed to set(). Expected object or function."); }
        return this;
    }

    /**
     * Ajoute une règle CSS imbriquée comme enfant de la règle actuelle.
     * @param {...string} selectors Les sélecteurs CSS pour la nouvelle règle imbriquée.
     * @returns {DynSJS} Une nouvelle instance DynSJS représentant la règle imbriquée.
     * @example
     * sheet.rule('.parent')
     * .nested('&:hover') // Génère .parent:hover
     * .set({ color: 'red' });
     */
    nested(...selectors: string[]): DynSJS { const rule = new DynSJS(selectors, this._theme, this._ssr, this); this._children.push(rule); return rule; }

    /**
     * Crée un bloc de media query associé à la règle actuelle.
     * Les styles définis sur l'instance DynSJS retournée seront encapsulés
     * dans la media query spécifiée, avec le sélecteur de la règle actuelle comme contexte.
     * @param {string} query La condition de la media query (ex: '(min-width: 768px)').
     * @returns {DynSJS} Une nouvelle instance DynSJS pour ce bloc media.
     * @example
     * sheet.rule('.card')
     * .media('(max-width: 600px)')
     * .set({ flexDirection: 'column' });
     */
    media(query: string): DynSJS { if (typeof query !== 'string' || !query.trim()) { throw new Error("DynSJS: Invalid media query string."); } const rule = new DynSJS([], this._theme, this._ssr, this); this._mediaQueries.push({ query, rule }); return rule; }

    /**
     * Définit une condition pour l'application de cette règle (et de ses enfants/media).
     * La condition est une fonction qui reçoit l'objet thème et le flag SSR,
     * et doit retourner un booléen. Elle est évaluée au moment de `compile()`.
     * @param {ConditionFunction} conditionFn La fonction de condition.
     * @returns {this} L'instance DynSJS actuelle pour chaînage.
     * @example
     * sheet.rule('.admin-only')
     * .when((theme, ssr) => theme.user?.isAdmin === true)
     * .set({ display: 'block' });
     */
    when(conditionFn: ConditionFunction): this { if (typeof conditionFn !== 'function') { throw new Error("DynSJS: `conditionFn` must be a function."); } this._conditionFn = conditionFn; return this; }

    /**
     * @internal Évalue la condition de cette règle et de ses parents.
     * @returns {boolean} `true` si la règle doit être appliquée.
     */
    _isConditionMet(): boolean { if (this._parent && !this._parent._isConditionMet()) return false; try { return this._conditionFn ? this._conditionFn(this._theme, this._ssr) : true; } catch (e) { console.error("DynSJS: Error in 'when' condition:", e); return false; } }

    /**
     * @private Génère la chaîne de sélecteurs combinés pour cette règle,
     * en tenant compte du sélecteur parent et gérant le symbole `&`.
     * La sortie est triée pour assurer un ordre cohérent.
     */
    _generateSelectors(parentSelector: string = ''): string {
        const parentSelectors = parentSelector.trim().split(',').map(s => s.trim()).filter(Boolean);
        const currentSelectors = this._selectors;
        if (currentSelectors.length === 0) { return parentSelectors.join(', '); }
        if (parentSelectors.length === 0) { return currentSelectors.map(s => { const t = s.trim(); if (t === '&') return ''; return t.replace(/^&\s*/, '').trim(); }).filter(Boolean).join(', '); }
        const combined: string[] = [];
        parentSelectors.forEach(pSel => {
            currentSelectors.forEach(cSel => {
                const currentTrimmed = cSel.trim();
                if (currentTrimmed.includes('&')) { combined.push(currentTrimmed.replace(/&/g, pSel)); }
                else { if (currentTrimmed.startsWith(':') || currentTrimmed.startsWith('[') || currentTrimmed.startsWith('>') || currentTrimmed.startsWith('+') || currentTrimmed.startsWith('~')) { combined.push(`${pSel}${currentTrimmed}`); }
                       else { combined.push(`${pSel} ${currentTrimmed}`); } }
            });
        });
        //return [...new Set(combined)].sort().join(', ');
        return Array.from(new Set(combined)).sort().join(', ');
    }

    /**
     * @private Génère la chaîne des propriétés CSS pour cette règle.
     * Exécute les fonctions `set(t => {...})` si `_properties` est une fonction.
     * Résout les valeurs (fonctions de valeur, marqueurs thème, instances Color, tableaux).
     * @returns {string} Une chaîne de propriétés CSS (ex: "color: red; margin: 10px;").
     */
    _generateProperties(): string {
        let propsToProcess: StyleProperties;
        if (typeof this._properties === 'function') {
            try { propsToProcess = this._properties(this._theme, this); if (typeof propsToProcess !== 'object' || propsToProcess === null || Array.isArray(propsToProcess)) { console.warn("DynSJS: Function passed to set() did not return a plain object during CSS generation."); return ''; } }
            catch (e) { console.error("DynSJS: Error executing function from set() during CSS generation:", e); return ''; }
        } else { propsToProcess = this._properties; }

        return Object.entries(propsToProcess).map(([key, rawValue]) => {
            const resolveItem = (item: any): string | null => {
                let v: any = item;
                if (typeof v === 'function') { try { v = v(this._theme, this); } catch (e) { console.error(`DynSJS: Func prop value error for [${key}]:`, e); return null; } }
                if (isThemeLookup(v)) { v = this._getThemeValue(v.key, v.defaultValue); }
                if (v?.__isDynSJSColor === true) { v = (v as Color).toString(); }
                else if (typeof v === 'number') { v = String(v); }
                if (typeof v !== 'string') {
                    if (isThemeLookup(item) && v === undefined) { console.warn(`DynSJS: Theme key "${item.key}" not found for property "${key}" and no usable default value was provided. Skipping property.`); }
                    else if (typeof item === 'function' && v === undefined) { console.warn(`DynSJS: Function for property "${key}" returned undefined. Skipping property.`); }
                    else { console.warn(`DynSJS: Non-string value for property "${key}" (type: ${typeof v}). Skipping property.`); }
                    return null;
                }
                if (v.trim() === '') return null; return v;
            };
            let resolvedValue: string | null = null;
            if (Array.isArray(rawValue)) { resolvedValue = rawValue.map(resolveItem).filter((item): item is string => item !== null).join(' '); if (resolvedValue.trim() === '') resolvedValue = null; }
            else { resolvedValue = resolveItem(rawValue); }
            if (resolvedValue === null) return null;
            const kebabKey = DynSJS.camelToKebab(key); return `${kebabKey}: ${resolvedValue};`;
        }).filter((item): item is string => item !== null).join(' ');
    }

    /**
     * Définit une propriété de couleur en utilisant une instance de la classe `Color`.
     * @param {Color} color L'instance de `Color` à utiliser.
     * @param {string} [property='color'] La propriété CSS à définir (ex: 'color', 'backgroundColor').
     * @returns {this} L'instance DynSJS actuelle pour chaînage.
     * @throws {Error} Si le premier argument n'est pas une instance de `Color`.
     */
    setColor(color: Color, property: string = 'color'): this {
        if (color?.__isDynSJSColor !== true) { throw new Error("DynSJS: First argument to setColor must be an instance of Color."); }
        if (typeof this._properties === 'function') {
            console.warn("DynSJS: Calling setColor after set(Function) will replace the function based properties. Define colors within the function or call set with an object first.");
            this._properties = {};
        }
        this._properties[property] = color;
        return this;
    }

    /**
     * Définit une variable CSS (propriété personnalisée) sur la règle actuelle.
     * Ajoute automatiquement '--' au nom si manquant.
     * @param {string} name Nom de la variable (ex: 'primary-color' ou '--primary-color').
     * @param {StyleValue} value Valeur de la variable.
     * @returns {this} L'instance DynSJS actuelle pour chaînage.
     */
    setVar(name: string, value: StyleValue): this {
        const varName = name.startsWith('--') ? name : `--${name}`;
        if (typeof this._properties === 'function') {
            console.warn("DynSJS: Calling setVar after set(Function) will replace the function based properties. Define variables within the function or call set with an object first.");
            this._properties = {};
        }
        this._properties[varName] = value;
        return this;
    }

    /**
     * @internal Convertit cette règle (et ses enfants/media) en une structure CSS partielle.
     * Appelé par `StyleSheet.compile()`.
     * @param {string} [parentSelector=''] Sélecteur parent pour l'imbrication.
     * @returns {CSSEntry | null} Un objet contenant les parties du CSS, ou null si la règle est vide ou non applicable.
     */
    toCSS(parentSelector: string = ''): CSSEntry | null {
        if (!this._isConditionMet()) return null;
        const sel = this._generateSelectors(parentSelector);
        const props = this._generateProperties();
        let ruleCSS = "";
        if (props && sel) { ruleCSS = `${sel} { ${props} }`; }
        else if (!props && sel && (this._children.length > 0 || this._mediaQueries.length > 0)) { /* Contexte pour enfants/media */ }
        else if (!sel && props) { console.warn("DynSJS: Rule has properties but no valid selectors generated:", props); }
        else if (!sel && !this._children.length && !this._mediaQueries.length && !props) { return null; }

        const childrenCSS = this._children.map(c => c.toCSS(sel)).filter((o): o is CSSEntry => o !== null).map(o => (o.ruleCSS || '') + (o.childrenCSS ? '\n' + o.childrenCSS : '')).filter(Boolean).join('\n');
        const mediaCSS = this._mediaQueries.map(({ query, rule }) => { const o = rule.toCSS(sel); if (o && (o.ruleCSS || o.childrenCSS || o.mediaCSS?.length)) { let c = (o.ruleCSS || '') + (o.childrenCSS ? '\n' + o.childrenCSS : ''); if (o.mediaCSS?.length) console.warn("DynSJS: Nested media queries in toCSS output are flattened; deep merging happens in StyleSheet."); return { query, css: c.trim() }; } return null; }).filter((m): m is { query: string; css: string; } => m !== null);

        if (!ruleCSS.trim() && !childrenCSS.trim() && mediaCSS.length === 0) return null;
        return { ruleCSS: ruleCSS.trim(), childrenCSS: childrenCSS.trim(), mediaCSS: mediaCSS };
    }
}
