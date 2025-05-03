/** Deep merge utility */
export function deepMerge(target: any, source: any): any;
/** Theme value lookup marker */
export function theme(key: any, defaultValue?: any): {
    __isThemeLookupRequest__: boolean;
    key: any;
    defaultValue: any;
};
/** @internal Checks for theme marker */
export function isThemeLookup(value: any): boolean;
