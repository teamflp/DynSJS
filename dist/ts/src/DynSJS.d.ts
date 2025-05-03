/**
 * Represents a CSS rule or a block.
 */
export class DynSJS {
    /** @private */ private static _isValidSelector;
    /** @private */ private static _isValidPropertyInput;
    /** Convertit camelCase en kebab-case */ static camelToKebab(string: any): any;
    /** @internal */
    constructor(selectors?: any[], theme?: {}, ssr?: boolean, parent?: any);
    _theme: {};
    _ssr: boolean;
    _selectors: any[];
    _properties: {};
    _children: any[];
    _mediaQueries: any[];
    _conditionFn: any;
    _parent: any;
    /** @internal */ _getThemeValue(key: any, defaultValue?: any, visited?: any): any;
    /** Sets CSS properties */ set(props: any): this;
    /** Adds a nested rule */ nested(...selectors: any[]): DynSJS;
    /** Adds a media query rule */ media(query: any): DynSJS;
    /** Sets a condition */ when(conditionFn: any): this;
    /** @internal */ _isConditionMet(): any;
    /** @private */ private _generateSelectors;
    /** @private */ private _generateProperties;
    /** Helper to set a color property */ setColor(color: any, property?: string): this;
    /** @internal */ toCSS(parentSelector?: string): {
        ruleCSS: string;
        childrenCSS: string;
        mediaCSS: {
            query: any;
            css: string;
        }[];
    };
}
