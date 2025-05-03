/**
 * Manages DynSJS rules, compiles them, handles injection, and includes basic caching.
 * Environment-agnostic. Theme must be passed in constructor.
 */
export class StyleSheet {
    constructor(userTheme?: {}, options?: {});
    _rules: any[];
    _keyframes: {};
    _theme: {};
    _ssr: boolean;
    _styleTagId: string;
    _warnedAboutSSR: boolean;
    _dirty: boolean;
    _cachedCSS: any;
    setTheme(newTheme: any): void;
    /** @private */
    private _updateRuleThemeRecursive;
    rule(...selectors: any[]): DynSJS;
    keyframes(name: any, definition: any): this;
    compile(): any;
    /** Injects compiled CSS into the DOM. */
    inject(options?: {}): void;
    /** @private */
    private _ensureStyleTagExists;
    /** Clears injected styles and invalidates cache. */
    clearInjected(): void;
}
import { DynSJS } from "./DynSJS.js";
