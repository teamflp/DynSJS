// --- src/DynSJS.ts --- 

import { Color } from "./Color.js";
import { isThemeLookup } from './utils.js';
import type { DynSJSTheme, StyleProperties, ConditionFunction, CSSEntry, SetFunction, StyleValue } from './types';

/**
 * Represents a CSS rule or a block. Enables chaining.
 */
export class DynSJS {
    private _theme: DynSJSTheme = {};
    private _ssr: boolean = false;
    private _selectors: string[] = [];
    private _properties: StyleProperties | SetFunction = {};
    private _children: DynSJS[] = [];
    private _mediaQueries: Array<{ query: string; rule: DynSJS }> = [];
    private _conditionFn: ConditionFunction | null = null;
    _parent: DynSJS | null = null;

    /** @internal */
    constructor(selectors: string | string[] = [], theme: DynSJSTheme = {}, ssr: boolean = false, parent: DynSJS | null = null) {
        const selectorList = Array.isArray(selectors) ? selectors : [selectors].filter(Boolean);
        if (selectorList.length > 0 && !selectorList.every(DynSJS._isValidSelector)) { throw new Error("Invalid non-empty selectors."); }
        this._selectors = selectorList; this._properties = {}; this._children = []; this._mediaQueries = [];
        this._conditionFn = null; this._parent = parent; this._theme = parent ? parent._theme : theme; this._ssr = parent ? parent._ssr : ssr;
    }

    private static _isValidSelector(sel: any): sel is string { return typeof sel === 'string' && sel.trim().length > 0; }
    private static _isValidPropertyInput(key: string, value: any): boolean {
         if (typeof key !== 'string') return false;
         if (Array.isArray(value)) { return value.every(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'function' || item?.__isDynSJSColor === true || isThemeLookup(item)); }
         return (typeof value === 'string' || typeof value === 'number' || typeof value === 'function' || value?.__isDynSJSColor === true || isThemeLookup(value));
    }
    static camelToKebab(string: string): string { let r = string.replace(/([a-z\d])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase(); if (/^(webkit|moz|ms|o)-/.test(r)) { r = '-' + r; } return r; }
    _getThemeValue(key: string, defaultValue: any = undefined, visited = new Set<object>()): any { try { if (typeof key !== 'string' || !key.trim()) return defaultValue; const keys = key.split('.'); let value = this._theme; if (visited.has(value)) { console.warn(`Circular theme ref: ${key}`); return defaultValue; } visited.add(value); for (const k of keys) { if (value && typeof value === 'object' && k in value) { const nextValue = value[k]; if (typeof nextValue === 'object' && nextValue !== null) { if (visited.has(nextValue)) { console.warn(`Circular theme ref at ${k}: ${key}`); return defaultValue; } visited.add(nextValue); } value = nextValue; } else { return defaultValue; } } return value; } catch (e) { console.error(`Theme access error: ${key}`, e); return defaultValue; } }

    set(propsOrFn: StyleProperties | SetFunction): this {
        if (typeof propsOrFn === 'function') { this._properties = propsOrFn; }
        else if (typeof propsOrFn === 'object' && propsOrFn !== null && !Array.isArray(propsOrFn)) {
            if (typeof this._properties === 'function') { this._properties = {}; }
            for (const key in propsOrFn) { if (Object.prototype.hasOwnProperty.call(propsOrFn, key)) { const value = propsOrFn[key]; if (!DynSJS._isValidPropertyInput(key, value)) { console.warn(`Invalid input value for "${key}"`); continue; } this._properties[key] = value; } }
        } else { console.warn("DynSJS: Invalid argument passed to set(). Expected object or function."); }
        return this;
    }

    // --- MÉTHODE setVar AJOUTÉE ---
    /**
     * Définit une variable CSS (propriété personnalisée) sur la règle actuelle.
     * Ajoute automatiquement '--' si manquant.
     * @param name Nom de la variable (ex: 'primary-color' ou '--primary-color')
     * @param value Valeur de la variable (peut être string, number, Color, theme(), etc.)
     * @returns {this}
     */
    setVar(name: string, value: StyleValue): this {
        const varName = name.startsWith('--') ? name : `--${name}`;
        if (typeof this._properties === 'function') {
            console.warn("DynSJS: Calling setVar after set(Function) will replace the function with an object. Define variables within the function if possible.");
            this._properties = {};
        }
        this._properties[varName] = value;
        return this;
    }
    // --- FIN MÉTHODE setVar ---

    nested(...selectors: string[]): DynSJS { const rule = new DynSJS(selectors, this._theme, this._ssr, this); this._children.push(rule); return rule; }
    media(query: string): DynSJS { if (typeof query !== 'string' || !query.trim()) { throw new Error("Invalid media query."); } const rule = new DynSJS([], this._theme, this._ssr, this); this._mediaQueries.push({ query, rule }); return rule; }
    when(conditionFn: ConditionFunction): this { if (typeof conditionFn !== 'function') { throw new Error("`conditionFn` must be a function."); } this._conditionFn = conditionFn; return this; }
    _isConditionMet(): boolean { if (this._parent && !this._parent._isConditionMet()) return false; try { return this._conditionFn ? this._conditionFn(this._theme, this._ssr) : true; } catch (e) { console.error("Error in 'when' condition:", e); return false; } }

    // --- MÉTHODE _generateSelectors AVEC .sort() ---
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
                       else { combined.push(`${pSel} ${currentTrimmed}`); }
                }
            });
        });
        return [...new Set(combined)].sort().join(', '); // Tri pour ordre cohérent
    }
    // --- FIN _generateSelectors ---

    _generateProperties(): string {
        let propsToProcess: StyleProperties;
        if (typeof this._properties === 'function') {
            try { propsToProcess = this._properties(this._theme, this); if (typeof propsToProcess !== 'object' || propsToProcess === null || Array.isArray(propsToProcess)) { console.warn("DynSJS: Function passed to set() did not return a plain object."); return ''; } }
            catch (e) { console.error("DynSJS: Error executing function from set():", e); return ''; }
        } else { propsToProcess = this._properties; }

        return Object.entries(propsToProcess).map(([key, rawValue]) => {
            const resolveItem = (item: any): string | null => {
                let v: any = item;
                if (typeof v === 'function') { try { v = v(this._theme, this); } catch (e) { console.error(`Func prop value error [${key}]:`, e); return null; } }
                if (isThemeLookup(v)) { v = this._getThemeValue(v.key, v.defaultValue); }
                if (v?.__isDynSJSColor === true) { v = (v as Color).toString(); }
                else if (typeof v === 'number') { v = String(v); }
                if (typeof v !== 'string') {
                    if (isThemeLookup(item) && v === undefined) { console.warn(`DynSJS: Theme key "${item.key}" not found for property "${key}" and no usable default value was provided.`); }
                    else if (typeof item === 'function' && v === undefined) { /* Erreur déjà loggée */ }
                    else { console.warn(`DynSJS: Non-string value for property "${key}" (type: ${typeof v}). Skipping.`); }
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

    setColor(color: Color, property: string = 'color'): this { if (color?.__isDynSJSColor !== true) { throw new Error("First arg must be a Color instance."); } if (typeof this._properties === 'function') { this._properties = {}; } this._properties[property] = color; return this; }
    toCSS(parentSelector: string = ''): CSSEntry | null {
        if (!this._isConditionMet()) return null;
        const sel = this._generateSelectors(parentSelector);
        const props = this._generateProperties();
        let ruleCSS = '';
        if (props && sel) {
            ruleCSS = `${sel} { ${props} }`;
        } else if (!props && sel && (this._children.length > 0 || this._mediaQueries.length > 0)) {
            /* Context only */
        } else if (!sel && props) {
            console.warn("Rule props without selector:", props);
        } else if (!sel && !this._children.length && !this._mediaQueries.length) {
            return null;
        }

        const childrenCSS = this._children
            .map(c => c.toCSS(sel))
            .filter((o): o is CSSEntry => o !== null)
            .map(o => (o.ruleCSS || '') + (o.childrenCSS ? '\n' + o.childrenCSS : ''))
            .filter(Boolean)
            .join('\n');

        const mediaCSS = this._mediaQueries
            .map(({ query, rule }) => {
                const o = rule.toCSS(sel);
                if (o && (o.ruleCSS || o.childrenCSS || o.mediaCSS?.length)) {
                    let c = (o.ruleCSS || '') + (o.childrenCSS ? '\n' + o.childrenCSS : '');
                    if (o.mediaCSS?.length) console.warn("Nested media queries detected.");
                    return { query, css: c.trim() };
                }
                return null;
            })
            .filter((m): m is { query: string; css: string } => m !== null);

        if (!ruleCSS && !childrenCSS && mediaCSS.length === 0) return null;
        return {
            ruleCSS: ruleCSS.trim(),
            childrenCSS: childrenCSS.trim(),
            mediaCSS: mediaCSS,
        };
    }
}
