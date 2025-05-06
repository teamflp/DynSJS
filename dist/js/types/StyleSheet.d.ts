import { DynSJS } from "./DynSJS.js";
import type { DynSJSTheme, StyleSheetOptions, KeyframeDefinition } from './types';
/**
 * Manages DynSJS rules, compiles them, handles injection, includes basic caching.
 */
export declare class StyleSheet {
    private _rules;
    private _keyframes;
    private _theme;
    private _ssr;
    private _styleTagId;
    private _warnedAboutSSR;
    private _dirty;
    private _cachedCSS;
    constructor(userTheme?: DynSJSTheme, options?: StyleSheetOptions);
    /** Sets a new theme, merging over current, invalidates cache and clears injected styles. */
    setTheme(newTheme: DynSJSTheme): void;
    /** @private - Propagates theme update recursively */
    private _updateRuleThemeRecursive;
    /** Adds a rule. Invalidates cache. */
    rule(...selectors: string[]): DynSJS;
    /** Defines keyframes. Invalidates cache. */
    keyframes(name: string, definition: KeyframeDefinition): this;
    /** Compiles CSS, using cache if available. */
    compile(): string;
    /** Injects compiled CSS into the DOM. */
    inject(options?: {
        force?: boolean;
    }): void;
    /** @private */
    private _ensureStyleTagExists;
    /** Clears injected styles and invalidates cache. */
    clearInjected(): void;
}
//# sourceMappingURL=StyleSheet.d.ts.map