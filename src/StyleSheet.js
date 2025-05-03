// --- src/StyleSheet.js ---
import { DynSJS } from "./DynSJS.js";
import { Color } from "./Color.js"; // Import nécessaire pour le marqueur __isDynSJSColor
import { deepMerge } from './utils.js';

// Thème par défaut
const defaultTheme = {};

// Gestion des balises Style
const styleTags = new Map();

/**
 * Manages DynSJS rules, compiles them, handles injection, and includes basic caching.
 * Environment-agnostic. Theme must be passed in constructor.
 */
export class StyleSheet {
    _rules = [];
    _keyframes = {};
    _theme = {}; // Thème final (défaut + utilisateur)
    _ssr = false;
    _styleTagId = 'dynsjs-styles';
    _warnedAboutSSR = false;
    _dirty = true;
    _cachedCSS = null;

    constructor(userTheme = {}, options = {}) {
        this._theme = deepMerge(defaultTheme, userTheme || {});
        this._ssr = options.ssr || false;
        this._styleTagId = options.styleTagId || `dynsjs-styles-${Math.random().toString(36).substring(7)}`;
        this._dirty = true;
        this._cachedCSS = null;
    }

    setTheme(newTheme) {
        this._theme = deepMerge(defaultTheme, newTheme || {}); // Remplace thème actuel
        this._updateRuleThemeRecursive(this._rules, this._theme);
        this._dirty = true;
        this._cachedCSS = null;
        this.clearInjected();
    }

    /** @private */
    _updateRuleThemeRecursive(rules, newTheme) {
        rules.forEach(rule => {
            rule._theme = newTheme;
            if (rule._children.length > 0) { this._updateRuleThemeRecursive(rule._children, newTheme); }
            if (rule._mediaQueries.length > 0) { rule._mediaQueries.forEach(mq => this._updateRuleThemeRecursive([mq.rule], newTheme)); }
        });
    }

    rule(...selectors) {
        this._dirty = true; this._cachedCSS = null;
        const rule = new DynSJS(selectors, this._theme, this._ssr);
        this._rules.push(rule); return rule;
    }

    keyframes(name, definition) {
        if (typeof name !== 'string' || !name.trim() || typeof definition !== 'object' || definition === null) { throw new Error("Invalid keyframes args."); }
        this._dirty = true; this._cachedCSS = null;
        this._keyframes[name] = definition; return this;
    }

    compile() {
        if (!this._dirty && this._cachedCSS !== null) { return this._cachedCSS; }

        let allRuleCSS = [], allChildrenCSS = [], keyframesCSS = "", mediaOutput = "";
        const mediaQueryMap = new Map();

        // --- CORRECTION : Logique de traitement des règles restaurée ---
        // 1. Compiler les règles principales et leurs enfants
        this._rules.forEach(rule => {
            const output = rule.toCSS(); // Appelle toCSS() sur chaque règle DynSJS
            if (output) { // Si la règle n'est pas filtrée par 'when'
                if (output.ruleCSS) allRuleCSS.push(output.ruleCSS);
                if (output.childrenCSS) allChildrenCSS.push(output.childrenCSS);
                // Collecter les media queries pour regroupement
                if (output.mediaCSS && output.mediaCSS.length > 0) {
                     output.mediaCSS.forEach(({ query, css }) => {
                         if (!mediaQueryMap.has(query)) mediaQueryMap.set(query, []);
                         const trimmedCss = css.trim();
                         if(trimmedCss) mediaQueryMap.get(query).push(trimmedCss);
                     });
                }
            }
        });
        // --- FIN CORRECTION ---

        // 2. Compiler les keyframes (logique correcte avec marqueur)
        keyframesCSS = Object.entries(this._keyframes).map(([name, definition]) => {
            const steps = Object.entries(definition).map(([step, props]) => {
                 const propString = Object.entries(props).map(([key, value]) => {
                     let finalValue = value;
                     if (typeof value === 'function') {
                         try { finalValue = value(this._theme); }
                         catch (e) { console.error(`Keyframe func error [${name},${step},${key}]:`, e); return null; }
                     }
                     if (finalValue?.__isDynSJSColor === true) { finalValue = finalValue.toString(); }
                     else if (typeof finalValue === 'number') { finalValue = String(finalValue); }
                     if (typeof finalValue !== 'string') { console.warn(`Invalid keyframe prop value [${name},${step},${key}]: type ${typeof finalValue}`); return null; }
                     if (finalValue.trim() === '') return null;
                     return `${DynSJS.camelToKebab(key)}: ${finalValue};`;
                 }).filter(item => item !== null).join(' ');
                 return propString ? `${step} { ${propString} }` : null;
            }).filter(Boolean).join('\n  ');
            return steps ? `@keyframes ${name} {\n  ${steps}\n}` : null;
        }).filter(Boolean).join('\n\n');

        // 3. Combiner
        // Inclut bien les résultats de la boucle des règles
        let coreCSS = [keyframesCSS, ...allRuleCSS, ...allChildrenCSS].filter(Boolean).join('\n');

        // --- CORRECTION : Logique de formatage media query restaurée ---
        // 4. Formater et ajouter les Media Queries regroupées
        mediaOutput = "";
        mediaQueryMap.forEach((cssContents, query) => {
            if (cssContents.length > 0) {
                const uniqueContent = [...new Set(cssContents)].join('\n');
                const indentedContent = uniqueContent.split('\n').map(line => `  ${line}`).join('\n');
                mediaOutput += `\n\n@media ${query} {\n${indentedContent}\n}`;
            }
        });
        // --- FIN CORRECTION ---

        let compiledCSS = (coreCSS + mediaOutput).trim();
        compiledCSS = compiledCSS ? compiledCSS + '\n' : "";

        // 5. Mettre en Cache
        this._cachedCSS = compiledCSS;
        this._dirty = false;
        return this._cachedCSS;
    }

    /** Injects compiled CSS into the DOM. */
    inject(options = {}) {
        if (this._ssr || typeof document === 'undefined') { if (!this._ssr && !this._warnedAboutSSR) { console.warn("DynSJS inject: Non-browser env."); this._warnedAboutSSR = true; } return; }
        if (options.force) { this._dirty = true; this._cachedCSS = null; }
        const css = this.compile(); // Appel synchrone
        const styleElement = this._ensureStyleTagExists();
        if (styleElement.textContent !== css) { styleElement.textContent = css || ""; }
    }

    /** @private */
    _ensureStyleTagExists() {
         let e = styleTags.get(this._styleTagId); if (!e || !document.getElementById(this._styleTagId)) { e = document.createElement('style'); e.id = this._styleTagId; e.type = 'text/css'; document.head.appendChild(e); styleTags.set(this._styleTagId, e); } return e;
     }

     /** Clears injected styles and invalidates cache. */
    clearInjected() {
        const e = styleTags.get(this._styleTagId); if (e) { if (e.parentNode) { e.parentNode.removeChild(e); } styleTags.delete(this._styleTagId); }
        this._dirty = true; this._cachedCSS = null; // Invalide cache
    }
}
// --- Fin de src/StyleSheet.js ---