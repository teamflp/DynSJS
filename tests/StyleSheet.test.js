// test/StyleSheet.test.js
/** @vitest-environment jsdom */

// Imports Vitest et classes/helpers
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// Importe depuis la sortie JS compilée ou l'index JS source
import { StyleSheet, Color, DynSJS, theme as theme } from '../src/index.js'; // Utilise theme directement

// Thèmes de test
const defaultTheme = {
     fontSizes: { base: '16px' }
};
const userTheme = {
     colors: { primary: Color.fromHex('#ff00ff'), text: '#111' },
     spacing: { large: '32px' },
     fontSizes: { base: '14px' }
};
// Thème simple pour les tests setTheme
const initialThemeForSetTheme = {
    colors: { primary: 'blue' },
    spacing: { base: '10px' }
};
const newThemeForSetTheme = {
    colors: { primary: 'red', secondary: 'green' },
    spacing: { base: '12px' }
};


describe('StyleSheet Class', () => {

    afterEach(() => {
        document.head.innerHTML = '';
        vi.restoreAllMocks();
    });

    describe('Constructor and Theming', () => {
        it('should initialize with default options', () => {
            const sheet = new StyleSheet();
            expect(sheet._theme).toEqual({});
            expect(sheet._ssr).toBe(false);
            expect(sheet._styleTagId).toMatch(/^dynsjs-styles-/);
            expect(sheet._rules).toEqual([]);
            expect(sheet._keyframes).toEqual({});
            expect(sheet._dirty).toBe(true);
            expect(sheet._cachedCSS).toBeNull();
        });

        it('should merge user theme with default theme', () => {
             const sheet = new StyleSheet(userTheme);
             expect(sheet._theme.colors.primary).toEqual(userTheme.colors.primary);
             expect(sheet._theme.spacing.large).toBe('32px');
             expect(sheet._theme.fontSizes.base).toBe('14px');
        });

        it('should accept ssr and styleTagId options', () => {
             const options = { ssr: true, styleTagId: 'my-custom-id' };
             const sheet = new StyleSheet({}, options);
             expect(sheet._ssr).toBe(true);
             expect(sheet._styleTagId).toBe('my-custom-id');
        });
    });

     describe('rule method', () => {
        it('should add a rule and return a DynSJS instance with context', () => {
            const sheet = new StyleSheet(userTheme, { ssr: true });
            const rule = sheet.rule('.my-rule');
            expect(sheet._rules.length).toBe(1);
            expect(rule).toBeInstanceOf(DynSJS);
            expect(rule._selectors).toEqual(['.my-rule']);
            expect(rule._theme).toEqual(sheet._theme);
            expect(rule._ssr).toBe(true);
            expect(rule._getThemeValue('colors.text')).toBe('#111');
        });
         it('should invalidate cache', () => {
             const sheet = new StyleSheet();
             sheet.compile();
             expect(sheet._dirty).toBe(false);
             sheet.rule('.a');
             expect(sheet._dirty).toBe(true);
         });
    });

     describe('keyframes method', () => {
        it('should add keyframes definition', () => {
            const sheet = new StyleSheet();
            const definition = { 'from': { opacity: 0 }, 'to': { opacity: 1 } };
            sheet.keyframes('fadeIn', definition);
            expect(sheet._keyframes['fadeIn']).toEqual(definition);
        });
        it('should throw error for invalid arguments', () => {
             const sheet = new StyleSheet();
             expect(() => sheet.keyframes('', {})).toThrow();
             expect(() => sheet.keyframes('anim', null)).toThrow();
             expect(() => sheet.keyframes(123, {})).toThrow();
        });
         it('should invalidate cache', () => {
             const sheet = new StyleSheet();
             sheet.compile();
             expect(sheet._dirty).toBe(false);
             sheet.keyframes('a', {});
             expect(sheet._dirty).toBe(true);
         });
    });

     describe('setTheme method', () => {
         let sheet; // Déclaration sans type

         beforeEach(() => {
             sheet = new StyleSheet(initialThemeForSetTheme);
             sheet.rule('dummy').set({property: 'value'});
             sheet.compile();
             vi.spyOn(sheet, 'clearInjected');
         });

         it('should update the internal theme by merging', () => {
             sheet.setTheme(newThemeForSetTheme);
             expect(sheet._theme.colors.primary).toBe('red');
             expect(sheet._theme.colors.secondary).toBe('green');
             expect(sheet._theme.spacing.base).toBe('12px');
         });

         it('should invalidate the cache (_dirty = true)', () => {
            expect(sheet._dirty).toBe(false);
            sheet.setTheme(newThemeForSetTheme);
            expect(sheet._dirty).toBe(true);
         });

          it('should call clearInjected()', () => {
             sheet.setTheme(newThemeForSetTheme);
             expect(sheet.clearInjected).toHaveBeenCalled();
         });

         // --- Test Mis à Jour avec la syntaxe set(t => ...) ---
         it('subsequent compile should use the new theme', () => {
             // Définit la règle AVANT setTheme, en utilisant la nouvelle syntaxe
             sheet.rule('.button').set( t => ({
                 color: t.colors?.primary // Accède au thème actuel (initial = 'blue')
             }));
             // Change le thème (primary devient 'red')
             sheet.setTheme(newThemeForSetTheme);
             // Recompile (devrait utiliser le NOUVEAU thème)
             const css = sheet.compile();
             // Vérifie que la couleur est bien 'red'
             expect(css).toContain('.button { color: red; }');
             expect(css).not.toContain('blue'); // S'assure que l'ancienne n'est plus là
         });
         // --- Fin Test Mis à Jour ---
     });

    describe('compile method', () => {
        it('should return empty string for empty sheet', () => {
            const sheet = new StyleSheet();
            expect(sheet.compile()).toBe('');
        });

        it('should compile simple rules', () => {
            const sheet = new StyleSheet();
            sheet.rule('h1').set({fontSize: '2em'});
            sheet.rule('.p1', '.p2').set({margin: '1em 0'});
            expect(sheet.compile()).toMatchSnapshot();
        });

        it('should compile keyframes', () => {
             const sheet = new StyleSheet();
             sheet.keyframes('slide', { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' }});
             sheet.rule('.slider').set({animation: 'slide 1s ease-in'});
             expect(sheet.compile()).toMatchSnapshot();
        });

         it('should compile nested rules', () => {
            const sheet = new StyleSheet();
            sheet.rule('nav').nested('ul').nested('li').set({display: 'inline-block'});
            expect(sheet.compile().trim()).toBe('nav ul li { display: inline-block; }');
        });

         // Ce test peut nécessiter une mise à jour snapshot avec "npm test -- -u"
         it('should compile media queries correctly grouped', () => {
            const sheet = new StyleSheet();
            sheet.rule('body').media('(min-width: 600px)').set({fontSize: '18px'});
            sheet.rule('.container').media('(min-width: 600px)').set({maxWidth: '900px'});
            sheet.rule('.footer').media('(max-width: 599px)').set({fontSize: '12px'});
            sheet.rule('.header').media('(min-width: 600px)').nested('a').set({color: 'blue'});
            expect(sheet.compile()).toMatchSnapshot();
         });

          it('should respect "when" conditions', () => {
            const sheet = new StyleSheet();
            sheet.rule('.a').when(() => true).set({color: 'green'});
            sheet.rule('.b').when(() => false).set({color: 'red'});
            const css = sheet.compile();
            expect(css).toContain('.a { color: green; }');
            expect(css).not.toContain('.b { color: red; }');
        });

        it('should use cache on second call if not dirty', () => {
            const sheet = new StyleSheet();
            sheet.rule('.a').set({color: 'blue'});
            const result1 = sheet.compile();
            expect(sheet._dirty, 'Flag after first compile').toBe(false);
            expect(sheet._cachedCSS, 'Cache after first compile').toBe(result1);
            const result2 = sheet.compile();
            expect(result2, 'Result from cache').toBe(result1);
            expect(sheet._dirty, 'Flag after cached compile').toBe(false);
            sheet.rule('.b').set({margin: '10px'});
            expect(sheet._dirty, 'Flag after adding rule').toBe(true);
            const result3 = sheet.compile();
            expect(result3, 'Result after cache invalidation').not.toBe(result1);
            expect(result3).toContain('.b { margin: 10px; }');
            expect(sheet._dirty, 'Flag after re-compile').toBe(false);
         });

         // --- LE TEST QUI ÉCHOUE ENCORE ---
         it('should resolve theme functions in keyframes (workaround)', () => {
            const themeForTest = { colors: { animEnd: Color.fromHex('#ff0000').toString() }};
            const sheet = new StyleSheet(themeForTest);
            sheet.keyframes('changeColor', {
                '0%': { color: 'blue' },
                '100%': { color: (t) => t.colors.animEnd }
            });
           const css = sheet.compile();
           expect(css).toContain('@keyframes changeColor');
           expect(css).toContain('100% { color: rgb(255,0,0); }');
        });
         // --- FIN DU TEST MODIFIÉ ---
    });

    describe('inject and clearInjected methods (DOM)', () => {

        it('should inject styles into a style tag', () => {
            const sheet = new StyleSheet({}, { styleTagId: 'inject-test' });
            sheet.rule('.test-inject').set({color: 'purple'});
            sheet.inject();
            const styleElement = document.getElementById('inject-test');
            expect(styleElement).not.toBeNull();
            expect(styleElement?.tagName).toBe('STYLE');
            expect(styleElement?.textContent).toContain('.test-inject { color: purple; }');
        });

        // --- Test Restauré ---
        it('should not inject in ssr mode', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const sheet = new StyleSheet({}, { ssr: true });
            sheet.rule('.a').set({color: 'red'});
            sheet.inject();
            expect(document.head.innerHTML).toBe('');
            expect(warnSpy).not.toHaveBeenCalled();
        });

         // --- Test Restauré ---
         it('should create only one style tag per instance ID', () => {
            const sheet = new StyleSheet({}, { styleTagId: 'unique-tag' });
            sheet.rule('.a').set({ color: 'red' }); sheet.inject();
            const styleElement1 = document.getElementById('unique-tag');
            sheet.rule('.b').set({ color: 'blue' }); sheet.inject(); // Réutilise
            const styleElement2 = document.getElementById('unique-tag');
            expect(styleElement2).toBe(styleElement1);
            expect(document.querySelectorAll('#unique-tag').length).toBe(1);
            expect(styleElement2?.textContent).toContain('.b { color: blue; }');
         });

        // --- Test Restauré (version complète) ---
        it('should clear injected styles and remove tag and invalidate cache', () => {
             const sheet = new StyleSheet({}, { styleTagId: 'clear-test' });
             sheet.rule('.a').set({color: 'red'}); sheet.inject();
             sheet.compile(); // Assure _dirty = false
             expect(sheet._dirty).toBe(false);
             expect(document.getElementById('clear-test')).not.toBeNull();

             sheet.clearInjected();
             expect(document.getElementById('clear-test')).toBeNull(); // Tag supprimé
             expect(sheet._dirty).toBe(true); // Cache invalidé
        });

         // --- Test Restauré ---
         it('should update style tag content on re-inject after change', () => {
            const sheet = new StyleSheet({}, { styleTagId: 'update-test' });
            sheet.rule('.a').set({color: 'red'}); sheet.inject();
            const styleElement = document.getElementById('update-test');
            expect(styleElement?.textContent).toContain('.a { color: red; }');
            const content1 = styleElement?.textContent;
            sheet.rule('.b').set({color: 'blue'}); sheet.inject(); // Re-inject
            const content2 = styleElement?.textContent;
            expect(content2).not.toBe(content1);
            expect(content2).toContain('.a { color: red; }');
            expect(content2).toContain('.b { color: blue; }');
        });

        // --- Test Restauré et Mis à Jour avec set(t => ...) ---
        it('setTheme should clear styles and require re-inject', () => {
             const sheet = new StyleSheet({ colors: { p: 'blue'} }, { styleTagId: 'theme-test' });
             // Utilise la syntaxe recommandée
             sheet.rule('.a').set(t => ({ color: t.colors?.p }));
             sheet.inject();
             const styleElement = document.getElementById('theme-test');
             expect(styleElement?.textContent).toContain('blue');

             expect(typeof sheet.setTheme).toBe('function');
             sheet.setTheme({ colors: { p: 'red' } }); // Change la couleur

             expect(document.getElementById('theme-test')).toBeNull(); // clearInjected ok

             sheet.inject(); // Réinjecte
             const styleElementAfter = document.getElementById('theme-test');
             expect(styleElementAfter).not.toBeNull();
             expect(styleElementAfter?.textContent).toContain('red'); // Nouveau thème ok
        });
    });
});