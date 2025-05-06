import type { Color } from './Color';
import type { DynSJS } from './DynSJS';
export interface DynSJSTheme {
    [key: string]: any;
}
export interface ThemeLookup {
    __isThemeLookupRequest__: true;
    key: string;
    defaultValue?: any;
}
export type StyleValuePrimitive = string | number | Color | ThemeLookup | StyleValueFunction;
export type StyleValue = StyleValuePrimitive | Array<StyleValuePrimitive>;
export type StyleValueFunction = (theme: DynSJSTheme, context: DynSJS) => string | number | Color;
export type StyleProperties = {
    [key: string]: StyleValue;
};
export type SetFunction = (theme: DynSJSTheme, context: DynSJS) => StyleProperties;
export type ConditionFunction = (theme: DynSJSTheme, ssr: boolean) => boolean;
export interface CSSEntry {
    ruleCSS: string;
    childrenCSS: string;
    mediaCSS: Array<{
        query: string;
        css: string;
    }>;
}
export interface KeyframeDefinition {
    [step: string]: StyleProperties;
}
export interface StyleSheetOptions {
    ssr?: boolean;
    styleTagId?: string;
}
//# sourceMappingURL=types.d.ts.map