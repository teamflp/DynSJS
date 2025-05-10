// --- src/StyleSheet.ts ---

import { DynSJS } from "./DynSJS.js"; // Assurez-vous que l'import pointe vers .ts si vous testez la source TS
import { Color } from "./Color.js";
import { deepMerge } from './utils.js';
// Import types - StyleValuePrimitive retiré car non utilisé directement dans CE fichier
import type { DynSJSTheme, StyleSheetOptions, KeyframeDefinition, CSSEntry } from './types';

// Thème par défaut pour la feuille de style
const defaultTheme: DynSJSTheme = {};

// Map pour stocker les références aux balises <style> injectées par ID
const styleTags = new Map<string, HTMLStyleElement>();

/**
 * Gère un ensemble de règles CSS (`DynSJS`), de keyframes, et un thème.
 * Permet de compiler ces définitions en une chaîne CSS valide,
 * d'injecter le CSS dans le DOM, et gère un système de cache simple.
 * @class StyleSheet
 * @example
 * const myTheme = { colors: { primary: '#007bff' } };
 * const sheet = new StyleSheet(myTheme);
 * sheet.rule('body').set({ margin: 0, fontFamily: 'Arial, sans-serif' });
 * sheet.rule('.button').set(t => ({
 * backgroundColor: t.colors.primary,
 * padding: [px(10), px(20)]
 * }));
 * const css = sheet.compile();
 * console.log(css);
 * // Pourrait être injecté dans le DOM côté client:
 * // if (typeof window !== 'undefined') sheet.inject();
 */
export class StyleSheet {
    private _rules: DynSJS[] = [];
    private _keyframes: Record<string, KeyframeDefinition> = {};
    private _theme: DynSJSTheme;
    private _ssr: boolean = false;
    private _styleTagId: string;
    private _warnedAboutSSR: boolean = false;
    private _dirty: boolean = true; // Le cache est invalide au début
    private _cachedCSS: string | null = null; // Stockage du CSS compilé

    /**
     * Crée une instance de StyleSheet.
     * @param {DynSJSTheme} [userTheme={}] - Un objet thème utilisateur optionnel qui sera fusionné avec le thème par défaut.
     * @param {StyleSheetOptions} [options={}] - Options de configuration pour la feuille de style.
     */
    constructor(userTheme: DynSJSTheme = {}, options: StyleSheetOptions = {}) {
        this._theme = deepMerge(defaultTheme, userTheme || {});
        this._ssr = options.ssr || false;
        this._styleTagId = options.styleTagId || `dynsjs-styles-${Math.random().toString(36).substring(7)}`;
        this._dirty = true;
        this._cachedCSS = null;
    }

    /**
     * Définit un nouveau thème pour la feuille de style.
     * Le nouveau thème est fusionné par-dessus le thème actuel.
     * Invalide le cache de compilation et nettoie les styles précédemment injectés.
     * @param {DynSJSTheme} newTheme - Le nouvel objet thème à appliquer.
     * @returns {void}
     */
    setTheme(newTheme: DynSJSTheme): void {
        this._theme = deepMerge(this._theme, newTheme || {}); // Fusionne sur le thème actuel
        this._updateRuleThemeRecursive(this._rules, this._theme); // Propager aux règles existantes
        this._dirty = true;
        this._cachedCSS = null;
        this.clearInjected();
    }

    /**
     * @private
     * Propage récursivement la mise à jour du thème à toutes les règles et sous-règles.
     * Note: L'accès direct à _theme/_children/_mediaQueries d'une autre instance (DynSJS)
     * via `(rule as any)` est une simplification pour la communication interne
     * entre StyleSheet et DynSJS dans ce contexte.
     * @param {DynSJS[]} rules - Le tableau de règles à mettre à jour.
     * @param {DynSJSTheme} newTheme - Le nouvel objet thème.
     */
    private _updateRuleThemeRecursive(rules: DynSJS[], newTheme: DynSJSTheme): void {
        rules.forEach(rule => {
            (rule as any)._theme = newTheme;
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

    /**
     * Crée et ajoute une nouvelle règle CSS de haut niveau à la feuille de style.
     * Invalide le cache de compilation.
     * @param {...string} selectors - Un ou plusieurs sélecteurs CSS pour la règle.
     * @returns {DynSJS} Une nouvelle instance DynSJS pour la règle créée, permettant le chaînage.
     * @example
     * sheet.rule('body', 'html').set({ margin: 0 });
     * sheet.rule('.my-class').set(t => ({ color: t.colors.primary }));
     */
    rule(...selectors: string[]): DynSJS {
        this._dirty = true; this._cachedCSS = null;
        const rule = new DynSJS(selectors, this._theme, this._ssr);
        this._rules.push(rule); return rule;
    }

    /**
     * Définit une animation CSS `@keyframes`.
     * Invalide le cache de compilation.
     * @param {string} name - Le nom de l'animation.
     * @param {KeyframeDefinition} definition - Un objet décrivant les étapes (steps) de l'animation.
     * @returns {this} L'instance StyleSheet actuelle pour chaînage.
     * @throws {Error} Si les arguments sont invalides.
     * @example
     * sheet.keyframes('fadeIn', {
     * '0%': { opacity: 0 },
     * '100%': { opacity: 1 }
     * });
     */
    keyframes(name: string, definition: KeyframeDefinition): this {
        if (typeof name !== 'string' || !name.trim() || typeof definition !== 'object' || definition === null) {
            // Standardisation du message d'erreur
            throw new Error("DynSJS StyleSheet: Invalid arguments for keyframes(). Name must be a non-empty string, definition must be an object.");
        }
        this._dirty = true; this._cachedCSS = null;
        this._keyframes[name] = definition; return this;
    }

    /**
     * Compile toutes les règles et keyframes en une chaîne CSS unique.
     * Utilise un cache interne pour éviter les recompilations inutiles si les définitions n'ont pas changé.
     * @returns {string} La chaîne CSS compilée.
     */
    compile(): string {
        if (!this._dirty && this._cachedCSS !== null) { return this._cachedCSS; }

        let allRuleCSS: string[] = [], allChildrenCSS: string[] = [], keyframesCSS: string = "", mediaOutput: string = "";
        const mediaQueryMap = new Map<string, string[]>();

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

        keyframesCSS = Object.entries(this._keyframes).map(([name, definition]): string | null => {
            const steps = Object.entries(definition).map(([step, props]): string | null => {
                 const propString = Object.entries(props).map(([key, value]): string | null => {
                     let finalValue: any = value;
                     if (typeof value === 'function') {
                         try { finalValue = value(this._theme, null as any); }
                         catch (e) { console.error(`DynSJS StyleSheet: Keyframe function error [${name},${step},${key}]:`, e); return null; }
                     }
                     if (finalValue?.__isDynSJSColor === true) { finalValue = (finalValue as Color).toString(); }
                     else if (typeof finalValue === 'number') { finalValue = String(finalValue); }
                     if (typeof finalValue !== 'string') { console.warn(`DynSJS StyleSheet: Invalid keyframe prop value [${name},${step},${key}], not a string (got ${typeof finalValue}). Skipping.`); return null; }
                     if (finalValue.trim() === '') return null;
                     return `${DynSJS.camelToKebab(key)}: ${finalValue};`;
                 }).filter((item): item is string => item !== null).join(' ');
                 return propString ? `${step} { ${propString} }` : null;
            }).filter((item): item is string => item !== null).join('\n  ');
            return steps ? `@keyframes ${name} {\n  ${steps}\n}` : null;
        }).filter((item): item is string => item !== null).join('\n\n');

        let coreCSS: string = [keyframesCSS, ...allRuleCSS, ...allChildrenCSS].filter(Boolean).join('\n');
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

        this._cachedCSS = compiledCSS; this._dirty = false;
        return this._cachedCSS;
    }

    /**
     * Injecte le CSS compilé dans une balise `<style>` dans le `<head>` du document.
     * Ne fait rien en contexte SSR ou si `document` n'est pas défini.
     * @param {object} [options={}] - Options pour l'injection.
     * @param {boolean} [options.force=false] - Si `true`, force la recompilation même si le cache est considéré comme valide.
     * @returns {void}
     */
    inject(options: { force?: boolean } = {}): void {
        if (this._ssr || typeof document === 'undefined') { if (!this._ssr && !this._warnedAboutSSR) { console.warn("DynSJS StyleSheet: inject() called in non-browser environment. Skipping."); this._warnedAboutSSR = true; } return; }
        if (options.force) { this._dirty = true; this._cachedCSS = null; }
        const css = this.compile();
        const styleElement = this._ensureStyleTagExists();
        if (styleElement.textContent !== css) { styleElement.textContent = css || ""; }
    }

    /**
     * @private S'assure que la balise `<style>` pour cette instance existe dans le `<head>`.
     * La crée si nécessaire.
     * @returns {HTMLStyleElement} L'élément `<style>`.
     */
    private _ensureStyleTagExists(): HTMLStyleElement {
         let e = styleTags.get(this._styleTagId); if (!e || !document.getElementById(this._styleTagId)) { e = document.createElement('style'); e.id = this._styleTagId; e.type = 'text/css'; document.head.appendChild(e); styleTags.set(this._styleTagId, e); } return e;
     }

    /**
      * Supprime la balise `<style>` injectée du DOM (si elle existe) et invalide le cache de compilation.
      * @returns {void}
      */
    clearInjected(): void {
        const e = styleTags.get(this._styleTagId); if (e) { if (e.parentNode) { e.parentNode.removeChild(e); } styleTags.delete(this._styleTagId); }
        this._dirty = true; this._cachedCSS = null;
    }
}