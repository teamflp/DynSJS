(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.DynSJS = {}));
})(this, (function (exports) { 'use strict';

    // Helper interne (pas besoin d'exporter)
    function isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
    /** Deep merge utility */
    function deepMerge(target, source) {
        const output = Object.assign({}, target);
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach((key) => {
                if (isObject(source[key])) {
                    if (!(key in target) || !isObject(target[key])) {
                        output[key] = deepMerge({}, source[key]);
                    }
                    else {
                        output[key] = deepMerge(target[key], source[key]);
                    }
                }
                else {
                    output[key] = source[key];
                }
            });
        }
        else if (isObject(source)) {
            return deepMerge({}, source);
        }
        return output;
    }
    // --- Helpers Theming ---
    const THEME_LOOKUP_MARKER = '__isThemeLookupRequest__';
    /** Theme value lookup marker generator */
    function theme(key, defaultValue = undefined) {
        if (!key.trim()) {
            console.warn(`DynSJS: Invalid theme key: "${key}".`);
        }
        return { [THEME_LOOKUP_MARKER]: true, key: key || '', defaultValue: defaultValue };
    }
    /** @internal Checks for theme marker */
    function isThemeLookup(value) {
        return typeof value === 'object' && value !== null && value[THEME_LOOKUP_MARKER] === true;
    }

    // --- src/DynSJS.ts --- (Version Finale Corrigée)
    /**
     * Represents a CSS rule or a block. Enables chaining.
     */
    class DynSJS {
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
            else if (!props && sel && (this._children.length > 0 || this._mediaQueries.length > 0)) ;
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

    // --- src/StyleSheet.ts ---
    // Thème par défaut
    const defaultTheme = {};
    // Gestion des balises Style
    const styleTags = new Map();
    /**
     * Manages DynSJS rules, compiles them, handles injection, includes basic caching.
     */
    class StyleSheet {
        constructor(userTheme = {}, options = {}) {
            this._rules = [];
            this._keyframes = {};
            this._theme = {};
            this._ssr = false;
            this._styleTagId = 'dynsjs-styles';
            this._warnedAboutSSR = false;
            this._dirty = true;
            this._cachedCSS = null;
            this._theme = deepMerge(defaultTheme, userTheme || {});
            this._ssr = options.ssr || false;
            this._styleTagId = options.styleTagId || `dynsjs-styles-${Math.random().toString(36).substring(7)}`;
            this._dirty = true;
            this._cachedCSS = null;
        }
        /** Sets a new theme, merging over current, invalidates cache and clears injected styles. */
        setTheme(newTheme) {
            // --- CORRECTION : Fusion sur le thème ACTUEL ---
            const mergedTheme = deepMerge(this._theme, newTheme || {});
            this._theme = mergedTheme;
            // --- FIN CORRECTION ---
            this._updateRuleThemeRecursive(this._rules, this._theme); // Propage le thème mis à jour
            this._dirty = true; // Invalide le cache
            this._cachedCSS = null;
            this.clearInjected(); // Nettoie les anciens styles
        }
        /** @private - Propagates theme update recursively */
        _updateRuleThemeRecursive(rules, newTheme) {
            // ---> AJOUT LOG <---
            //console.log(`DEBUG _updateRuleThemeRecursive: Mise à jour de ${rules.length} règle(s)`);
            rules.forEach(rule => {
                var _a, _b, _c, _d;
                const currentSelectors = rule._selectors; // Accès pour log
                console.log(`DEBUG _updateRuleThemeRecursive: Règle [${currentSelectors.join(', ')}]. Thème AVANT:`, (_b = (_a = rule._theme) === null || _a === void 0 ? void 0 : _a.colors) === null || _b === void 0 ? void 0 : _b.primary); // Log avant
                rule._theme = newTheme; // Met à jour thème enfant
                console.log(`DEBUG _updateRuleThemeRecursive: Règle [${currentSelectors.join(', ')}]. Thème APRES:`, (_d = (_c = rule._theme) === null || _c === void 0 ? void 0 : _c.colors) === null || _d === void 0 ? void 0 : _d.primary); // Log après
                // Propagation récursive (inchangée)
                if (rule._children.length > 0) {
                    this._updateRuleThemeRecursive(rule._children, newTheme);
                }
                if (rule._mediaQueries.length > 0) {
                    rule._mediaQueries.forEach((mq) => this._updateRuleThemeRecursive([mq.rule], newTheme));
                }
            });
        }
        // --- FIN CORRECTION ---
        /** Adds a rule. Invalidates cache. */
        rule(...selectors) {
            this._dirty = true;
            this._cachedCSS = null;
            const rule = new DynSJS(selectors, this._theme, this._ssr);
            this._rules.push(rule);
            return rule;
        }
        /** Defines keyframes. Invalidates cache. */
        keyframes(name, definition) {
            if (typeof name !== 'string' || !name.trim() || typeof definition !== 'object' || definition === null) {
                throw new Error("Invalid keyframes args.");
            }
            this._dirty = true;
            this._cachedCSS = null;
            this._keyframes[name] = definition;
            return this;
        }
        /** Compiles CSS, using cache if available. */
        compile() {
            if (!this._dirty && this._cachedCSS !== null) {
                return this._cachedCSS;
            }
            let allRuleCSS = [], allChildrenCSS = [], keyframesCSS = "", mediaOutput = "";
            const mediaQueryMap = new Map();
            // 1. Compiler les règles
            this._rules.forEach(rule => {
                var _a;
                const output = rule.toCSS();
                if (output) {
                    if (output.ruleCSS)
                        allRuleCSS.push(output.ruleCSS);
                    if (output.childrenCSS)
                        allChildrenCSS.push(output.childrenCSS);
                    if ((_a = output.mediaCSS) === null || _a === void 0 ? void 0 : _a.length) {
                        output.mediaCSS.forEach(({ query, css }) => {
                            if (!mediaQueryMap.has(query))
                                mediaQueryMap.set(query, []);
                            const trimmedCss = css.trim();
                            if (trimmedCss)
                                mediaQueryMap.get(query).push(trimmedCss);
                        });
                    }
                }
            });
            // 2. Compiler les keyframes
            keyframesCSS = Object.entries(this._keyframes).map(([name, definition]) => {
                const steps = Object.entries(definition).map(([step, props]) => {
                    const propString = Object.entries(props).map(([key, value]) => {
                        let finalValue = value;
                        if (typeof value === 'function') {
                            try {
                                finalValue = value(this._theme, null);
                            } // Appel fonction thème (avec null pour contexte)
                            catch (e) {
                                console.error(`Keyframe func error [${name},${step},${key}]:`, e);
                                return null;
                            }
                        }
                        // --- CORRECTION : Utilisation du marqueur __isDynSJSColor ---
                        if ((finalValue === null || finalValue === void 0 ? void 0 : finalValue.__isDynSJSColor) === true) {
                            finalValue = finalValue.toString(); // Appelle toString si c'est une Color
                        }
                        // --- FIN CORRECTION ---
                        else if (typeof finalValue === 'number') {
                            finalValue = String(finalValue);
                        }
                        if (typeof finalValue !== 'string') {
                            // Retiré le log de débogage, mais garder l'avertissement peut être utile
                            console.warn(`DynSJS: Resolved value for keyframe prop "${key}" in step "${step}" is not a string (got ${typeof finalValue}). Skipping.`);
                            return null;
                        }
                        if (finalValue.trim() === '')
                            return null; // Ignore chaînes vides
                        return `${DynSJS.camelToKebab(key)}: ${finalValue};`;
                    }).filter((item) => item !== null).join(' '); // Filtre props nulles
                    return propString ? `${step} { ${propString} }` : null; // Retourne null si étape vide
                }).filter((item) => item !== null).join('\n  '); // Filtre étapes nulles
                return steps ? `@keyframes ${name} {\n  ${steps}\n}` : null; // Retourne null si keyframes vides
            }).filter((item) => item !== null).join('\n\n'); // Filtre keyframes nulls
            // 3. Combiner
            let coreCSS = [keyframesCSS, ...allRuleCSS, ...allChildrenCSS].filter(Boolean).join('\n');
            // 4. Formater Media Queries
            mediaOutput = "";
            mediaQueryMap.forEach((cssContents, query) => {
                if (cssContents.length > 0) {
                    const uniqueContent = [...new Set(cssContents)].join('\n');
                    const indentedContent = uniqueContent.split('\n').map(line => `  ${line}`).join('\n');
                    mediaOutput += `\n\n@media ${query} {\n${indentedContent}\n}`;
                }
            });
            let compiledCSS = (coreCSS + mediaOutput).trim();
            compiledCSS = compiledCSS ? compiledCSS + '\n' : "";
            // 5. Mettre en Cache
            this._cachedCSS = compiledCSS;
            this._dirty = false;
            return this._cachedCSS;
        }
        /** Injects compiled CSS into the DOM. */
        inject(options = {}) {
            if (this._ssr || typeof document === 'undefined') {
                if (!this._ssr && !this._warnedAboutSSR) {
                    console.warn("DynSJS inject: Non-browser env.");
                    this._warnedAboutSSR = true;
                }
                return;
            }
            if (options.force) {
                this._dirty = true;
                this._cachedCSS = null;
            }
            const css = this.compile();
            const styleElement = this._ensureStyleTagExists();
            if (styleElement.textContent !== css) {
                styleElement.textContent = css || "";
            }
        }
        /** @private */
        _ensureStyleTagExists() {
            let e = styleTags.get(this._styleTagId);
            if (!e || !document.getElementById(this._styleTagId)) {
                e = document.createElement('style');
                e.id = this._styleTagId;
                e.type = 'text/css';
                document.head.appendChild(e);
                styleTags.set(this._styleTagId, e);
            }
            return e;
        }
        /** Clears injected styles and invalidates cache. */
        clearInjected() {
            const e = styleTags.get(this._styleTagId);
            if (e) {
                if (e.parentNode) {
                    e.parentNode.removeChild(e);
                }
                styleTags.delete(this._styleTagId);
            }
            this._dirty = true;
            this._cachedCSS = null; // Invalide cache
        }
    }

    // --- src/Color.ts ---
    /**
     * Represents an immutable color with RGBA & HSLA values.
     * @class Color
     */
    class Color {
        constructor(r, g, b, a = 1) {
            // Marqueur pour identification (peut être utile pour duck typing ou debug)
            this.__isDynSJSColor = true;
            this.r = Math.max(0, Math.min(255, Math.round(r)));
            this.g = Math.max(0, Math.min(255, Math.round(g)));
            this.b = Math.max(0, Math.min(255, Math.round(b)));
            const parsedA = parseFloat(typeof a === 'string' ? a : String(a !== null && a !== void 0 ? a : 1));
            this.a = Math.max(0, Math.min(1, isNaN(parsedA) ? 1 : parsedA));
            Object.freeze(this);
        }
        static fromHex(hex) {
            if (typeof hex !== 'string' || !hex.startsWith('#')) {
                throw new Error('Invalid hex: Must start with #.');
            }
            const hexVal = hex.slice(1);
            if (!/^[0-9a-fA-F]+$/.test(hexVal)) {
                throw new Error('Invalid hex: Contains non-hex characters.');
            }
            let r, g, b, a = 1;
            // ... (logique de parsing inchangée mais avec types) ...
            if (hexVal.length === 3 || hexVal.length === 4) {
                r = parseInt(hexVal[0] + hexVal[0], 16);
                g = parseInt(hexVal[1] + hexVal[1], 16);
                b = parseInt(hexVal[2] + hexVal[2], 16);
                if (hexVal.length === 4) {
                    a = parseInt(hexVal[3] + hexVal[3], 16) / 255;
                }
            }
            else if (hexVal.length === 6 || hexVal.length === 8) {
                r = parseInt(hexVal.slice(0, 2), 16);
                g = parseInt(hexVal.slice(2, 4), 16);
                b = parseInt(hexVal.slice(4, 6), 16);
                if (hexVal.length === 8) {
                    a = parseInt(hexVal.slice(6, 8), 16) / 255;
                }
            }
            else {
                throw new Error('Invalid hex: Length should be 3, 4, 6, or 8 after #.');
            }
            if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
                throw new Error('Invalid hex: Parsing resulted in NaN.');
            }
            return new Color(r, g, b, a);
        }
        static fromRgb(rgb) {
            if (typeof rgb !== 'string') {
                throw new Error("Invalid rgb format: Input must be a string.");
            }
            const match = rgb.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
            if (!match) {
                throw new Error('Invalid rgb format. Expected "rgb(R, G, B)" with digits only.');
            }
            return new Color(Number(match[1]), Number(match[2]), Number(match[3]));
        }
        static fromRgba(rgba) {
            if (typeof rgba !== 'string') {
                throw new Error("Invalid rgba format: Input must be a string.");
            }
            const match = rgba.match(/rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\.?\d+)\s*\)/);
            if (!match) {
                throw new Error('Invalid rgba format. Expected "rgba(R, G, B, A)" with digits only for RGB.');
            }
            return new Color(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]));
        }
        static fromHsl(h, s, l, a = 1) {
            s = s <= 1 ? s : s / 100;
            l = l <= 1 ? l : l / 100;
            h = ((h % 360) + 360) % 360;
            s = Math.max(0, Math.min(1, s));
            l = Math.max(0, Math.min(1, l));
            if (s === 0) {
                const gray = Math.round(l * 255);
                return new Color(gray, gray, gray, a);
            }
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            const hNorm = h / 360;
            const hueToRgb = (t) => { t = (t + 1) % 1; if (t < 1 / 6)
                return p + (q - p) * 6 * t; if (t < 1 / 2)
                return q; if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6; return p; };
            const r = Math.round(hueToRgb(hNorm + 1 / 3) * 255);
            const g = Math.round(hueToRgb(hNorm) * 255);
            const b = Math.round(hueToRgb(hNorm - 1 / 3) * 255);
            return new Color(r, g, b, a);
        }
        toHsl() {
            const r = this.r / 255, g = this.g / 255, b = this.b / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return { h: Math.round(h * 360), s: s, l: l, a: this.a };
        }
        operate(operation, operand) {
            let { r, g, b } = this;
            switch (operation) {
                case '+':
                    r += operand;
                    g += operand;
                    b += operand;
                    break;
                case '-':
                    r -= operand;
                    g -= operand;
                    b -= operand;
                    break;
                case '*':
                    r *= operand;
                    g *= operand;
                    b *= operand;
                    break;
                case '/':
                    if (operand === 0)
                        throw new Error("Division by zero is not allowed.");
                    r /= operand;
                    g /= operand;
                    b /= operand;
                    break;
                case '%':
                    if (operand === 0)
                        throw new Error("Modulo by zero is not allowed.");
                    r %= operand;
                    g %= operand;
                    b %= operand;
                    break;
                default:
                    console.warn(`Invalid color operation: ${operation}`);
                    return this;
            }
            return new Color(r, g, b, this.a);
        }
        toRGBA() { return `rgba(${this.r},${this.g},${this.b},${this.a})`; }
        toString() {
            const alphaRounded = Math.round(this.a * 100) / 100;
            return alphaRounded === 1 ? `rgb(${this.r},${this.g},${this.b})` : `rgba(${this.r},${this.g},${this.b},${alphaRounded})`;
        }
        toHslString() {
            const { h, s, l, a } = this.toHsl();
            const sPercent = Math.round(s * 100);
            const lPercent = Math.round(l * 100);
            const alphaRounded = Math.round(a * 100) / 100;
            return alphaRounded === 1 ? `hsl(${h}, ${sPercent}%, ${lPercent}%)` : `hsla(${h}, ${sPercent}%, ${lPercent}%, ${alphaRounded})`;
        }
    }

    exports.Color = Color;
    exports.DynSJS = DynSJS;
    exports.StyleSheet = StyleSheet;
    exports.deepMerge = deepMerge;
    exports.isThemeLookup = isThemeLookup;
    exports.theme = theme;

}));
//# sourceMappingURL=dynsjs.umd.js.map
