// --- src/DynSJS.js ---

import { Color } from "./Color.js";

/**
 * Represents a CSS rule or a block.
 * Enables chaining. Can be contextualized with theme and SSR info.
 */
export class DynSJS {
    // Adding theme and context properties
    _theme = {};
    _ssr = false; // Flag for SSR context, passed down

    _selectors = [];
    _properties = {};
    _children = [];
    _mediaQueries = [];
    _conditionFn = null;
    _parent = null;

    /**
     * Creates an instance of DynSJS representing a CSS rule.
     * Intended for internal use by StyleSheet. Use StyleSheet.rule() instead.
     * @internal
     * @param {string[]} selectors - CSS selectors.
     * @param {object} [theme={}] - Optional theme object.
     * @param {boolean} [ssr=false] - Optional SSR context flag.
     * @param {DynSJS|null} [parent=null] - Parent rule reference.
     */
    constructor(selectors = [], theme = {}, ssr = false, parent = null) {
        const selectorList = Array.isArray(selectors) ? selectors : [selectors].filter(Boolean); // Ensure array and filter empty

        if (selectorList.length > 0 && !selectorList.every(DynSJS._isValidSelector)) {
            throw new Error("One or more selectors are invalid. Selectors must be non-empty strings.");
        }

        this._selectors = selectorList;
        this._properties = {};
        this._children = [];
        this._mediaQueries = [];
        this._conditionFn = null;
        this._parent = parent; // Set parent reference

        // Store theme and SSR context
        this._theme = parent ? parent._theme : theme; // Inherit theme from parent
        this._ssr = parent ? parent._ssr : ssr; // Inherit SSR flag
    }

    /**
     * Validates if the given selector is a non-empty string.
     * @param {*} sel - Selector to be validated.
     * @returns {boolean} - True if valid, otherwise false.
     * @private
     */
    static _isValidSelector(sel) {
        return typeof sel === 'string' && sel.trim().length > 0;
    }

    /**
     * Validates if the given key and value are suitable for CSS properties.
     * Allows numbers and functions (which will be resolved).
     * @param {string} key - CSS property name.
     * @param {string|number|Color|Function} value - Value for the CSS property.
     * @returns {boolean} - True if valid, otherwise false.
     * @private
     */
    static _isValidProperty(key, value) {
         return typeof key === 'string' && (
               typeof value === 'string' ||
               typeof value === 'number' ||
               typeof value === 'function' || // Allow functions for lazy/themed values
               value instanceof Color
         );
    }

    /**
     * Converts camelCase strings to kebab-case (e.g., backgroundColor -> background-color).
     * @param {string} string - The string to convert.
     * @returns {string} - The kebab-cased string.
     */
    static camelToKebab(string) {
        // Handle potential vendor prefixes starting with uppercase correctly
        return string.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)
                     // Correct for first letter if it was uppercase
                     .replace(/^-/, '');
    }


    /**
     * Access theme variables using dot notation.
     * @param {string} key - The theme key (e.g., 'colors.primary').
     * @param {*} [defaultValue] - Value to return if key not found.
     * @returns {*} The theme value or default.
     */
    theme(key, defaultValue = undefined) {
        // Simple dot notation getter for nested theme object
        try {
            const keys = key.split('.');
            let value = this._theme;
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return defaultValue;
                }
            }
            return value;
        } catch (e) {
             console.error(`Error accessing theme key "${key}":`, e);
             return defaultValue;
        }
    }


    /**
     * Sets one or more CSS properties. Values can be strings, numbers, Color instances,
     * or functions that receive (theme, context) and return a value.
     * @param {object} props - An object containing CSS properties.
     * @returns {DynSJS} The current instance for chaining.
     */
    set(props) {
        for (let key in props) {
             const value = props[key];

            if (!DynSJS._isValidProperty(key, value)) {
                console.warn(`DynSJS: Invalid property key or value type for "${key}". Skipping.`);
                continue;
            }
             // Store the raw value (could be string, number, Color, function)
             // Resolution happens in _generateProperties
            this._properties[key] = value;
        }
        return this;
    }

    /**
     * Adds a nested rule. Handles '&' for selector combination.
     * Inherits theme and SSR context.
     * @param {...string} selectors - CSS selectors for the nested rule.
     * @returns {DynSJS} The nested rule instance.
     */
    nested(...selectors) {
        // Pass theme and context to child
        const rule = new DynSJS(selectors, this._theme, this._ssr, this);
        this._children.push(rule);
        return rule; // Return the new nested rule
    }

    /**
     * Adds a media query rule. Inherits theme and context.
     * @param {string} query - Media query condition.
     * @returns {DynSJS} The media query rule instance.
     */
    media(query) {
        if (typeof query !== 'string' || query.trim().length === 0) {
            throw new Error("Invalid media query string.");
        }
        // Pass theme and context to the rule inside media
        // It keeps the same initial selectors, applied within the media query context
        const rule = new DynSJS(this._selectors, this._theme, this._ssr, this);
        this._mediaQueries.push({ query, rule });
        return rule; // Return the rule *inside* the media query
    }

    /**
     * Sets a condition function. Function receives theme and SSR context.
     * @param {function(theme: object, ssr: boolean): boolean} conditionFn - Function to evaluate.
     * @returns {DynSJS} The current instance.
     */
    when(conditionFn) {
        if (typeof conditionFn !== 'function') {
            throw new Error("`conditionFn` must be a function.");
        }
        this._conditionFn = conditionFn;
        return this;
    }

    _isConditionMet() {
        // Check parent condition first
        if (this._parent && !this._parent._isConditionMet()) {
            return false;
        }
        // Check own condition, passing context
        try {
             return this._conditionFn ? this._conditionFn(this._theme, this._ssr) : true;
        } catch (e) {
            console.error("Error evaluating DynSJS 'when' condition:", e);
            return false; // Fail safe if condition function throws
        }
    }

    /**
     * Generates selectors, handling '&' replacement.
     * @param {string} [parentSelector=''] - Parent selector string.
     * @returns {string} - Combined selectors string.
     * @private
     */
    _generateSelectors(parentSelector = '') {
        const parentTrimmed = parentSelector.trim();
        const currentSelectors = this._selectors.length > 0 ? this._selectors : ['&']; // Treat empty selector as '&' for context

        if (!parentTrimmed) {
            // For top-level rules or rules without parent context, '&' should likely be ignored or error
            return currentSelectors.map(sel => sel.replace(/&/g, '')).filter(Boolean).join(', ') || '';
        }

        return currentSelectors.map(sel => {
            const trimmedSel = sel.trim();
            // Handle '&' selector replacement (more robustly)
            if (trimmedSel.includes('&')) {
                 // Split parent selectors if multiple exist (e.g., "h1, h2")
                 return parentTrimmed.split(',')
                     .map(pSel => trimmedSel.replace(/&/g, pSel.trim()))
                     .join(', ');
            }
            // Basic descendant combination (can be made more complex if needed)
             return parentTrimmed.split(',')
                 .map(pSel => `${pSel.trim()} ${trimmedSel}`)
                 .join(', ');
        }).join(', ');
    }


    /**
     * Generates the properties string, resolving functional values.
     * @returns {string} - CSS properties string.
     * @private
     */
     _generateProperties() {
         return Object.entries(this._properties)
             .map(([key, value]) => {
                 let finalValue;
                 // Resolve function-based values
                 if (typeof value === 'function') {
                     try {
                          finalValue = value(this._theme, this);
                     } catch (e) {
                         console.error(`Error resolving function value for property "${key}":`, e);
                         return null; // Skip property if function fails
                     }
                 } else {
                     finalValue = value;
                 }

                 // Convert Color instances
                 if (finalValue instanceof Color) {
                     finalValue = finalValue.toString();
                 }

                 // Convert numbers to string (assuming they are valid CSS numerical values)
                 if (typeof finalValue === 'number') {
                    finalValue = String(finalValue);
                 }

                 // Validate resolved value type (should be string now)
                 if(typeof finalValue !== 'string'){
                    console.warn(`DynSJS: Resolved value for property "${key}" is not a string. Skipping.`);
                    return null;
                 }

                 const kebabKey = DynSJS.camelToKebab(key);
                 return `${kebabKey}: ${finalValue};`;
             })
             .filter(Boolean) // Remove nulls (skipped properties)
             .join(' ');
     }

    /**
     * Helper method to set a color property using a Color instance.
     * @param {Color} color - The Color instance.
     * @param {string} [property='color'] - The CSS property name (camelCase or kebab-case).
     * @returns {DynSJS} The current instance for chaining.
     */
    setColor(color, property = 'color') {
        if (!(color instanceof Color)) {
            throw new Error("The first argument must be an instance of Color.");
        }
        // Store the Color instance directly, resolution happens in _generateProperties
        this._properties[property] = color;
        return this;
    }

    /**
     * Converts the rule and its children/media queries into a structured object.
     * This object contains the CSS parts for this rule and its descendants.
     * Passes down context (theme, ssr) implicitly via constructor.
     * @param {string} [parentSelector=''] - Parent selector string.
     * @returns {{ruleCSS: string, childrenCSS: string, mediaCSS: Array<{query: string, css: string}>}|null} - Object containing CSS parts, or null if condition not met.
     * @internal
     */
     toCSS(parentSelector = '') {
         if (!this._isConditionMet()) {
             return null; // Rule is skipped
         }

         const combinedSelectors = this._generateSelectors(parentSelector);
         const properties = this._generateProperties(); // Properties might depend on theme

         let ruleCSS = "";
         // Generate rule only if it has properties OR children OR media queries to ensure selector context exists
         if (combinedSelectors && (properties || this._children.length > 0 || this._mediaQueries.length > 0)) {
            if (properties) {
                ruleCSS = `${combinedSelectors} { ${properties} }`;
            }
            // If no properties, ruleCSS remains empty, but combinedSelectors are passed down
         } else if (!combinedSelectors && properties) {
             console.warn("DynSJS Rule has properties but no selectors:", properties);
         }

         // Generate CSS for nested children, passing down the current combined selector
         const childrenCSSList = this._children
             .map(child => child.toCSS(combinedSelectors)) // Child already inherits context
             .filter(Boolean);

         let combinedChildrenCSS = childrenCSSList.map(childOutput => {
            let css = childOutput.ruleCSS || '';
            css += childOutput.childrenCSS ? '\n' + childOutput.childrenCSS : '';
            // Basic handling: Bubble up media queries from children
             // A more robust system might merge/group them here
             if(childOutput.mediaCSS) {
                // For simplicity, just appending them here might lead to duplicate @media blocks
                // A better approach would collect all media queries at the StyleSheet level
             }
            return css.trim();
         }).filter(Boolean).join('\n');


         // Generate CSS for media queries defined at this level
         const mediaCSSList = this._mediaQueries
             .map(({ query, rule }) => {
                 // Pass down the *current combined selector* as the parent context for the media rule content
                 const ruleOutput = rule.toCSS(combinedSelectors);
                 if (ruleOutput && (ruleOutput.ruleCSS || ruleOutput.childrenCSS || ruleOutput.mediaCSS?.length > 0)) {
                      let mediaContent = (ruleOutput.ruleCSS || '');
                      if (ruleOutput.childrenCSS) mediaContent += '\n' + ruleOutput.childrenCSS;
                      // Handle media queries nested inside this media query (basic pass-through)
                      if(ruleOutput.mediaCSS && ruleOutput.mediaCSS.length > 0) {
                         // These should ideally be processed and merged at the top level
                         console.warn("DynSJS: Nested media queries detected. Deep merging not fully implemented in this simple version.");
                         // Simple append for now (may create nested @media blocks - often invalid)
                         // mediaContent += '\n' + ruleOutput.mediaCSS.map(mq => `@media ${mq.query} { ${mq.css} }`).join('\n');
                      }
                      return { query: query, css: mediaContent.trim() };
                 }
                 return null;
             })
             .filter(Boolean);

         return {
             ruleCSS: ruleCSS.trim(),
             childrenCSS: combinedChildrenCSS.trim(),
             mediaCSS: mediaCSSList // Media queries defined directly on this rule
         };
     }
}