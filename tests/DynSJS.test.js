// test/DynSJS.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; // <-- Ajout de beforeEach et afterEach ici
import { DynSJS } from '../src/DynSJS.js';
import { Color } from '../src/Color.js';
// Importer le helper thème n'est pas nécessaire car on simule son résultat (le marqueur)
// import { theme as themeLookupFn } from '../src/utils.js';

// Mock theme pour les tests
const mockTheme = {
    colors: {
        primary: Color.fromHex('#00f'), // Bleu
        text: '#333'
    },
    spacing: {
        small: '4px',
        medium: '8px'
    },
    fonts: {
        body: 'Arial'
    }
};

describe('DynSJS Class', () => {

    describe('Constructor and Context', () => {
        it('should initialize with selectors, theme, and ssr flag', () => {
            const rule = new DynSJS(['.my-class'], mockTheme, true);
            expect(rule._selectors).toEqual(['.my-class']);
            expect(rule._theme).toEqual(mockTheme);
            expect(rule._ssr).toBe(true);
            expect(rule._parent).toBeNull();
        });
    });

    describe('set method', () => {
        it('should store properties', () => {
            const rule = new DynSJS(['.a']);
            rule.set({ color: 'red', margin: 0 });
            expect(rule._properties).toEqual({ color: 'red', margin: 0 });
        });

        it('should accept string, number, Color instance values', () => {
            const colorInstance = new Color(0, 255, 0);
            const rule = new DynSJS(['.b']);
            rule.set({
                width: '100px',
                opacity: 0.5,
                backgroundColor: colorInstance
            });
            expect(rule._properties).toEqual({
                width: '100px',
                opacity: 0.5,
                backgroundColor: colorInstance
            });
        });

        it('should accept theme lookup markers', () => {
            const themeMarker = { __isThemeLookupRequest__: true, key: 'colors.primary', defaultValue: 'blue' };
            const rule = new DynSJS(['.c']);
            rule.set({ color: themeMarker });
            expect(rule._properties.color).toEqual(themeMarker);
        });

        it('should accept function values', () => {
            const themeFunc = (t) => t.colors.text;
            const rule = new DynSJS(['.d']);
            rule.set({ fontFamily: themeFunc });
            expect(rule._properties.fontFamily).toBe(themeFunc);
        });
    });

    describe('_getThemeValue method (internal)', () => {
        const rule = new DynSJS(['.e'], mockTheme);
        it('should retrieve theme values using dot notation', () => {
            expect(rule._getThemeValue('colors.primary')).toEqual(mockTheme.colors.primary);
            expect(rule._getThemeValue('spacing.medium')).toBe('8px');
        });
        it('should return default value if key not found', () => {
            expect(rule._getThemeValue('colors.nonexistent', 'fallback')).toBe('fallback');
            expect(rule._getThemeValue('spacing.large', '16px')).toBe('16px');
            expect(rule._getThemeValue('invalid.path')).toBeUndefined();
        });
        it('should return defaultValue for invalid key', () => {
            expect(rule._getThemeValue(null, 'fallback')).toBe('fallback');
            expect(rule._getThemeValue('', 'fallback')).toBe('fallback');
            expect(rule._getThemeValue(undefined, 'fallback')).toBe('fallback');
        });
    });

    describe('_generateProperties method', () => {
        let warnSpy, errorSpy;

        beforeEach(() => {
            warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        });

        afterEach(() => {
            warnSpy.mockRestore();
            errorSpy.mockRestore();
        });

        it('should generate correct property string', () => {
            const rule = new DynSJS(['.f'], mockTheme);
            const colorInstance = new Color(255, 0, 0);
            const themeMarker = { __isThemeLookupRequest__: true, key: 'colors.text', defaultValue: 'black' };
            const themeFunc = (t) => t.fonts.body;

            rule.set({
                fontSize: '16px',
                lineHeight: 1.5,
                color: themeMarker,
                backgroundColor: colorInstance,
                fontFamily: themeFunc,
                opacity: 0.8,
            });
            const propsString = rule._generateProperties();

            expect(propsString).toContain('font-size: 16px;');
            expect(propsString).toContain('line-height: 1.5;');
            expect(propsString).toContain('color: #333;');
            expect(propsString).toContain('background-color: rgb(255,0,0);');
            expect(propsString).toContain('font-family: Arial;');
            expect(propsString).toContain('opacity: 0.8;');
        });

        it('should skip properties with undefined resolved value and warn', () => {
            const rule = new DynSJS(['.f'], mockTheme);
            const undefinedThemeMarker = { __isThemeLookupRequest__: true, key: 'colors.missing' };
            rule.set({ border: undefinedThemeMarker });
            const propsString = rule._generateProperties();

            expect(propsString).not.toContain('border:');
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Theme key "colors.missing" not found'));
        });

        it('should skip properties where function value throws and log error', () => {
            const rule = new DynSJS(['.f'], mockTheme);
            const failingFunc = () => { throw new Error('func error'); };
            rule.set({ outline: failingFunc });
            const propsString = rule._generateProperties();
            expect(propsString).not.toContain('outline:');
            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Func prop error [outline]:'),
                expect.any(Error)
            );
        });
    });

    describe('DynSJS Property Key Conversion', () => {
        it('should handle mixed case property names', () => {
            const rule = new DynSJS(['.test']);
            rule.set({ backgroundColor: 'red', marginTop: '10px' });
            const propsString = rule._generateProperties();
            expect(propsString).toContain('background-color: red;');
            expect(propsString).toContain('margin-top: 10px;');
        });

        it('should handle multiple word vendor prefixes', () => {
            const rule = new DynSJS(['.test']);
            rule.set({
                MozBoxSizing: 'border-box',
                WebkitUserSelect: 'none',
                msFlexDirection: 'column'
            });
            const propsString = rule._generateProperties();
            expect(propsString).toContain('-moz-box-sizing: border-box;');
            expect(propsString).toContain('-webkit-user-select: none;');
            expect(propsString).toContain('-ms-flex-direction: column;');
        });

        it('should handle numbers in property names', () => {
            const rule = new DynSJS(['.test']);
            rule.set({
                grid2dColumn: 'span 2',
                ms2GridRow: '1',
                WebkitColumn3: 'auto'
            });
            const propsString = rule._generateProperties();

            expect(propsString, "Test 'grid2dColumn'").toContain('grid2d-column: span 2;');
            expect(propsString, "Test 'ms2GridRow'").toContain('ms2-grid-row: 1;');
            expect(propsString, "Test 'WebkitColumn3'").toContain('-webkit-column3: auto;');
        });

        it('should preserve consecutive uppercase letters in vendor prefixes', () => {
            const rule = new DynSJS(['.test']);
            rule.set({
                MSGridRow: '1',
                IEFilter: 'alpha(opacity=100)',
                MSOGridColumn: '2'
            });
            const propsString = rule._generateProperties();

            expect(propsString, "Test 'MSGridRow'").toContain('-ms-grid-row: 1;'); // OK
            expect(propsString, "Test 'IEFilter'").toContain('ie-filter: alpha(opacity=100);');
            expect(propsString, "Test 'MSOGridColumn'").toContain('mso-grid-column: 2;');
        });
    });


    describe('_generateSelectors method', () => {
        const parentRule = new DynSJS(['.parent1', '.parent2']);
        const parentSingle = new DynSJS(['.parent-single']);

        it('should join simple selectors (no parent)', () => {
            const rule = new DynSJS(['.child']);
            expect(rule._generateSelectors()).toBe('.child');
            const rule2 = new DynSJS(['.a', '.b']);
            expect(rule2._generateSelectors()).toBe('.a, .b');
        });

        it('should generate descendant selectors (single parent)', () => {
            const rule = new DynSJS(['.child'], {}, false, parentSingle);
            expect(rule._generateSelectors('.parent-single')).toBe('.parent-single .child');
        });

        it('should generate descendant selectors (multiple parents)', () => {
            const rule = new DynSJS(['.child'], {}, false, parentRule);
            expect(rule._generateSelectors('.parent1, .parent2')).toBe('.parent1 .child, .parent2 .child');
        });

        it('should handle "&" replacement (single parent)', () => {
            const rule = new DynSJS(['&:hover'], {}, false, parentSingle);
            expect(rule._generateSelectors('.parent-single')).toBe('.parent-single:hover');
        });

        it('should handle "&" replacement (multiple parents)', () => {
            const rule = new DynSJS(['&:hover'], {}, false, parentRule);
            expect(rule._generateSelectors('.parent1, .parent2')).toBe('.parent1:hover, .parent2:hover');
        });

        it('should handle "&" at start/middle/end', () => {
            const rule1 = new DynSJS(['&.active'], {}, false, parentSingle);
            const rule2 = new DynSJS(['body & .child'], {}, false, parentSingle);
            const rule3 = new DynSJS(['.parent-single&'], {}, false, parentSingle);
            expect(rule1._generateSelectors('.parent-single')).toBe('.parent-single.active');
            expect(rule2._generateSelectors('.parent-single')).toBe('body .parent-single .child');
            expect(rule3._generateSelectors('.parent-single')).toBe('.parent-single.parent-single');
        });

        it('should handle multiple "&" replacements in one selector', () => {
            const rule = new DynSJS(['html.theme-dark & body &'], {}, false, parentRule);
            expect(rule._generateSelectors('.parent1, .parent2')).toBe('html.theme-dark .parent1 body .parent1, html.theme-dark .parent2 body .parent2');
        });

        it('should handle selector list with "&" (multiple parents)', () => {
            const rule = new DynSJS(['&:first-child', '& + &'], {}, false, parentRule);
            expect(rule._generateSelectors('.parent1, .parent2'))
                .toBe('.parent1:first-child, .parent2:first-child, .parent1 + .parent1, .parent2 + .parent2');
        });

        it('should handle top-level "&" gracefully (removed/ignored)', () => {
            const rule = new DynSJS(['&:hover']);
            expect(rule._generateSelectors()).toBe(':hover');
            const rule2 = new DynSJS(['&']);
            expect(rule2._generateSelectors()).toBe('');
            const rule3 = new DynSJS(['& .child']);
            expect(rule3._generateSelectors()).toBe('.child');
        });

        it('should return parent selector if rule has no selectors (media query case)', () => {
            const rule = new DynSJS([], {}, false, parentRule); // Règle vide
            expect(rule._generateSelectors('.parent1, .parent2')).toBe('.parent1, .parent2');
        });
    });

    describe('nested method', () => {
        const parentRule = new DynSJS(['.parent'], mockTheme, false);
        const childRule = parentRule.nested('.child');

        it('should create a child DynSJS instance', () => {
            expect(childRule).toBeInstanceOf(DynSJS);
            expect(childRule._selectors).toEqual(['.child']);
        });

        it('should link parent correctly', () => {
            expect(childRule._parent).toBe(parentRule);
        });

        it('should inherit theme and ssr context', () => {
            expect(childRule._theme).toEqual(mockTheme);
            expect(childRule._ssr).toBe(false);
        });
    });

    describe('media method', () => {
        const parentRule = new DynSJS(['.parent'], mockTheme, true);
        const mediaRule = parentRule.media('(min-width: 600px)');

        it('should create a media DynSJS instance (without parent selectors)', () => {
            expect(mediaRule).toBeInstanceOf(DynSJS);
            expect(mediaRule._selectors).toEqual([]); // Corrigé dans DynSJS.js
        });

        it('should store query and rule correctly', () => {
            expect(parentRule._mediaQueries.length).toBe(1);
            expect(parentRule._mediaQueries[0].query).toBe('(min-width: 600px)');
            expect(parentRule._mediaQueries[0].rule).toBe(mediaRule);
        });

        it('should inherit theme and ssr context', () => {
            expect(mediaRule._theme).toEqual(mockTheme);
            expect(mediaRule._ssr).toBe(true);
        });
    });

    describe('when method and _isConditionMet', () => {
        const conditionTrue = vi.fn(() => true);
        const conditionFalse = vi.fn(() => false);
        const conditionWithArgs = vi.fn((theme, ssr) => theme.colors.primary instanceof Color && !ssr);

        beforeEach(() => {
            conditionTrue.mockClear();
            conditionFalse.mockClear();
            conditionWithArgs.mockClear();
        });

        it('should set the condition function', () => {
            const rule = new DynSJS(['.a']);
            rule.when(conditionTrue);
            expect(rule._conditionFn).toBe(conditionTrue);
        });

        it('_isConditionMet should return true if no condition', () => {
            const rule = new DynSJS(['.a']);
            expect(rule._isConditionMet()).toBe(true);
        });

        it('_isConditionMet should call and return condition function result', () => {
            const ruleT = new DynSJS(['.a']).when(conditionTrue);
            const ruleF = new DynSJS(['.b']).when(conditionFalse);
            expect(ruleT._isConditionMet()).toBe(true);
            expect(conditionTrue).toHaveBeenCalledTimes(1);
            expect(ruleF._isConditionMet()).toBe(false);
            expect(conditionFalse).toHaveBeenCalledTimes(1);
        });

        it('_isConditionMet should pass theme and ssr context to condition', () => {
            const rule = new DynSJS(['.c'], mockTheme, false).when(conditionWithArgs);
            const result = rule._isConditionMet();
            expect(result).toBe(true);
            expect(conditionWithArgs).toHaveBeenCalledWith(mockTheme, false);
        });

        it('_isConditionMet should check parent condition', () => {
            const parent = new DynSJS(['.parent']).when(conditionFalse);
            const child = parent.nested('.child').when(conditionTrue);
            expect(child._isConditionMet()).toBe(false);
            expect(conditionTrue).not.toHaveBeenCalled();
        });

        it('_isConditionMet should return false if condition function throws', () => {
            // L'espion doit être créé AVANT l'appel qui pourrait logguer
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const throwingCondition = () => { throw new Error('Cond error'); };
            const rule = new DynSJS(['.d']).when(throwingCondition);

            // Vérifie que la méthode retourne bien false
            expect(rule._isConditionMet()).toBe(false);

            // Vérifie que console.error a été appelé avec le bon message et un objet Error
            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining("Error in 'when' condition:"), 
                expect.any(Error) 
              );
            errorSpy.mockRestore(); // Nettoie l'espion après le test
       });
    });

    describe('toCSS method', () => {
        it('should return null if condition is not met', () => {
            const rule = new DynSJS(['.a']).when(() => false).set({ color: 'red' });
            expect(rule.toCSS()).toBeNull();
        });

        it('should generate basic rule CSS', () => {
            const rule = new DynSJS(['.my-rule']).set({ color: 'blue', margin: '10px' });
            const output = rule.toCSS();
            expect(output.ruleCSS).toBe('.my-rule { color: blue; margin: 10px; }');
            expect(output.childrenCSS).toBe('');
            expect(output.mediaCSS).toEqual([]);
        });

        it('should generate nested rule CSS', () => {
            const rule = new DynSJS(['.parent']);
            rule.nested('span').set({ fontWeight: 'bold' });
            // Appel sans contexte parent explicite car toCSS est appelé sur la règle PARENT
            const output = rule.toCSS();
            expect(output.ruleCSS).toBe(''); // Parent n'a pas de style propre
            // La sortie enfant est générée récursivement et contient le sélecteur combiné
            expect(output.childrenCSS).toBe('.parent span { font-weight: bold; }');
        });

        // Teste la correction de la génération de sélecteur pour media
        it('should generate media query CSS with correct selectors', () => {
            const rule = new DynSJS(['.parent']);
            rule.media('(min-width: 700px)').set({ color: 'green' });
            const output = rule.toCSS(); // Appel depuis la règle parent

            expect(output.ruleCSS).toBe('');
            expect(output.childrenCSS).toBe('');
            // Le css interne de la media query doit utiliser le sélecteur parent
            expect(output.mediaCSS).toEqual([
                { query: '(min-width: 700px)', css: '.parent { color: green; }' }
            ]);
        });

        // Teste la structure de sortie combinée
        it('should handle combined nested and media queries output structure', () => {
            const rule = new DynSJS(['.app']);
            rule.set({ fontSize: '16px' });
            const child = rule.nested('.content');
            child.set({ padding: '1em' });
            child.media('(prefers-color-scheme: dark)').set({ background: 'black' });

            const output = rule.toCSS(); // Appel de haut niveau sur '.app'

            expect(output.ruleCSS).toBe('.app { font-size: 16px; }');
            // childrenCSS doit contenir le CSS direct de l'enfant '.app .content'
            expect(output.childrenCSS).toBe('.app .content { padding: 1em; }');
            // mediaCSS au niveau de '.app' est vide, car la media query est définie sur l'enfant
            expect(output.mediaCSS).toEqual([]);

            // (Test interne pour vérifier ce que l'enfant génère, ce qui sera collecté par StyleSheet)
            const childOutput = child.toCSS('.app'); // Simule l'appel avec contexte
            expect(childOutput.ruleCSS).toBe('.app .content { padding: 1em; }');
            expect(childOutput.mediaCSS).toEqual([
                { query: '(prefers-color-scheme: dark)', css: '.app .content { background: black; }' }
            ]);
        });
    });

    describe('DynSJS Advanced Features', () => {
        describe('Error Handling and Edge Cases', () => {
            it('should throw error for invalid selector in constructor', () => {
                // Test inchangé
                expect(() => new DynSJS([''])).toThrow(/invalid/i);
                expect(() => new DynSJS([' '])).toThrow(/invalid/i);
                expect(() => new DynSJS([null])).toThrow(/invalid/i);
            });

            it('should handle circular theme references gracefully', () => {
                // Test inchangé (devrait passer avec _getThemeValue corrigé)
                const circularTheme = { a: { b: null } };
                circularTheme.a.b = circularTheme.a;
                const rule = new DynSJS(['.test'], circularTheme);
                expect(rule._getThemeValue('a.b.b.b')).toBeUndefined();
            });

            it('should handle deeply nested rules with complex selectors', () => {
                // Test inchangé
                const rule = new DynSJS(['.level-1']);
                const level2 = rule.nested('&:hover');
                const level3 = level2.nested('& > .child');
                const level4 = level3.nested('& + .sibling');
                level4.set({ color: 'red' });

                const css = rule.toCSS(); // css = { ruleCSS:'', childrenCSS:'...', mediaCSS:[] }
                expect(css).not.toBeNull(); // La règle parente a un enfant, ne doit pas être null
                expect(css.childrenCSS).toContain('.level-1:hover > .child + .sibling { color: red; }');
            });
        });

        describe('Complex Property Resolution', () => {
            const complexTheme = {
                colors: {
                    nested: {
                        primary: new Color(100, 150, 200),
                        // Fonction thème qui référence une autre partie du thème
                        gradient: (t) => `linear-gradient(${t.colors.nested.primary.toString()}, #fff)`
                    }
                }
            };

            it('should resolve nested function values that reference theme', () => {
                // Test inchangé
                const rule = new DynSJS(['.test'], complexTheme);
                // La fonction pour 'background' appelle t.colors.nested.gradient, qui elle-même appelle t.colors.nested.primary
                rule.set({ background: (t) => t.colors.nested.gradient(t) });
                const css = rule.toCSS();
                expect(css.ruleCSS).toContain('background: linear-gradient(rgb(100,150,200), #fff);');
            });

            it('should handle multiple media queries with same breakpoint', () => {
                // Test inchangé
                const rule = new DynSJS(['.test']);
                const media1 = rule.media('(min-width: 768px)');
                const media2 = rule.media('(min-width: 768px)');
                media1.set({ color: 'red' });
                media2.set({ background: 'blue' });
                const css = rule.toCSS();
                expect(css.mediaCSS).toHaveLength(2); // toCSS retourne les media définis sur CETTE règle
                // Le regroupement se fait dans StyleSheet.compile()
                expect(css.mediaCSS[0].query).toBe('(min-width: 768px)');
                expect(css.mediaCSS[0].css).toBe('.test { color: red; }'); // Vérifie le CSS interne
                expect(css.mediaCSS[1].query).toBe('(min-width: 768px)');
                expect(css.mediaCSS[1].css).toBe('.test { background: blue; }');
            });
        });

        describe('Conditional Styling Combinations', () => {
            it('should combine multiple conditions in nested rules', () => {
                // Scénario 1: SSR=true -> child condition fails
                const ruleSSR = new DynSJS(['.parent'], {}, true); // SSR = true
                const childSSR = ruleSSR.nested('&.active').when((t, ssr) => !ssr); // Fail !
                const grandChildSSR = childSSR.nested('&:hover').when(t => t?.colors?.primary instanceof Color);
                grandChildSSR.set({ color: 'blue' });

                const cssSSR = ruleSSR.toCSS();

                // --- ASSERTION CORRIGÉE ---
                // ruleSSR n'a pas de style et son seul enfant (childSSR) est exclu par la condition 'when'.
                // Donc, toCSS sur ruleSSR doit retourner null.
                expect(cssSSR, "Scenario SSR: Parent rule should return null").toBeNull();
                // --- FIN CORRECTION ---

                // Scénario 2: Client-side, Theme OK -> all conditions pass
                const ruleClient = new DynSJS(['.parent'], mockTheme, false); // SSR = false
                const childClient = ruleClient.nested('&.active').when((t, ssr) => !ssr); // Pass
                const grandChildClient = childClient.nested('&:hover').when(t => t.colors?.primary instanceof Color); // Pass
                grandChildClient.set({ color: 'blue' });

                const cssClient = ruleClient.toCSS();
                expect(cssClient).not.toBeNull(); // Ne doit pas être null ici
                expect(cssClient.ruleCSS).toBe(''); // Parent n'a pas de style propre
                expect(cssClient.childrenCSS).toContain('.parent.active:hover { color: blue; }'); // L'enfant et petit-enfant doivent être compilés
            });
        });

        describe('Special Selector Patterns', () => {
            it('should handle complex attribute selectors', () => {
                // Test inchangé
                const rule = new DynSJS(['[data-test^="prefix"]']); // Sélecteur sur la règle elle-même
                rule.set({ color: 'red' });

                const parent = new DynSJS(['.parent']);
                const child = parent.nested('&[data-test^="prefix"]'); // Sélecteur sur l'enfant avec '&'
                child.set({ color: 'blue' });

                expect(rule.toCSS().ruleCSS).toBe('[data-test^="prefix"] { color: red; }');
                expect(parent.toCSS().childrenCSS).toBe('.parent[data-test^="prefix"] { color: blue; }');
            });

            it('should handle multiple ampersands with complex combinators', () => {
                // Test inchangé
                const rule = new DynSJS(['.parent']);
                const child = rule.nested('& ~ & + &'); // Imbrication avec multiples '&'
                child.set({ margin: '10px' });

                const css = rule.toCSS();
                expect(css.childrenCSS).toBe('.parent ~ .parent + .parent { margin: 10px; }');
            });
        });
    });
});