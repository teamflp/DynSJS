import { Color } from "./Color.js";
import type { DynSJSTheme, StyleProperties, ConditionFunction, CSSEntry, SetFunction } from './types';
/**
 * Represents a CSS rule or a block. Enables chaining.
 */
export declare class DynSJS {
    private _theme;
    private _ssr;
    private _selectors;
    private _properties;
    private _children;
    private _mediaQueries;
    private _conditionFn;
    _parent: DynSJS | null;
    /** @internal */
    constructor(selectors?: string | string[], theme?: DynSJSTheme, ssr?: boolean, parent?: DynSJS | null);
    private static _isValidSelector;
    private static _isValidPropertyInput;
    static camelToKebab(string: string): string;
    /** @internal Gets theme value with cycle detection */
    _getThemeValue(key: string, defaultValue?: any, visited?: Set<object>): any;
    /**
     * Sets CSS properties. Stores the object or the function itself.
     * Resolution happens in _generateProperties. Allows merging with object argument.
     */
    set(propsOrFn: StyleProperties | SetFunction): this;
    nested(...selectors: string[]): DynSJS;
    media(query: string): DynSJS;
    when(conditionFn: ConditionFunction): this;
    /** @internal */ _isConditionMet(): boolean;
    /** @private */ _generateSelectors(parentSelector?: string): string;
    /** @private Generates property string, handles array/function values */
    _generateProperties(): string;
    /** Helper to set a color property */
    setColor(color: Color, property?: string): this;
    /** @internal Converts rule to CSS parts */
    toCSS(parentSelector?: string): CSSEntry | null;
}
//# sourceMappingURL=DynSJS.d.ts.map