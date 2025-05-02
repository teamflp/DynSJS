// --- src/StyleSheet.js ---

import { DynSJS } from "./DynSJS.js";

// Simple cache for injected styles to avoid duplicates
const injectedCache = new Set();
// Use a map to handle multiple style tags if needed (e.g., per StyleSheet instance)
const styleTags = new Map();

/**
 * Manages DynSJS rules, compiles them, and handles injection.
 */
export class StyleSheet {
    _rules = [];
    _keyframes = {}; // Dedicated storage for keyframes
    _theme = {}; // Theme object for this sheet
    _ssr = false; // SSR context for this sheet
    _styleTagId = 'dynsjs-styles'; // Default ID for the style tag

    /**
     * Creates a StyleSheet instance.
     * @param {object} [theme={}] - Optional theme object.
     * @param {object} [options={}] - Options object.
     * @param {boolean} [options.ssr=false] - Indicate SSR context (disables injection).
     * @param {string} [options.styleTagId='dynsjs-styles'] - ID for the injected style tag.
     */
    constructor(theme = {}, options = {}) {
        this._theme = theme || {}; // Ensure theme is an object
        this._ssr = options.ssr || false;
        // Make style tag ID unique per instance if multiple sheets are used?
        this._styleTagId = options.styleTagId || `dynsjs-styles-${Math.random().toString(36).substring(7)}`;
    }

    /**
     * Creates a new top-level CSS rule. Passes theme and context.
     * @param {...string} selectors - CSS selectors.
     * @returns {DynSJS} The new rule instance.
     */
    rule(...selectors) {
        // Pass theme and context to the rule
        const rule = new DynSJS(selectors, this._theme, this._ssr);
        this._rules.push(rule);
        return rule;
    }

    /**
     * Defines CSS keyframes.
     * @param {string} name - Animation name.
     * @param {object} definition - Keyframe steps (e.g., { '0%': { opacity: 0 }, '100%': { opacity: 1 } }).
     * @returns {StyleSheet} The current instance.
     */
    keyframes(name, definition) {
        if (typeof name !== 'string' || !name.trim() || typeof definition !== 'object' || definition === null) {
            throw new Error("Invalid arguments for keyframes(name, definition). Name must be non-empty string, definition must be object.");
        }
        // Basic validation of definition structure could be added here
        this._keyframes[name] = definition;
        return this;
    }

    /**
     * Compiles all rules and keyframes into a CSS string.
     * @returns {string} The compiled CSS string.
     */
    compile() {
        let allRuleCSS = [];
        let allChildrenCSS = [];
        // Use a Map to collect and merge media query content intelligently
        const mediaQueryMap = new Map(); // Map<query: string, cssContent: string[]>

        // 1. Generate CSS for standard rules and collect media queries
        this._rules.forEach(rule => {
            const output = rule.toCSS();
            if (output) {
                if (output.ruleCSS) allRuleCSS.push(output.ruleCSS);
                if (output.childrenCSS) allChildrenCSS.push(output.childrenCSS);
                // Collect media queries into the map
                if (output.mediaCSS && output.mediaCSS.length > 0) {
                     output.mediaCSS.forEach(({ query, css }) => {
                         if (!mediaQueryMap.has(query)) {
                             mediaQueryMap.set(query, []);
                         }
                         const trimmedCss = css.trim();
                         if(trimmedCss) mediaQueryMap.get(query).push(trimmedCss);
                     });
                }
            }
        });

        // 2. Generate CSS for keyframes
        let keyframesCSS = Object.entries(this._keyframes).map(([name, definition]) => {
            const steps = Object.entries(definition).map(([step, props]) => {
                // Resolve properties defined as functions (e.g., using theme)
                 const propString = Object.entries(props).map(([key, value]) => {
                     let finalValue = value;
                     if (typeof value === 'function') {
                         try {
                             finalValue = value(this._theme, null); // Pass theme, null for context? Or skip functions here? Assume static for now.
                         } catch (e) {
                             console.error(`Error resolving function value in keyframe "${name}" step "${step}" for property "${key}":`, e);
                             return null;
                         }
                     }
                     if (finalValue instanceof Color) finalValue = finalValue.toString();
                     if (typeof finalValue === 'number') finalValue = String(finalValue);
                     if (typeof finalValue !== 'string') return null; // Skip if not resolvable to string

                     return `${DynSJS.camelToKebab(key)}: ${finalValue};`;
                 }).filter(Boolean).join(' ');

                return `${step} { ${propString} }`;
            }).join('\n  ');
            return `@keyframes ${name} {\n  ${steps}\n}`;
        }).join('\n\n');

        // 3. Combine and Format Core CSS
        // Filter empty strings before joining
        let coreCSS = [keyframesCSS, ...allRuleCSS, ...allChildrenCSS].filter(Boolean).join('\n');

        // 4. Format and Append Media Queries
        let mediaOutput = "";
        mediaQueryMap.forEach((cssContents, query) => {
            if (cssContents.length > 0) {
                // Join unique CSS content lines, indented
                const uniqueContent = [...new Set(cssContents)].join('\n'); // Avoid duplicate rules if possible
                const indentedContent = uniqueContent.split('\n').map(line => `  ${line}`).join('\n');
                mediaOutput += `\n\n@media ${query} {\n${indentedContent}\n}`;
            }
        });

        let compiledCSS = coreCSS + mediaOutput;

        return compiledCSS ? compiledCSS.trim() + '\n' : "";
    }

    /**
     * Compiles the CSS and injects it into a <style> tag in the document head.
     * Only runs in a browser environment (checks for `document`). Avoids duplicate injections for the *same CSS content*.
     * @param {object} [options={}] - Options object.
     * @param {boolean} [options.force=false] - Force reinjection even if content seems identical.
     */
    inject(options = {}) {
        // Don't inject in SSR context or if document is not available
        if (this._ssr || typeof document === 'undefined') {
            if (!this._ssr && !this._warnedAboutSSR) {
                console.warn("DynSJS: `inject()` called in non-browser environment. Skipping injection.");
                this._warnedAboutSSR = true; // Warn only once per instance
            }
            return;
        }

        const css = this.compile();
        // Use a hash or the full CSS as cache key. Full CSS is simpler.
        const cacheKey = css;

        // Check global cache unless forced
        if (!options.force && injectedCache.has(cacheKey)) {
            // Ensure the style tag for *this instance* exists if content is cached globally
            this._ensureStyleTagExists();
            return;
        }

        const styleElement = this._ensureStyleTagExists();

        // Update content using textContent for performance
        // This handles adding/removing/updating styles efficiently
        if (styleElement.textContent !== css) {
             styleElement.textContent = css;
        }

        // Update global cache
        // Consider limiting cache size if memory becomes an issue
        injectedCache.add(cacheKey);
    }

     /**
      * Ensures the style tag for this instance exists in the head.
      * @returns {HTMLStyleElement} The style tag element.
      * @private
      */
     _ensureStyleTagExists() {
         let styleElement = styleTags.get(this._styleTagId);
         if (!styleElement || !document.getElementById(this._styleTagId)) {
             styleElement = document.createElement('style');
             styleElement.id = this._styleTagId;
             styleElement.type = 'text/css';
             // Add nonce support if needed for CSP? styleElement.setAttribute('nonce', '...');
             document.head.appendChild(styleElement);
             styleTags.set(this._styleTagId, styleElement);
         }
         return styleElement;
     }


     /**
     * Clears the injected styles associated *with this StyleSheet instance* and its cache entry.
     * Useful for hot reloading or dynamic theme changes where content needs full replacement.
     */
    clearInjected() {
        const styleElement = styleTags.get(this._styleTagId);
        if (styleElement) {
            // Find corresponding entry in global cache to remove (may need better key management)
            // Simple approach: iterate cache, but inefficient.
            // Better: Store cacheKey on styleElement or instance? For now, just clear tag content.
            if (styleElement.textContent) {
                 injectedCache.delete(styleElement.textContent); // Attempt removal from global cache
            }
            styleElement.textContent = ''; // Clear content instead of removing tag to avoid layout shifts? Or remove?
            // Optional: Remove the tag itself
            if (styleElement.parentNode) {
                 styleElement.parentNode.removeChild(styleElement);
            }
            styleTags.delete(this._styleTagId);

        }
        // Note: This doesn't clear the global cache completely, only attempts to remove this sheet's last known content.
        // A full `injectedCache.clear()` might be needed for complete global reset.
    }
}