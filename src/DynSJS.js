// --- src/DynSJS.js ---

import { Color } from "./Color.js";
import { isThemeLookup } from './utils.js';

/**
 * Represents a CSS rule or a block.
 */
export class DynSJS {
    _theme = {}; _ssr = false; _selectors = []; _properties = {};
    _children = []; _mediaQueries = []; _conditionFn = null; _parent = null;

    /** @internal */
    constructor(selectors = [], theme = {}, ssr = false, parent = null) {
        const selectorList = Array.isArray(selectors) ? selectors : [selectors].filter(Boolean);
        if (selectorList.length > 0 && !selectorList.every(DynSJS._isValidSelector)) { throw new Error("Invalid non-empty selectors."); }
        this._selectors = selectorList; this._properties = {}; this._children = []; this._mediaQueries = [];
        this._conditionFn = null; this._parent = parent; this._theme = parent ? parent._theme : theme; this._ssr = parent ? parent._ssr : ssr;
    }
    /** @private */ static _isValidSelector(sel) { return typeof sel === 'string' && sel.trim().length > 0; }
    /** @private */ static _isValidPropertyInput(key, value) { return typeof key === 'string' && (typeof value === 'string' || typeof value === 'number' || typeof value === 'function' || value?.__isDynSJSColor === true || isThemeLookup(value)); } // Utilise le marqueur Color
    /** Convertit camelCase en kebab-case */ static camelToKebab(string) { let r = string.replace(/([a-z\d])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase(); if (/^(webkit|moz|ms|o)-/.test(r)) { r = '-' + r; } return r; }
    /** @internal */ _getThemeValue(key, defaultValue = undefined, visited = new Set()) { try { if (typeof key !== 'string' || !key.trim()) return defaultValue; const keys = key.split('.'); let value = this._theme; if (visited.has(value)) { console.warn(`Circular theme ref: ${key}`); return defaultValue; } visited.add(value); for (const k of keys) { if (value && typeof value === 'object' && k in value) { const nextValue = value[k]; if (typeof nextValue === 'object' && nextValue !== null) { if (visited.has(nextValue)) { console.warn(`Circular theme ref at ${k}: ${key}`); return defaultValue; } visited.add(nextValue); } value = nextValue; } else { return defaultValue; } } return value; } catch (e) { console.error(`Theme access error: ${key}`, e); return defaultValue; } }
    /** Sets CSS properties */ set(props) { for (let key in props) { const value = props[key]; if (!DynSJS._isValidPropertyInput(key, value)) { console.warn(`Invalid prop input: ${key}`); continue; } this._properties[key] = value; } return this; }
    /** Adds a nested rule */ nested(...selectors) { const rule = new DynSJS(selectors, this._theme, this._ssr, this); this._children.push(rule); return rule; }
    /** Adds a media query rule */ media(query) { if (typeof query !== 'string' || !query.trim()) { throw new Error("Invalid media query."); } const rule = new DynSJS([], this._theme, this._ssr, this); this._mediaQueries.push({ query, rule }); return rule; }
    /** Sets a condition */ when(conditionFn) { if (typeof conditionFn !== 'function') { throw new Error("`conditionFn` must be a function."); } this._conditionFn = conditionFn; return this; }
    /** @internal */ _isConditionMet() { if (this._parent && !this._parent._isConditionMet()) return false; try { return this._conditionFn ? this._conditionFn(this._theme, this._ssr) : true; } catch (e) { console.error("Error in 'when' condition:", e); return false; } }
    /** @private */ _generateSelectors(parentSelector = '') { const p = parentSelector.trim(); const c = this._selectors; if (c.length === 0) return p; if (!p) return c.map(s => s.trim().replace(/^&\s*/, '').trim()).filter(Boolean).join(', ') || ''; return c.map(s => { const t = s.trim(); return p.split(',').map(ps => t.includes('&') ? t.replace(/&/g, ps.trim()) : `${ps.trim()} ${t}`).join(', '); }).join(', '); }
    /** @private */ _generateProperties() { return Object.entries(this._properties).map(([key, rawValue]) => { let v = rawValue; if (isThemeLookup(v)) { v = this._getThemeValue(v.key, v.defaultValue); } if (typeof v === 'function') { try { v = v(this._theme, this); } catch (e) { console.error(`Func prop error [${key}]:`, e); return null; } } if (v?.__isDynSJSColor === true) { v = v.toString(); } if (typeof v === 'number') { v = String(v); } if (typeof v !== 'string') { if (isThemeLookup(rawValue) && v === undefined) { console.warn(`Theme key "${rawValue.key}" not found [${key}]`); } else if (typeof rawValue === 'function' && v === undefined) { console.warn(`Func prop no return [${key}]`); } else { console.warn(`Non-string value [${key}]: ${typeof v}`); } return null; } if (v.trim() === '') return null; return `${DynSJS.camelToKebab(key)}: ${v};`; }).filter(item => item !== null).join(' '); }
    /** Helper to set a color property */ setColor(color, property = 'color') { if (color?.__isDynSJSColor !== true) { throw new Error("First arg must be a Color instance."); } this._properties[property] = color; return this; }
    /** @internal */ toCSS(parentSelector = '') { if (!this._isConditionMet()) return null; const sel = this._generateSelectors(parentSelector); const props = this._generateProperties(); let ruleCSS = ""; if (props && sel) { ruleCSS = `${sel} { ${props} }`; } else if (!props && sel && (this._children.length > 0 || this._mediaQueries.length > 0)) {/* Context only */ } else if (!sel && props) { console.warn("Rule props without selector:", props); } else if (!sel && !this._children.length && !this._mediaQueries.length) { return null; } const childrenCSS = this._children.map(c => c.toCSS(sel)).filter(Boolean).map(o => (o.ruleCSS || '') + (o.childrenCSS ? '\n' + o.childrenCSS : '')).filter(Boolean).join('\n'); const mediaCSS = this._mediaQueries.map(({ query, rule }) => { const o = rule.toCSS(sel); if (o && (o.ruleCSS || o.childrenCSS || o.mediaCSS?.length)) { let c = (o.ruleCSS || '') + (o.childrenCSS ? '\n' + o.childrenCSS : ''); if (o.mediaCSS?.length) console.warn("Nested media queries detected."); return { query, css: c.trim() }; } return null; }).filter(Boolean); if (!ruleCSS && !childrenCSS && !mediaCSS.length) return null; return { ruleCSS: ruleCSS.trim(), childrenCSS: childrenCSS.trim(), mediaCSS: mediaCSS }; }
}