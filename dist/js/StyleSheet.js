// --- src/StyleSheet.ts ---
import { DynSJS } from "./DynSJS.js"; // Assurez-vous que l'import pointe vers .ts si vous testez la source TS
import { deepMerge } from './utils.js';
// Thème par défaut
const defaultTheme = {};
// Gestion des balises Style
const styleTags = new Map();
/**
 * Manages DynSJS rules, compiles them, handles injection, includes basic caching.
 */
export class StyleSheet {
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
//# sourceMappingURL=StyleSheet.js.map