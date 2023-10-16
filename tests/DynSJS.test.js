import { DynSJS } from '../src/Classes/DynSJS.js';
describe('DynSJS', () => {
  describe('constructor', () => {
    it('should throw an error if one or more selectors are invalid', () => {
      expect(() => new DynSJS('body', '', '.container')).toThrowError('Un ou plusieurs sélecteurs sont invalides.');
    });

    it('should accept an array of selectors', () => {
      const dynSJS = new DynSJS(['body', '.container']);
      expect(dynSJS._selectors).toEqual(['body', '.container']);
    });

    it('should accept multiple selectors as arguments', () => {
      const dynSJS = new DynSJS('body', '.container');
      expect(dynSJS._selectors).toEqual(['body', '.container']);
    });

    it('should initialize instance variables', () => {
      const dynSJS = new DynSJS('body');
      expect(dynSJS._properties).toEqual({});
      expect(dynSJS._children).toEqual([]);
      expect(dynSJS._mediaQueries).toEqual([]);
      expect(dynSJS._conditionFn).toBeNull();
      expect(dynSJS._selectorStack).toEqual([]);
      expect(dynSJS._propertyStack).toEqual([]);
      expect(dynSJS._pseudoClasses).toEqual([]);
      expect(dynSJS._rules).toEqual([]);
      expect(dynSJS.whenStyles).toEqual({});
      expect(dynSJS.otherwiseStyles).toEqual({});
      expect(dynSJS._generatedRules).toEqual([]);
      expect(dynSJS._ruleStack).toEqual([]);
      expect(dynSJS._cssRules).toEqual([]);
      expect(dynSJS.currentStyles).toEqual(dynSJS.whenStyles);
    });
  });

  describe('_isValidSelector', () => {
    it('should return true for valid selectors', () => {
      expect(DynSJS._isValidSelector('body')).toBe(true);
      expect(DynSJS._isValidSelector('.container')).toBe(true);
      expect(DynSJS._isValidSelector('#header')).toBe(true);
    });

    it('should return false for invalid selectors', () => {
      expect(DynSJS._isValidSelector('')).toBe(false);
      expect(DynSJS._isValidSelector(null)).toBe(false);
      expect(DynSJS._isValidSelector(undefined)).toBe(false);
      expect(DynSJS._isValidSelector(123)).toBe(false);
      expect(DynSJS._isValidSelector({})).toBe(false);
      expect(DynSJS._isValidSelector([])).toBe(false);
    });
  });

  describe('_isValidProperty', () => {
    it('should return true for valid properties', () => {
      expect(DynSJS._isValidProperty('color', 'red')).toBe(true);
      expect(DynSJS._isValidProperty('background-color', 'rgba(255, 0, 0, 0.5)')).toBe(true);
      expect(DynSJS._isValidProperty('font-size', '16px')).toBe(true);
      expect(DynSJS._isValidProperty('width', { value: '100%', important: true })).toBe(true);
    });

    it('should return false for invalid properties', () => {
      expect(DynSJS._isValidProperty('', 'red')).toBe(false);
      expect(DynSJS._isValidProperty(null, 'red')).toBe(false);
      expect(DynSJS._isValidProperty(undefined, 'red')).toBe(false);
      expect(DynSJS._isValidProperty(123, 'red')).toBe(false);
      expect(DynSJS._isValidProperty({}, 'red')).toBe(false);
      expect(DynSJS._isValidProperty([], 'red')).toBe(false);
      expect(DynSJS._isValidProperty('color', [])).toBe(false);
      expect(DynSJS._isValidProperty('color', { value: 'red', important: [] })).toBe(false);
    });
  });

  describe('camelToKebab', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(DynSJS.camelToKebab('backgroundColor')).toBe('background-color');
      expect(DynSJS.camelToKebab('fontSize')).toBe('font-size');
      expect(DynSJS.camelToKebab('textAlign')).toBe('text-align');
    });
  });

  describe('addPrefixes', () => {
    it('should add browser prefixes to properties', () => {
      const properties = { width: '100%', display: 'flex' };
      const prefixedProperties = DynSJS.addPrefixes(properties);
      expect(prefixedProperties).toEqual({
        width: '100%',
        display: 'flex',
        webkitWidth: '100%',
        webkitDisplay: 'flex',
        mozWidth: '100%',
        mozDisplay: 'flex',
        msWidth: '100%',
        msDisplay: 'flex',
        oWidth: '100%',
        oDisplay: 'flex'
      });
    });
  });

  describe('set', () => {
    it('should add valid properties to _properties', () => {
      const dynSJS = new DynSJS('body');
      dynSJS.set({ backgroundColor: 'red', fontSize: '16px' });
      expect(dynSJS._properties).toEqual({ backgroundColor: 'red', fontSize: '16px' });
    });

    it('should throw an error for invalid properties', () => {
      const dynSJS = new DynSJS('body');
      expect(() => dynSJS.set({ '': 'red' })).toThrowError('La propriété ou la valeur : red est invalide.');
      expect(() => dynSJS.set({ color: [] })).toThrowError('La propriété ou la valeur color: [] est invalide.');
    });

    it('should not add properties if _isOtherwiseActive is true', () => {
      const dynSJS = new DynSJS('body');
      dynSJS._isOtherwiseActive = true;
      dynSJS.set({ backgroundColor: 'red' });
      expect(dynSJS._properties).toEqual({});
    });
  });
});