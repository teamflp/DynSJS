import type { ThemeLookup } from './types';
/** Deep merge utility */
export declare function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any>;
/** Theme value lookup marker generator */
export declare function theme(key: string, defaultValue?: any): ThemeLookup;
/** @internal Checks for theme marker */
export declare function isThemeLookup(value: any): value is ThemeLookup;
//# sourceMappingURL=utils.d.ts.map