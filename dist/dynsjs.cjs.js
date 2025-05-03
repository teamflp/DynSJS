'use strict';

// --- src/Color.js ---

/**
 * Represents an immutable color with RGBA & HSLA values.
 * @class Color
 * @property {number} r - Red channel value (0-255)
 * @property {number} g - Green channel value (0-255)
 * @property {number} b - Blue channel value (0-255)
 * @property {number} a - Alpha channel value (0-1)
 */
class Color {
  // Marqueur pour identifier facilement les instances
  __isDynSJSColor = true;
  constructor(r, g, b) {
    let a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    this.r = Math.max(0, Math.min(255, Math.round(r)));
    this.g = Math.max(0, Math.min(255, Math.round(g)));
    this.b = Math.max(0, Math.min(255, Math.round(b)));
    const parsedA = parseFloat(a ?? 1);
    this.a = Math.max(0, Math.min(1, isNaN(parsedA) ? 1 : parsedA));
    Object.freeze(this);
  }
  static fromHex(hex) {
    if (typeof hex !== 'string' || !hex.startsWith('#')) {
      throw new Error('Invalid hex: Must start with #.');
    }
    const hexVal = hex.slice(1);
    if (!/^[0-9a-fA-F]+$/.test(hexVal)) {
      throw new Error('Invalid hex: Contains non-hex characters.');
    }
    let r,
      g,
      b,
      a = 1;
    if (hexVal.length === 3 || hexVal.length === 4) {
      r = parseInt(hexVal[0] + hexVal[0], 16);
      g = parseInt(hexVal[1] + hexVal[1], 16);
      b = parseInt(hexVal[2] + hexVal[2], 16);
      if (hexVal.length === 4) {
        a = parseInt(hexVal[3] + hexVal[3], 16) / 255;
      }
    } else if (hexVal.length === 6 || hexVal.length === 8) {
      r = parseInt(hexVal.slice(0, 2), 16);
      g = parseInt(hexVal.slice(2, 4), 16);
      b = parseInt(hexVal.slice(4, 6), 16);
      if (hexVal.length === 8) {
        a = parseInt(hexVal.slice(6, 8), 16) / 255;
      }
    } else {
      throw new Error('Invalid hex: Length should be 3, 4, 6, or 8 after #.');
    }
    if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
      throw new Error('Invalid hex: Parsing resulted in NaN.');
    }
    return new Color(r, g, b, a);
  }
  static fromRgb(rgb) {
    if (typeof rgb !== 'string') throw new Error("Invalid rgb format: Input must be a string.");
    const match = rgb.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
    if (!match) {
      throw new Error('Invalid rgb format. Expected "rgb(R, G, B)" with digits only.');
    }
    return new Color(Number(match[1]), Number(match[2]), Number(match[3]));
  }
  static fromRgba(rgba) {
    if (typeof rgba !== 'string') throw new Error("Invalid rgba format: Input must be a string.");
    const match = rgba.match(/rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\.?\d+)\s*\)/);
    if (!match) {
      throw new Error('Invalid rgba format. Expected "rgba(R, G, B, A)" with digits only for RGB.');
    }
    return new Color(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]));
  }
  static fromHsl(h, s, l) {
    let a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    s = s <= 1 ? s : s / 100;
    l = l <= 1 ? l : l / 100;
    h = (h % 360 + 360) % 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    if (s === 0) {
      const gray = Math.round(l * 255);
      return new Color(gray, gray, gray, a);
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hNorm = h / 360;
    const hueToRgb = t => {
      t = (t + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const r = Math.round(hueToRgb(hNorm + 1 / 3) * 255);
    const g = Math.round(hueToRgb(hNorm) * 255);
    const b = Math.round(hueToRgb(hNorm - 1 / 3) * 255);
    return new Color(r, g, b, a);
  }
  toHsl() {
    const r = this.r / 255,
      g = this.g / 255,
      b = this.b / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: s,
      l: l,
      a: this.a
    };
  }
  operate(operation, operand) {
    let {
      r,
      g,
      b
    } = this;
    switch (operation) {
      case '+':
        r += operand;
        g += operand;
        b += operand;
        break;
      case '-':
        r -= operand;
        g -= operand;
        b -= operand;
        break;
      case '*':
        r *= operand;
        g *= operand;
        b *= operand;
        break;
      case '/':
        if (operand === 0) throw new Error("Division by zero is not allowed.");
        r /= operand;
        g /= operand;
        b /= operand;
        break;
      case '%':
        if (operand === 0) throw new Error("Modulo by zero is not allowed.");
        r %= operand;
        g %= operand;
        b %= operand;
        break;
      default:
        console.warn(`Invalid color operation: ${operation}`);
        return this;
    }
    return new Color(r, g, b, this.a);
  }
  toRGBA() {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
  toString() {
    const alphaRounded = Math.round(this.a * 100) / 100;
    return alphaRounded === 1 ? `rgb(${this.r},${this.g},${this.b})` : `rgba(${this.r},${this.g},${this.b},${alphaRounded})`;
  }
  toHslString() {
    const {
      h,
      s,
      l,
      a
    } = this.toHsl();
    const sPercent = Math.round(s * 100);
    const lPercent = Math.round(l * 100);
    const alphaRounded = Math.round(a * 100) / 100;
    return alphaRounded === 1 ? `hsl(${h}, ${sPercent}%, ${lPercent}%)` : `hsla(${h}, ${sPercent}%, ${lPercent}%, ${alphaRounded})`;
  }
}

// --- src/utils.js ---

// Helper interne
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/** Deep merge utility */
function deepMerge(target, source) {
  const output = {
    ...target
  };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target) || !isObject(target[key])) {
          output[key] = deepMerge({}, source[key]);
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  } else if (isObject(source)) {
    return deepMerge({}, source);
  }
  return output;
}

// --- Helpers Theming ---
const THEME_LOOKUP_MARKER = '__isThemeLookupRequest__';

/** Theme value lookup marker */
function theme(key) {
  let defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
  if (typeof key !== 'string' || !key.trim()) {
    console.warn(`DynSJS: Invalid theme key: "${key}".`);
  }
  return {
    [THEME_LOOKUP_MARKER]: true,
    key: key || '',
    defaultValue: defaultValue
  };
}

/** @internal Checks for theme marker */
function isThemeLookup(value) {
  return typeof value === 'object' && value !== null && value[THEME_LOOKUP_MARKER] === true;
}

// --- src/DynSJS.js ---


/**
 * Represents a CSS rule or a block.
 */
class DynSJS {
  _theme = {};
  _ssr = false;
  _selectors = [];
  _properties = {};
  _children = [];
  _mediaQueries = [];
  _conditionFn = null;
  _parent = null;

  /** @internal */
  constructor() {
    let selectors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    let theme = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let ssr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    const selectorList = Array.isArray(selectors) ? selectors : [selectors].filter(Boolean);
    if (selectorList.length > 0 && !selectorList.every(DynSJS._isValidSelector)) {
      throw new Error("Invalid non-empty selectors.");
    }
    this._selectors = selectorList;
    this._properties = {};
    this._children = [];
    this._mediaQueries = [];
    this._conditionFn = null;
    this._parent = parent;
    this._theme = parent ? parent._theme : theme;
    this._ssr = parent ? parent._ssr : ssr;
  }
  /** @private */
  static _isValidSelector(sel) {
    return typeof sel === 'string' && sel.trim().length > 0;
  }
  /** @private */
  static _isValidPropertyInput(key, value) {
    return typeof key === 'string' && (typeof value === 'string' || typeof value === 'number' || typeof value === 'function' || value?.__isDynSJSColor === true || isThemeLookup(value));
  } // Utilise le marqueur Color
  /** Convertit camelCase en kebab-case */
  static camelToKebab(string) {
    let r = string.replace(/([a-z\d])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
    if (/^(webkit|moz|ms|o)-/.test(r)) {
      r = '-' + r;
    }
    return r;
  }
  /** @internal */
  _getThemeValue(key) {
    let defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
    let visited = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();
    try {
      if (typeof key !== 'string' || !key.trim()) return defaultValue;
      const keys = key.split('.');
      let value = this._theme;
      if (visited.has(value)) {
        console.warn(`Circular theme ref: ${key}`);
        return defaultValue;
      }
      visited.add(value);
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          const nextValue = value[k];
          if (typeof nextValue === 'object' && nextValue !== null) {
            if (visited.has(nextValue)) {
              console.warn(`Circular theme ref at ${k}: ${key}`);
              return defaultValue;
            }
            visited.add(nextValue);
          }
          value = nextValue;
        } else {
          return defaultValue;
        }
      }
      return value;
    } catch (e) {
      console.error(`Theme access error: ${key}`, e);
      return defaultValue;
    }
  }
  /** Sets CSS properties */
  set(props) {
    for (let key in props) {
      const value = props[key];
      if (!DynSJS._isValidPropertyInput(key, value)) {
        console.warn(`Invalid prop input: ${key}`);
        continue;
      }
      this._properties[key] = value;
    }
    return this;
  }
  /** Adds a nested rule */
  nested() {
    for (var _len = arguments.length, selectors = new Array(_len), _key = 0; _key < _len; _key++) {
      selectors[_key] = arguments[_key];
    }
    const rule = new DynSJS(selectors, this._theme, this._ssr, this);
    this._children.push(rule);
    return rule;
  }
  /** Adds a media query rule */
  media(query) {
    if (typeof query !== 'string' || !query.trim()) {
      throw new Error("Invalid media query.");
    }
    const rule = new DynSJS([], this._theme, this._ssr, this);
    this._mediaQueries.push({
      query,
      rule
    });
    return rule;
  }
  /** Sets a condition */
  when(conditionFn) {
    if (typeof conditionFn !== 'function') {
      throw new Error("`conditionFn` must be a function.");
    }
    this._conditionFn = conditionFn;
    return this;
  }
  /** @internal */
  _isConditionMet() {
    if (this._parent && !this._parent._isConditionMet()) return false;
    try {
      return this._conditionFn ? this._conditionFn(this._theme, this._ssr) : true;
    } catch (e) {
      console.error("Error in 'when' condition:", e);
      return false;
    }
  }
  /** @private */
  _generateSelectors() {
    let parentSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    const p = parentSelector.trim();
    const c = this._selectors;
    if (c.length === 0) return p;
    if (!p) return c.map(s => s.trim().replace(/^&\s*/, '').trim()).filter(Boolean).join(', ') || '';
    return c.map(s => {
      const t = s.trim();
      return p.split(',').map(ps => t.includes('&') ? t.replace(/&/g, ps.trim()) : `${ps.trim()} ${t}`).join(', ');
    }).join(', ');
  }
  /** @private */
  _generateProperties() {
    return Object.entries(this._properties).map(_ref => {
      let [key, rawValue] = _ref;
      let v = rawValue;
      if (isThemeLookup(v)) {
        v = this._getThemeValue(v.key, v.defaultValue);
      }
      if (typeof v === 'function') {
        try {
          v = v(this._theme, this);
        } catch (e) {
          console.error(`Func prop error [${key}]:`, e);
          return null;
        }
      }
      if (v?.__isDynSJSColor === true) {
        v = v.toString();
      }
      if (typeof v === 'number') {
        v = String(v);
      }
      if (typeof v !== 'string') {
        if (isThemeLookup(rawValue) && v === undefined) {
          console.warn(`Theme key "${rawValue.key}" not found [${key}]`);
        } else if (typeof rawValue === 'function' && v === undefined) {
          console.warn(`Func prop no return [${key}]`);
        } else {
          console.warn(`Non-string value [${key}]: ${typeof v}`);
        }
        return null;
      }
      if (v.trim() === '') return null;
      return `${DynSJS.camelToKebab(key)}: ${v};`;
    }).filter(item => item !== null).join(' ');
  }
  /** Helper to set a color property */
  setColor(color) {
    let property = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'color';
    if (color?.__isDynSJSColor !== true) {
      throw new Error("First arg must be a Color instance.");
    }
    this._properties[property] = color;
    return this;
  }
  /** @internal */
  toCSS() {
    let parentSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    if (!this._isConditionMet()) return null;
    const sel = this._generateSelectors(parentSelector);
    const props = this._generateProperties();
    let ruleCSS = "";
    if (props && sel) {
      ruleCSS = `${sel} { ${props} }`;
    } else if (!props && sel && (this._children.length > 0 || this._mediaQueries.length > 0)) ; else if (!sel && props) {
      console.warn("Rule props without selector:", props);
    } else if (!sel && !this._children.length && !this._mediaQueries.length) {
      return null;
    }
    const childrenCSS = this._children.map(c => c.toCSS(sel)).filter(Boolean).map(o => (o.ruleCSS || '') + (o.childrenCSS ? '\n' + o.childrenCSS : '')).filter(Boolean).join('\n');
    const mediaCSS = this._mediaQueries.map(_ref2 => {
      let {
        query,
        rule
      } = _ref2;
      const o = rule.toCSS(sel);
      if (o && (o.ruleCSS || o.childrenCSS || o.mediaCSS?.length)) {
        let c = (o.ruleCSS || '') + (o.childrenCSS ? '\n' + o.childrenCSS : '');
        if (o.mediaCSS?.length) console.warn("Nested media queries detected.");
        return {
          query,
          css: c.trim()
        };
      }
      return null;
    }).filter(Boolean);
    if (!ruleCSS && !childrenCSS && !mediaCSS.length) return null;
    return {
      ruleCSS: ruleCSS.trim(),
      childrenCSS: childrenCSS.trim(),
      mediaCSS: mediaCSS
    };
  }
}

// --- src/StyleSheet.js ---

// Thème par défaut
const defaultTheme = {};

// Gestion des balises Style
const styleTags = new Map();

/**
 * Manages DynSJS rules, compiles them, handles injection, and includes basic caching.
 * Environment-agnostic. Theme must be passed in constructor.
 */
class StyleSheet {
  _rules = [];
  _keyframes = {};
  _theme = {}; // Thème final (défaut + utilisateur)
  _ssr = false;
  _styleTagId = 'dynsjs-styles';
  _warnedAboutSSR = false;
  _dirty = true;
  _cachedCSS = null;
  constructor() {
    let userTheme = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this._theme = deepMerge(defaultTheme, userTheme || {});
    this._ssr = options.ssr || false;
    this._styleTagId = options.styleTagId || `dynsjs-styles-${Math.random().toString(36).substring(7)}`;
    this._dirty = true;
    this._cachedCSS = null;
  }
  setTheme(newTheme) {
    this._theme = deepMerge(defaultTheme, newTheme || {}); // Remplace thème actuel
    this._updateRuleThemeRecursive(this._rules, this._theme);
    this._dirty = true;
    this._cachedCSS = null;
    this.clearInjected();
  }

  /** @private */
  _updateRuleThemeRecursive(rules, newTheme) {
    rules.forEach(rule => {
      rule._theme = newTheme;
      if (rule._children.length > 0) {
        this._updateRuleThemeRecursive(rule._children, newTheme);
      }
      if (rule._mediaQueries.length > 0) {
        rule._mediaQueries.forEach(mq => this._updateRuleThemeRecursive([mq.rule], newTheme));
      }
    });
  }
  rule() {
    this._dirty = true;
    this._cachedCSS = null;
    for (var _len = arguments.length, selectors = new Array(_len), _key = 0; _key < _len; _key++) {
      selectors[_key] = arguments[_key];
    }
    const rule = new DynSJS(selectors, this._theme, this._ssr);
    this._rules.push(rule);
    return rule;
  }
  keyframes(name, definition) {
    if (typeof name !== 'string' || !name.trim() || typeof definition !== 'object' || definition === null) {
      throw new Error("Invalid keyframes args.");
    }
    this._dirty = true;
    this._cachedCSS = null;
    this._keyframes[name] = definition;
    return this;
  }
  compile() {
    if (!this._dirty && this._cachedCSS !== null) {
      return this._cachedCSS;
    }
    let allRuleCSS = [],
      allChildrenCSS = [],
      keyframesCSS = "",
      mediaOutput = "";
    const mediaQueryMap = new Map();

    // --- CORRECTION : Logique de traitement des règles restaurée ---
    // 1. Compiler les règles principales et leurs enfants
    this._rules.forEach(rule => {
      const output = rule.toCSS(); // Appelle toCSS() sur chaque règle DynSJS
      if (output) {
        // Si la règle n'est pas filtrée par 'when'
        if (output.ruleCSS) allRuleCSS.push(output.ruleCSS);
        if (output.childrenCSS) allChildrenCSS.push(output.childrenCSS);
        // Collecter les media queries pour regroupement
        if (output.mediaCSS && output.mediaCSS.length > 0) {
          output.mediaCSS.forEach(_ref => {
            let {
              query,
              css
            } = _ref;
            if (!mediaQueryMap.has(query)) mediaQueryMap.set(query, []);
            const trimmedCss = css.trim();
            if (trimmedCss) mediaQueryMap.get(query).push(trimmedCss);
          });
        }
      }
    });
    // --- FIN CORRECTION ---

    // 2. Compiler les keyframes (logique correcte avec marqueur)
    keyframesCSS = Object.entries(this._keyframes).map(_ref2 => {
      let [name, definition] = _ref2;
      const steps = Object.entries(definition).map(_ref3 => {
        let [step, props] = _ref3;
        const propString = Object.entries(props).map(_ref4 => {
          let [key, value] = _ref4;
          let finalValue = value;
          if (typeof value === 'function') {
            try {
              finalValue = value(this._theme);
            } catch (e) {
              console.error(`Keyframe func error [${name},${step},${key}]:`, e);
              return null;
            }
          }
          if (finalValue?.__isDynSJSColor === true) {
            finalValue = finalValue.toString();
          } else if (typeof finalValue === 'number') {
            finalValue = String(finalValue);
          }
          if (typeof finalValue !== 'string') {
            console.warn(`Invalid keyframe prop value [${name},${step},${key}]: type ${typeof finalValue}`);
            return null;
          }
          if (finalValue.trim() === '') return null;
          return `${DynSJS.camelToKebab(key)}: ${finalValue};`;
        }).filter(item => item !== null).join(' ');
        return propString ? `${step} { ${propString} }` : null;
      }).filter(Boolean).join('\n  ');
      return steps ? `@keyframes ${name} {\n  ${steps}\n}` : null;
    }).filter(Boolean).join('\n\n');

    // 3. Combiner
    // Inclut bien les résultats de la boucle des règles
    let coreCSS = [keyframesCSS, ...allRuleCSS, ...allChildrenCSS].filter(Boolean).join('\n');

    // --- CORRECTION : Logique de formatage media query restaurée ---
    // 4. Formater et ajouter les Media Queries regroupées
    mediaOutput = "";
    mediaQueryMap.forEach((cssContents, query) => {
      if (cssContents.length > 0) {
        const uniqueContent = [...new Set(cssContents)].join('\n');
        const indentedContent = uniqueContent.split('\n').map(line => `  ${line}`).join('\n');
        mediaOutput += `\n\n@media ${query} {\n${indentedContent}\n}`;
      }
    });
    // --- FIN CORRECTION ---

    let compiledCSS = (coreCSS + mediaOutput).trim();
    compiledCSS = compiledCSS ? compiledCSS + '\n' : "";

    // 5. Mettre en Cache
    this._cachedCSS = compiledCSS;
    this._dirty = false;
    return this._cachedCSS;
  }

  /** Injects compiled CSS into the DOM. */
  inject() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (this._ssr || typeof document === 'undefined') {
      if (!this._ssr && !this._warnedAboutSSR) {
        console.warn("DynSJS inject: Non-browser env.");
        this._warnedAboutSSR = true;
      }
      return;
    }
    if (options.force) {
      this._dirty = true;
      this._cachedCSS = null;
    }
    const css = this.compile(); // Appel synchrone
    const styleElement = this._ensureStyleTagExists();
    if (styleElement.textContent !== css) {
      styleElement.textContent = css || "";
    }
  }

  /** @private */
  _ensureStyleTagExists() {
    let e = styleTags.get(this._styleTagId);
    if (!e || !document.getElementById(this._styleTagId)) {
      e = document.createElement('style');
      e.id = this._styleTagId;
      e.type = 'text/css';
      document.head.appendChild(e);
      styleTags.set(this._styleTagId, e);
    }
    return e;
  }

  /** Clears injected styles and invalidates cache. */
  clearInjected() {
    const e = styleTags.get(this._styleTagId);
    if (e) {
      if (e.parentNode) {
        e.parentNode.removeChild(e);
      }
      styleTags.delete(this._styleTagId);
    }
    this._dirty = true;
    this._cachedCSS = null; // Invalide cache
  }
}
// --- Fin de src/StyleSheet.js ---

exports.Color = Color;
exports.DynSJS = DynSJS;
exports.StyleSheet = StyleSheet;
exports.deepMerge = deepMerge;
exports.isThemeLookup = isThemeLookup;
exports.theme = theme;
//# sourceMappingURL=dynsjs.cjs.js.map
