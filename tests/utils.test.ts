// test/utils.test.ts

import { describe, it, expect } from 'vitest';
import {
    px, rem, em, percent, vh, vw, deg, s, ms, fr,
    useVar
    // N'importez pas theme, deepMerge, isThemeLookup ici sauf si vous voulez les tester spécifiquement
} from '../src/utils.js'; // Assurez-vous que le chemin est correct vers votre fichier utils.ts (ou index.ts si réexporté)

describe('Unit Helper Functions', () => {
    it('px() should return pixel value', () => {
        expect(px(10)).toBe('10px');
        expect(px(0)).toBe('0px');
        expect(px(1.5)).toBe('1.5px');
    });

    it('rem() should return rem value', () => {
        expect(rem(1.5)).toBe('1.5rem');
        expect(rem(0)).toBe('0rem');
    });

    it('em() should return em value', () => {
        expect(em(1.2)).toBe('1.2em');
    });

    it('percent() should return percentage value', () => {
        expect(percent(50)).toBe('50%');
    });

    it('vh() should return viewport height value', () => {
        expect(vh(100)).toBe('100vh');
    });

    it('vw() should return viewport width value', () => {
        expect(vw(50)).toBe('50vw');
    });

    it('deg() should return degree value', () => {
        expect(deg(90)).toBe('90deg');
    });

    it('s() should return seconds value', () => {
        expect(s(1.5)).toBe('1.5s');
    });

    it('ms() should return milliseconds value', () => {
        expect(ms(500)).toBe('500ms');
    });

    it('fr() should return fraction value', () => {
        expect(fr(1)).toBe('1fr');
        expect(fr(2)).toBe('2fr');
    });
});

describe('useVar Helper Function', () => {
    it('should create var() syntax correctly', () => {
        expect(useVar('primary-color')).toBe('var(--primary-color)');
    });

    it('should keep -- if already present', () => {
        expect(useVar('--secondary-color')).toBe('var(--secondary-color)');
    });

    it('should include string fallback correctly', () => {
        expect(useVar('primary-color', 'blue')).toBe('var(--primary-color, blue)');
    });

    it('should include number fallback correctly', () => {
        expect(useVar('spacing-unit', 16)).toBe('var(--spacing-unit, 16)');
    });

    it('should handle empty name (though not ideal usage)', () => {
        // Le comportement actuel de useVar avec un nom vide ou juste '--' peut être affiné.
        // Pour l'instant, on teste ce qu'il produit.
        expect(useVar('')).toBe('var(--)');
        expect(useVar('--')).toBe('var(--)');
    });
});