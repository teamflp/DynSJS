// --- src/StyleSheet.ts ---

import { DynSJS } from "./DynSJS.js"; // Assurez-vous que l'import pointe vers .ts si vous testez la source TS
import { Color } from "./Color.js";
import { deepMerge } from './utils.js';
// Import types
import type { DynSJSTheme, StyleSheetOptions, KeyframeDefinition, CSSEntry } from './types';

// Thème par défaut
const defaultTheme: DynSJSTheme = {};

// Gestion des balises Style
const styleTags = new Map<string, HTMLStyleElement>();

/**
 * Manages DynSJS rules, compiles them, handles injection, includes basic caching.
 */
export class StyleSheet {
    private _rules: DynSJS[] = [];
    private _keyframes: Record<string, KeyframeDefinition> = {};
    private _theme: DynSJSTheme = {};
    private _ssr: boolean = false;
    private _styleTagId: string = 'dynsjs-styles';
    private _warnedAboutSSR: boolean = false;
    private _dirty: boolean = true;
    private _cachedCSS: string | null = null;

    constructor(userTheme: DynSJSTheme = {}, options: StyleSheetOptions = {}) {
        this._theme = deepMerge(defaultTheme, userTheme || {});
        this._ssr = options.ssr || false;
        this._styleTagId = options.styleTagId || `dynsjs-styles-${Math.random().toString(36).substring(7)}`;
        this._dirty = true;
        this._cachedCSS = null;
    }

    /** Sets a new theme, merging over current, invalidates cache and clears injected styles. */
    setTheme(newTheme: DynSJSTheme): void {
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
    private _updateRuleThemeRecursive(rules: DynSJS[], newTheme: DynSJSTheme): void {
        // ---> AJOUT LOG <---
        //console.log(`DEBUG _updateRuleThemeRecursive: Mise à jour de ${rules.length} règle(s)`);

        rules.forEach(rule => {
            const currentSelectors = (rule as any)._selectors; // Accès pour log
            // console.log(`DEBUG _updateRuleThemeRecursive: Règle [${currentSelectors.join(', ')}]. Thème AVANT:`, (rule as any)._theme?.colors?.primary); // Log avant
            (rule as any)._theme = newTheme; // Met à jour thème enfant
            // console.log(`DEBUG _updateRuleThemeRecursive: Règle [${currentSelectors.join(', ')}]. Thème APRES:`, (rule as any)._theme?.colors?.primary); // Log après

            // Propagation récursive (inchangée)
            if ((rule as any)._children.length > 0) {
                this._updateRuleThemeRecursive((rule as any)._children, newTheme);
            }
            if ((rule as any)._mediaQueries.length > 0) {
                (rule as any)._mediaQueries.forEach((mq: { rule: DynSJS }) =>
                    this._updateRuleThemeRecursive([mq.rule], newTheme)
                );
            }
        });
    }
    // --- FIN CORRECTION ---

    /** Adds a rule. Invalidates cache. */
    rule(...selectors: string[]): DynSJS {
        this._dirty = true; this._cachedCSS = null;
        const rule = new DynSJS(selectors, this._theme, this._ssr);
        this._rules.push(rule); return rule;
    }

    /** Defines keyframes. Invalidates cache. */
    keyframes(name: string, definition: KeyframeDefinition): this {
        if (typeof name !== 'string' || !name.trim() || typeof definition !== 'object' || definition === null) { throw new Error("Invalid keyframes args."); }
        this._dirty = true; this._cachedCSS = null;
        this._keyframes[name] = definition; return this;
    }

    /** Compiles CSS, using cache if available. */
    compile(): string {
        if (!this._dirty && this._cachedCSS !== null) { return this._cachedCSS; }

        let allRuleCSS: string[] = [], allChildrenCSS: string[] = [], keyframesCSS: string = "", mediaOutput: string = "";
        const mediaQueryMap = new Map<string, string[]>();

        // 1. Compiler les règles
        this._rules.forEach(rule => {
            const output: CSSEntry | null = rule.toCSS();
            if (output) {
                if (output.ruleCSS) allRuleCSS.push(output.ruleCSS);
                if (output.childrenCSS) allChildrenCSS.push(output.childrenCSS);
                if (output.mediaCSS?.length) {
                     output.mediaCSS.forEach(({ query, css }) => {
                         if (!mediaQueryMap.has(query)) mediaQueryMap.set(query, []);
                         const trimmedCss = css.trim(); if(trimmedCss) mediaQueryMap.get(query)!.push(trimmedCss);
                     });
                }
            }
        });

        // 2. Compiler les keyframes
        keyframesCSS = Object.entries(this._keyframes).map(([name, definition]): string | null => {
            const steps = Object.entries(definition).map(([step, props]): string | null => {
                 const propString = Object.entries(props).map(([key, value]): string | null => {
                     let finalValue: any = value;
                     if (typeof value === 'function') {
                         try { finalValue = value(this._theme, null as any); } // Appel fonction thème (avec null pour contexte)
                         catch (e) { console.error(`Keyframe func error [${name},${step},${key}]:`, e); return null; }
                     }

                     // --- CORRECTION : Utilisation du marqueur __isDynSJSColor ---
                     if (finalValue?.__isDynSJSColor === true) {
                         finalValue = (finalValue as Color).toString(); // Appelle toString si c'est une Color
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
                     if (finalValue.trim() === '') return null; // Ignore chaînes vides
                     return `${DynSJS.camelToKebab(key)}: ${finalValue};`;

                 }).filter((item): item is string => item !== null).join(' '); // Filtre props nulles

                return propString ? `${step} { ${propString} }` : null; // Retourne null si étape vide

            }).filter((item): item is string => item !== null).join('\n  '); // Filtre étapes nulles

            return steps ? `@keyframes ${name} {\n  ${steps}\n}` : null; // Retourne null si keyframes vides

        }).filter((item): item is string => item !== null).join('\n\n'); // Filtre keyframes nulls

        // 3. Combiner
        let coreCSS: string = [keyframesCSS, ...allRuleCSS, ...allChildrenCSS].filter(Boolean).join('\n');

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
        this._cachedCSS = compiledCSS; this._dirty = false;
        return this._cachedCSS;
    }

    /** Injects compiled CSS into the DOM. */
    inject(options: { force?: boolean } = {}): void {
        if (this._ssr || typeof document === 'undefined') { if (!this._ssr && !this._warnedAboutSSR) { console.warn("DynSJS inject: Non-browser env."); this._warnedAboutSSR = true; } return; }
        if (options.force) { this._dirty = true; this._cachedCSS = null; }
        const css = this.compile();
        const styleElement = this._ensureStyleTagExists();
        if (styleElement.textContent !== css) { styleElement.textContent = css || ""; }
    }

    /** @private */
    private _ensureStyleTagExists(): HTMLStyleElement {
         let e = styleTags.get(this._styleTagId); if (!e || !document.getElementById(this._styleTagId)) { e = document.createElement('style'); e.id = this._styleTagId; e.type = 'text/css'; document.head.appendChild(e); styleTags.set(this._styleTagId, e); } return e;
     }

     /** Clears injected styles and invalidates cache. */
    clearInjected(): void {
        const e = styleTags.get(this._styleTagId); if (e) { if (e.parentNode) { e.parentNode.removeChild(e); } styleTags.delete(this._styleTagId); }
        this._dirty = true; this._cachedCSS = null; // Invalide cache
    }
}