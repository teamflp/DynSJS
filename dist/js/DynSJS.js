// --- src/DynSJS.ts --- (Version Finale Corrigée)
import { isThemeLookup } from './utils.js';
/**
 * Represents a CSS rule or a block. Enables chaining.
 */
export class DynSJS {
    /** @internal */
    constructor(selectors = [], theme = {}, ssr = false, parent = null) {
        // Propriétés privées
        this._theme = {};
        this._ssr = false;
        this._selectors = [];
        // _properties peut contenir soit l'objet de styles, soit la fonction qui le retourne
        this._properties = {};
        this._children = [];
        this._mediaQueries = [];
        this._conditionFn = null;
        this._parent = null; // Garder accessible pour _isConditionMet
        const selectorList = Array.isArray(selectors) ? selectors : [selectors].filter(Boolean);
        if (selectorList.length > 0 && !selectorList.every(DynSJS._isValidSelector)) {
            throw new Error("Invalid non-empty selectors.");
        }
        this._selectors = selectorList;
        this._properties = {};
        this._children = [];
        this._mediaQueries = [];
        this._conditionFn = null;
        this._parent = parent;
        this._theme = parent ? parent._theme : theme;
        this._ssr = parent ? parent._ssr : ssr;
    }
    // --- MÉTHODES STATIQUES (Versions finales) ---
    static _isValidSelector(sel) {
        return typeof sel === 'string' && sel.trim().length > 0;
    }
    static _isValidPropertyInput(key, value) {
        if (typeof key !== 'string')
            return false;
        // Vérifie si c'est un tableau et si chaque élément est valide
        if (Array.isArray(value)) {
            // Note: On ne vérifie pas récursivement les fonctions/arrays ici pour éviter complexité/boucles infinies dans la validation simple.
            // La résolution dans _generateProperties gérera les types internes.
            return value.every(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'function' || (item === null || item === void 0 ? void 0 : item.__isDynSJSColor) === true || isThemeLookup(item));
        }
        // Vérifie les types primitifs/autorisés
        return (typeof value === 'string' || typeof value === 'number' || typeof value === 'function' || (value === null || value === void 0 ? void 0 : value.__isDynSJSColor) === true || isThemeLookup(value));
    }
    // Version finale gérant préfixes et nombres
    static camelToKebab(string) {
        let r = string
            .replace(/([a-z\d])([A-Z])/g, '$1-$2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
            .toLowerCase();
        if (/^(webkit|moz|ms|o)-/.test(r)) {
            r = '-' + r;
        }
        return r;
    }
    // --- FIN MÉTHODES STATIQUES ---
    // --- MÉTHODES PUBLIQUES / INTERNES ---
    /** @internal Gets theme value with cycle detection */
    _getThemeValue(key, defaultValue = undefined, visited = new Set()) {
        try {
            // Correction: Vérifier type avant trim
            if (typeof key !== 'string' || key.trim() === '')
                return defaultValue;
            const keys = key.split('.');
            let value = this._theme;
            if (visited.has(value)) {
                console.warn(`Circular theme ref detected: ${key}`);
                return defaultValue;
            }
            visited.add(value);
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    const nextValue = value[k];
                    if (typeof nextValue === 'object' && nextValue !== null) {
                        if (visited.has(nextValue)) {
                            console.warn(`Circular theme ref at key "${k}" while accessing "${key}".`);
                            return defaultValue;
                        }
                        visited.add(nextValue);
                    }
                    value = nextValue;
                }
                else {
                    return defaultValue;
                } // Chemin non trouvé
            }
            return value; // Valeur finale
        }
        catch (e) {
            console.error(`Theme access error for key "${key}":`, e);
            return defaultValue;
        }
    }
    /**
     * Sets CSS properties. Stores the object or the function itself.
     * Resolution happens in _generateProperties. Allows merging with object argument.
     */
    // --- MÉTHODE SET FINALE ---
    set(propsOrFn) {
        // 1. Si l'argument est une fonction, on la stocke directement (écrase l'existant)
        if (typeof propsOrFn === 'function') {
            this._properties = propsOrFn;
        }
        // 2. Si c'est un objet valide
        else if (typeof propsOrFn === 'object' && propsOrFn !== null && !Array.isArray(propsOrFn)) {
            // Assure que _properties est un objet avant de fusionner/ajouter
            if (typeof this._properties === 'function') {
                // Si on avait une fonction, on la remplace par un objet vide avant d'ajouter les nouvelles props
                this._properties = {};
            }
            // Ajoute/Écrase les propriétés fournies dans l'objet _properties actuel
            for (const key in propsOrFn) {
                if (Object.prototype.hasOwnProperty.call(propsOrFn, key)) {
                    const value = propsOrFn[key];
                    if (!DynSJS._isValidPropertyInput(key, value)) {
                        console.warn(`DynSJS: Invalid property value type provided for "${key}" in set(). Skipping.`);
                        continue;
                    }
                    this._properties[key] = value; // Stocke/Écrase la valeur brute
                }
            }
        }
        // 3. Argument invalide
        else {
            console.warn("DynSJS: Invalid argument passed to set(). Expected an object or a function.");
        }
        return this; // Pour chaînage
    }
    // --- FIN MÉTHODE SET ---
    nested(...selectors) { const rule = new DynSJS(selectors, this._theme, this._ssr, this); this._children.push(rule); return rule; }
    media(query) { if (typeof query !== 'string' || !query.trim()) {
        throw new Error("Invalid media query.");
    } const rule = new DynSJS([], this._theme, this._ssr, this); this._mediaQueries.push({ query, rule }); return rule; }
    when(conditionFn) { if (typeof conditionFn !== 'function') {
        throw new Error("`conditionFn` must be a function.");
    } this._conditionFn = conditionFn; return this; }
    /** @internal */ _isConditionMet() { if (this._parent && !this._parent._isConditionMet())
        return false; try {
        return this._conditionFn ? this._conditionFn(this._theme, this._ssr) : true;
    }
    catch (e) {
        console.error("Error in 'when' condition:", e);
        return false;
    } }
    /** @private */ _generateSelectors(parentSelector = '') { const p = parentSelector.trim(); const c = this._selectors; if (c.length === 0)
        return p; if (!p)
        return c.map(s => s.trim().replace(/^&\s*/, '').trim()).filter(Boolean).join(', ') || ''; return c.map(s => { const t = s.trim(); const sep = /^[[:.[#]>]/.test(t) || t.includes('&') ? '' : ' '; return p.split(',').map(ps => t.includes('&') ? t.replace(/&/g, ps.trim()) : `${ps.trim()}${sep}${t}`).join(', '); }).join(', '); }
    /** @private Generates property string, handles array/function values */
    // --- MÉTHODE _generateProperties FINALE ---
    _generateProperties() {
        let propsToProcess;
        // 1. Obtenir l'objet de propriétés à traiter (exécuter la fonction si nécessaire)
        if (typeof this._properties === 'function') {
            try {
                propsToProcess = this._properties(this._theme, this); // Exécute la fonction stockée
                if (typeof propsToProcess !== 'object' || propsToProcess === null || Array.isArray(propsToProcess)) {
                    console.warn("DynSJS: Function passed to set() did not return a plain object during compile.");
                    return '';
                }
            }
            catch (e) {
                console.error("DynSJS: Error executing function passed to set() during compile:", e);
                return '';
            }
        }
        else {
            propsToProcess = this._properties; // Utilise l'objet stocké
        }
        // 2. Itérer sur les propriétés finales et résoudre les valeurs
        return Object.entries(propsToProcess).map(([key, rawValue]) => {
            // Fonction interne pour résoudre une valeur (string, number, Color, theme(), function, ou array)
            const resolveItem = (item) => {
                let v = item;
                // ORDRE DE RÉSOLUTION : Fonction -> Thème -> Color -> Nombre -> String
                if (typeof v === 'function') {
                    try {
                        v = v(this._theme, this);
                    }
                    catch (e) {
                        console.error(`Func prop value error [${key}]:`, e);
                        return null;
                    }
                }
                if (isThemeLookup(v)) {
                    v = this._getThemeValue(v.key, v.defaultValue);
                }
                if ((v === null || v === void 0 ? void 0 : v.__isDynSJSColor) === true) {
                    v = v.toString();
                }
                else if (typeof v === 'number') {
                    v = String(v);
                }
                // Validation finale
                if (typeof v !== 'string') {
                    console.warn(`Non-string value [${key}]: ${typeof v}`);
                    return null;
                }
                if (v.trim() === '')
                    return null; // Ignore chaînes vides
                return v;
            };
            let resolvedValue = null;
            // Gestion des Tableaux
            if (Array.isArray(rawValue)) {
                resolvedValue = rawValue.map(resolveItem).filter((item) => item !== null).join(' ');
                if (resolvedValue.trim() === '')
                    resolvedValue = null;
            }
            // Gestion des valeurs simples
            else {
                resolvedValue = resolveItem(rawValue);
            }
            if (resolvedValue === null)
                return null; // Skip si valeur finale invalide
            const kebabKey = DynSJS.camelToKebab(key);
            return `${kebabKey}: ${resolvedValue};`;
        }).filter((item) => item !== null).join(' '); // Filtre les nulls et joint
    }
    // --- FIN MÉTHODE _generateProperties ---
    /** Helper to set a color property */
    // --- MÉTHODE setColor FINALE ---
    setColor(color, property = 'color') {
        if ((color === null || color === void 0 ? void 0 : color.__isDynSJSColor) !== true) {
            throw new Error("First arg must be a Color instance.");
        }
        // Assigne la propriété, que _properties soit un objet ou une fonction
        // Si _properties est une fonction, elle sera écrasée par un objet ici.
        if (typeof this._properties === 'function') {
            this._properties = {};
        }
        this._properties[property] = color; // Assigne la couleur
        return this;
    }
    // --- FIN MÉTHODE setColor ---
    /** @internal Converts rule to CSS parts */
    toCSS(parentSelector = '') {
        if (!this._isConditionMet())
            return null;
        const sel = this._generateSelectors(parentSelector);
        const props = this._generateProperties();
        let ruleCSS = "";
        if (props && sel) {
            ruleCSS = `${sel} { ${props} }`;
        }
        else if (!props && sel && (this._children.length > 0 || this._mediaQueries.length > 0)) { /* Context only */ }
        else if (!sel && props) {
            console.warn("Rule props without selector:", props);
        }
        else if (!sel && !this._children.length && !this._mediaQueries.length) {
            return null;
        }
        const childrenCSS = this._children.map(c => c.toCSS(sel)).filter((o) => o !== null).map(o => (o.ruleCSS || '') + (o.childrenCSS ? '\n' + o.childrenCSS : '')).filter(Boolean).join('\n');
        const mediaCSS = this._mediaQueries.map(({ query, rule }) => { var _a, _b; const o = rule.toCSS(sel); if (o && (o.ruleCSS || o.childrenCSS || ((_a = o.mediaCSS) === null || _a === void 0 ? void 0 : _a.length))) {
            let c = (o.ruleCSS || '') + (o.childrenCSS ? '\n' + o.childrenCSS : '');
            if ((_b = o.mediaCSS) === null || _b === void 0 ? void 0 : _b.length)
                console.warn("Nested media queries detected.");
            return { query, css: c.trim() };
        } return null; }).filter((m) => m !== null);
        if (!ruleCSS && !childrenCSS && mediaCSS.length === 0)
            return null;
        return { ruleCSS: ruleCSS.trim(), childrenCSS: childrenCSS.trim(), mediaCSS: mediaCSS };
    }
}
//# sourceMappingURL=DynSJS.js.map