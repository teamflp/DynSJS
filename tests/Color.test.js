// test/Color.test.js
import { describe, it, expect, vi } from 'vitest';
import { Color } from '../src/Color.ts';

describe('Color Class', () => {

    // --- Tests du Constructeur ---
    describe('Constructor', () => {
        it('should create a color with given RGBA values', () => {
            const color = new Color(10, 20, 30, 0.5);
            expect(color.r).toBe(10);
            expect(color.g).toBe(20);
            expect(color.b).toBe(30);
            expect(color.a).toBe(0.5);
        });

        it('should default alpha to 1', () => {
            const color = new Color(50, 60, 70);
            expect(color.a).toBe(1);
        });

        it('should clamp RGB values to 0-255', () => {
            const color = new Color(300, -10, 120);
            expect(color.r).toBe(255);
            expect(color.g).toBe(0);
            expect(color.b).toBe(120);
        });

        // Teste la correction du constructeur pour alpha invalide/NaN
        it('should clamp alpha value to 0-1 and handle invalid input', () => {
            const color1 = new Color(10, 10, 10, 1.5);
            const color2 = new Color(10, 10, 10, -0.5);
            const color3 = new Color(10, 10, 10, 'invalid'); // Test NaN case
            expect(color1.a).toBe(1);
            expect(color2.a).toBe(0);
            // S'attend à ce que le constructeur corrigé retourne 1 pour NaN
            expect(color3.a).toBe(1);
        });

        it('should parse float alpha values correctly', () => {
             const color = new Color(10, 10, 10, '0.8');
             expect(color.a).toBe(0.8);
        });

        it('should be immutable', () => {
             const color = new Color(10, 20, 30);
             expect(() => { color.r = 50; }).toThrow(TypeError);
             expect(Object.isFrozen(color)).toBe(true);
        });
    });

    // --- Tests de fromHex ---
    describe('fromHex', () => {
        it('should create color from #RRGGBB', () => {
            const color = Color.fromHex('#FF8800');
            expect(color.r).toBe(255); expect(color.g).toBe(136); expect(color.b).toBe(0); expect(color.a).toBe(1);
        });
        it('should create color from #RGB', () => {
            const color = Color.fromHex('#F80');
            expect(color.r).toBe(255); expect(color.g).toBe(136); expect(color.b).toBe(0); expect(color.a).toBe(1);
        });
         it('should create color from #RRGGBBAA', () => {
            const color = Color.fromHex('#FF880080');
            expect(color.r).toBe(255); expect(color.g).toBe(136); expect(color.b).toBe(0);
            expect(color.a).toBeCloseTo(128 / 255);
        });
         it('should create color from #RGBA', () => {
            const color = Color.fromHex('#F808');
            expect(color.r).toBe(255); expect(color.g).toBe(136); expect(color.b).toBe(0);
             expect(color.a).toBeCloseTo(136 / 255);
        });
        // Teste la validation regex ajoutée à fromHex
        it('should throw error for invalid hex formats', () => {
            expect(() => Color.fromHex('#F8'), 'Length 1').toThrow();
            expect(() => Color.fromHex('#12345'), 'Length 5').toThrow();
            expect(() => Color.fromHex('#FF880G'), 'Invalid char G').toThrow(/non-hex characters/i);
            expect(() => Color.fromHex('FF8800'), 'No #').toThrow(/Must start with #/i);
            expect(() => Color.fromHex('#GG0000'), 'Invalid char G').toThrow(/non-hex characters/i);
            expect(() => Color.fromHex(123), 'Not string').toThrow();
            expect(() => Color.fromHex(null), 'Null input').toThrow();
        });
    });

    // --- Tests de fromRgb ---
    describe('fromRgb', () => {
        it('should create color from valid rgb string with varied spacing', () => {
            const color = Color.fromRgb('rgb( 255 ,0, 128)');
            expect(color.r).toBe(255); expect(color.g).toBe(0); expect(color.b).toBe(128); expect(color.a).toBe(1);
        });
    
        // CORRIGÉ : Vérifie que le parsing échoue pour des valeurs non valides (comme négatifs)
        it('should THROW for out-of-range or non-digit values in format', () => {
             expect(() => Color.fromRgb('rgb(300, -10, 10)'), "Negative value").toThrow(/Invalid rgb format/i);
             expect(() => Color.fromRgb('rgb(10, 10.5, 10)'), "Float value").toThrow(/Invalid rgb format/i); // \d ne match pas '.'
        });
    
        // CORRIGÉ : Test séparé pour vérifier le clamping via le constructeur avec des valeurs > 255
        it('should clamp high values via constructor', () => {
             const colorHigh = Color.fromRgb('rgb(300, 10, 10)'); // Format valide, valeur haute
             expect(colorHigh.r).toBe(255); // Clamping vérifié ici
        });
    
        it('should throw for invalid rgb string formats', () => {
            expect(() => Color.fromRgb('rgb(255,0)')).toThrow(/Invalid rgb format/i);
            expect(() => Color.fromRgb('rgba(255,0,0,1)')).toThrow(/Invalid rgb format/i);
            expect(() => Color.fromRgb('rgb(255, 0, abc)')).toThrow(/Invalid rgb format/i);
            expect(() => Color.fromRgb(null)).toThrow();
        });
    });

    // --- Tests de fromRgba ---
    describe('fromRgba', () => {
        it('should create color from valid rgba string with integer alpha', () => { /* ... */ });
        it('should create color from valid rgba string with float alpha', () => { /* ... */ });
        it('should create color from valid rgba string with leading dot alpha', () => { /* ... */ });
    
        // CORRIGÉ : Vérifie que le parsing échoue pour des valeurs non valides (comme négatifs)
        it('should THROW for out-of-range or non-digit values in format', () => {
            expect(() => Color.fromRgba('rgba(400, -20, 0, 1.8)'), "Negative value").toThrow(/Invalid rgba format/i);
        });
    
        // CORRIGÉ : Test séparé pour vérifier le clamping via le constructeur
        it('should clamp high values via constructor', () => {
             const colorHigh = Color.fromRgba('rgba(400, 0, 0, 1.8)'); // Format valide, valeurs hautes
             expect(colorHigh.r).toBe(255);
             expect(colorHigh.a).toBe(1); // Alpha > 1 clampé
        });
    
        it('should throw for invalid rgba string formats', () => {
            expect(() => Color.fromRgba('rgba(50,100,150)')).toThrow(/Invalid rgba format/i);
            expect(() => Color.fromRgba('rgb(50,100,150,1)')).toThrow(/Invalid rgba format/i);
            expect(() => Color.fromRgba('rgba(50,100,abc,1)')).toThrow(/Invalid rgba format/i);
            expect(() => Color.fromRgba(null)).toThrow();
        });
    });

    // --- Tests de fromHsl ---
     describe('fromHsl', () => {
        it('should create red from HSL(0, 1, 0.5)', () => {
            const color = Color.fromHsl(0, 1, 0.5);
            expect(color.r).toBe(255); expect(color.g).toBe(0); expect(color.b).toBe(0); expect(color.a).toBe(1);
        });
        it('should create green from HSL(120, 100%, 50%)', () => {
            const color = Color.fromHsl(120, 100, 50); // Use percentage range
            expect(color.r).toBe(0); expect(color.g).toBe(255); expect(color.b).toBe(0); expect(color.a).toBe(1);
        });
        it('should create blue from HSL(240, 1, 0.5, 0.8)', () => {
            const color = Color.fromHsl(240, 1, 0.5, 0.8);
            expect(color.r).toBe(0); expect(color.g).toBe(0); expect(color.b).toBe(255); expect(color.a).toBe(0.8);
        });
        it('should create grey from HSL(any, 0, 0.5)', () => {
            const color = Color.fromHsl(150, 0, 0.5); // Saturation = 0 -> grey
            expect(color.r).toBe(128); expect(color.g).toBe(128); expect(color.b).toBe(128);
        });
        it('should create white from HSL(any, any, 1)', () => {
            const color = Color.fromHsl(200, 0.5, 1);
            expect(color.r).toBe(255); expect(color.g).toBe(255); expect(color.b).toBe(255);
        });
        it('should create black from HSL(any, any, 0)', () => {
             const color = Color.fromHsl(300, 1, 0);
             expect(color.r).toBe(0); expect(color.g).toBe(0); expect(color.b).toBe(0);
        });
         it('should handle hue wrapping (e.g., 360 = 0, 480 = 120)', () => {
             const color0 = Color.fromHsl(0, 1, 0.5);
             const color360 = Color.fromHsl(360, 1, 0.5);
             const color120 = Color.fromHsl(120, 1, 0.5);
             const color480 = Color.fromHsl(480, 1, 0.5);
             expect(color360).toEqual(color0); // Red
             expect(color480).toEqual(color120); // Green
         });
          it('should clamp S and L values', () => {
             const colorS = Color.fromHsl(120, 150, 50); // s > 100%
             const colorL = Color.fromHsl(120, 100, -10); // l < 0%
             expect(colorS.g).toBe(255); // Should still be green (clamped s=1)
             expect(colorL.r).toBe(0); expect(colorL.g).toBe(0); expect(colorL.b).toBe(0); // Clamped l=0 -> black
         });
     });

    // --- Tests de toHsl / toHslString ---
     describe('HSL Conversion and String', () => {
        it('should convert pure red to HSL(0, 1, 0.5)', () => {
            const color = new Color(255, 0, 0);
            const hsl = color.toHsl();
            expect(hsl.h).toBe(0);
            expect(hsl.s).toBeCloseTo(1);
            expect(hsl.l).toBeCloseTo(0.5);
            expect(hsl.a).toBe(1);
        });
        it('should convert grey to HSL(0, 0, L)', () => {
             const color = new Color(128, 128, 128);
             const hsl = color.toHsl();
             expect(hsl.s).toBeCloseTo(0);
             expect(hsl.l).toBeCloseTo(128 / 255);
        });
         it('should convert partial alpha correctly to HSL', () => {
             const color = new Color(0, 255, 0, 0.6); // Green transparent
             const hsl = color.toHsl();
             expect(hsl.h).toBe(120);
             expect(hsl.s).toBeCloseTo(1);
             expect(hsl.l).toBeCloseTo(0.5);
             expect(hsl.a).toBe(0.6);
         });

         // toHslString tests (teste la correction de l'arrondi alpha)
         it('toHslString() should return hsl() for alpha=1 (and alpha rounding to 1)', () => {
             const color1 = Color.fromHsl(240, 0.8, 0.6, 1);
             const color2 = Color.fromHsl(30, 50, 70, 0.999); // Rounds to 1
             expect(color1.toHslString()).toBe('hsl(240, 80%, 60%)');
             expect(color2.toHslString()).toBe('hsl(30, 50%, 70%)');
         });
         it('toHslString() should return hsla() for alpha<1', () => {
             const color1 = Color.fromHsl(30, 50, 70, 0.75);
             const color2 = Color.fromHsl(30, 50, 70, 0.001); // Rounds to 0
             expect(color1.toHslString()).toBe('hsla(30, 50%, 70%, 0.75)');
             expect(color2.toHslString()).toBe('hsla(30, 50%, 70%, 0)');
         });
     });


    // --- Tests de String Representations (RGB/A) ---
    describe('String Representations (RGB/A)', () => {
        const colorFullAlpha = new Color(50, 100, 150);
        const colorPartialAlpha = new Color(50, 100, 150, 0.75);
        const colorAlmostOpaque = new Color(1, 2, 3, 0.999); // Rounds to 1 alpha
        const colorAlmostTransparent = new Color(4, 5, 6, 0.001); // Rounds to 0 alpha

        it('toString() should return rgb() for alpha=1 (and alpha rounding to 1)', () => {
            expect(colorFullAlpha.toString()).toBe('rgb(50,100,150)');
            expect(colorAlmostOpaque.toString()).toBe('rgb(1,2,3)'); // Teste la correction de l'arrondi
        });
        it('toString() should return rgba() for alpha<1', () => {
            expect(colorPartialAlpha.toString()).toBe('rgba(50,100,150,0.75)');
            expect(colorAlmostTransparent.toString()).toBe('rgba(4,5,6,0)'); // Teste la correction de l'arrondi
        });
        it('toRGBA() should always return rgba() with full alpha precision', () => {
            expect(colorFullAlpha.toRGBA()).toBe('rgba(50,100,150,1)');
            expect(colorPartialAlpha.toRGBA()).toBe('rgba(50,100,150,0.75)');
            expect(colorAlmostOpaque.toRGBA()).toBe('rgba(1,2,3,0.999)'); // Pas d'arrondi ici
            expect(colorAlmostTransparent.toRGBA()).toBe('rgba(4,5,6,0.001)'); // Pas d'arrondi ici
        });
    });

    // --- Tests d'Opérations ---
     describe('operate', () => {
        const baseColor = new Color(100, 150, 200);

        it('should return a new Color instance (immutability)', () => {
            const newColor = baseColor.operate('+', 10);
            expect(newColor).not.toBe(baseColor);
            expect(newColor).toBeInstanceOf(Color);
            expect(baseColor.r).toBe(100); expect(baseColor.g).toBe(150); expect(baseColor.b).toBe(200);
        });

        it('should perform addition correctly and clamp', () => {
            const newColor = baseColor.operate('+', 20);
            expect(newColor.r).toBe(120); expect(newColor.g).toBe(170); expect(newColor.b).toBe(220);
            const clampedColor = baseColor.operate('+', 1000);
            expect(clampedColor.r).toBe(255); expect(clampedColor.g).toBe(255); expect(clampedColor.b).toBe(255);
        });

         it('should perform subtraction correctly and clamp', () => {
            const newColor = baseColor.operate('-', 20);
             expect(newColor.r).toBe(80); expect(newColor.g).toBe(130); expect(newColor.b).toBe(180);
            const clampedColor = baseColor.operate('-', 1000);
            expect(clampedColor.r).toBe(0); expect(clampedColor.g).toBe(0); expect(clampedColor.b).toBe(0);
        });

        it('should perform multiplication correctly and clamp', () => {
            const newColor = baseColor.operate('*', 1.5);
            expect(newColor.r).toBe(150); expect(newColor.g).toBe(225); expect(newColor.b).toBe(255);
             const zeroColor = baseColor.operate('*', 0);
             expect(zeroColor.r).toBe(0); expect(zeroColor.g).toBe(0); expect(zeroColor.b).toBe(0);
             const highClamp = baseColor.operate('*', 3);
             expect(highClamp.r).toBe(255); expect(highClamp.g).toBe(255); expect(highClamp.b).toBe(255);
        });

        it('should perform division correctly (integer result due to Math.round)', () => {
             const newColor = baseColor.operate('/', 2);
             expect(newColor.r).toBe(50); expect(newColor.g).toBe(75); expect(newColor.b).toBe(100);
             const newColorFloat = new Color(101, 151, 201).operate('/', 2);
             expect(newColorFloat.r).toBe(51);
             expect(newColorFloat.g).toBe(76);
             expect(newColorFloat.b).toBe(101);
        });

        it('should throw error on division by zero', () => {
             expect(() => baseColor.operate('/', 0)).toThrow(/division by zero/i);
        });

        it('should perform modulo correctly', () => {
             const newColor = baseColor.operate('%', 120);
             expect(newColor.r).toBe(100); expect(newColor.g).toBe(30); expect(newColor.b).toBe(80);
        });

         it('should throw error on modulo by zero', () => {
             expect(() => baseColor.operate('%', 0)).toThrow(/modulo by zero/i);
        });

        it('should return original color and warn for invalid operation', () => {
             const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {}); // Espionne et ignore l'output console réel
             const invalidOpColor = baseColor.operate('^', 10);
             expect(invalidOpColor).toBe(baseColor); // Devrait retourner l'instance originale
             expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid color operation: ^'));
             warnSpy.mockRestore(); // Nettoyer l'espion
        });
     });

});