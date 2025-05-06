// Helper interne (pas besoin d'exporter)
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
/** Deep merge utility */
export function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!(key in target) || !isObject(target[key])) {
                    output[key] = deepMerge({}, source[key]);
                }
                else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            }
            else {
                output[key] = source[key];
            }
        });
    }
    else if (isObject(source)) {
        return deepMerge({}, source);
    }
    return output;
}
// --- Helpers Theming ---
const THEME_LOOKUP_MARKER = '__isThemeLookupRequest__';
/** Theme value lookup marker generator */
export function theme(key, defaultValue = undefined) {
    if (!key.trim()) {
        console.warn(`DynSJS: Invalid theme key: "${key}".`);
    }
    return { [THEME_LOOKUP_MARKER]: true, key: key || '', defaultValue: defaultValue };
}
/** @internal Checks for theme marker */
export function isThemeLookup(value) {
    return typeof value === 'object' && value !== null && value[THEME_LOOKUP_MARKER] === true;
}
//# sourceMappingURL=utils.js.map