function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? {
            done: true
          } : {
            done: false,
            value: r[n++]
          };
        },
        e: function (r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = true,
    u = false;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return a = r.done, r;
    },
    e: function (r) {
      u = true, o = r;
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    }
  };
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = true,
      o = false;
    try {
      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = true, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (String )(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

// --- src/Color.js ---

/**
 * Represents an immutable color with RGBA & HSLA values.
 * @class Color
 * @property {number} r - Red channel value (0-255)
 * @property {number} g - Green channel value (0-255)
 * @property {number} b - Blue channel value (0-255)
 * @property {number} a - Alpha channel value (0-1)
 * @property {number} h - Hue value (0-360) - Calculated on demand
 * @property {number} s - Saturation value (0-1) - Calculated on demand
 * @property {number} l - Lightness value (0-1) - Calculated on demand
 */
var Color$1 = /*#__PURE__*/function () {
  /**
   * Creates an immutable Color instance.
   * RGB values are clamped between 0-255, Alpha between 0-1.
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @param {number} [a=1] - Alpha value (0-1). Defaults to 1.
   */
  function Color(r, g, b) {
    var a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
    _classCallCheck(this, Color);
    // Clamp values directly in constructor to ensure valid state
    this.r = Math.max(0, Math.min(255, Math.round(r)));
    this.g = Math.max(0, Math.min(255, Math.round(g)));
    this.b = Math.max(0, Math.min(255, Math.round(b)));
    // Ensure alpha is float and clamped
    this.a = Math.max(0, Math.min(1, typeof a === 'number' ? a : parseFloat(a || 1)));

    // Make instance immutable
    Object.freeze(this);
  }

  /**
   * Creates a new Color instance from a hexadecimal string.
   * Supports #RGB, #RRGGBB, #RGBA, #RRGGBBAA formats.
   * @param {string} hex - The hexadecimal color string (e.g., "#FF0000", "#F00", "#FF000080").
   * @returns {Color} A new Color instance.
   * @throws {Error} If the hex string format is invalid.
   */
  return _createClass(Color, [{
    key: "toHsl",
    value:
    /**
     * Calculates and returns the HSL representation.
     * @returns {{h: number, s: number, l: number, a: number}}
     */
    function toHsl() {
      var r = this.r / 255;
      var g = this.g / 255;
      var b = this.b / 255;
      var a = this.a;
      var max = Math.max(r, g, b);
      var min = Math.min(r, g, b);
      var h = 0,
        s = 0,
        l = (max + min) / 2;
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
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
        // Typically represented 0-1
        l: l,
        // Typically represented 0-1
        a: a
      };
    }

    /**
     * Performs a simple arithmetic operation on the R, G, B channels.
     * Note: This is a basic operation; consider dedicated methods like lighten/darken for more advanced color manipulation.
     * Returns a new Color instance.
     * @param {'+'|'-'|'*'|'/'|'%'} operation - The operation to perform.
     * @param {number} operand - The value to use in the operation.
     * @returns {Color} A new Color instance with the modified values (clamped).
     * @throws {Error} If dividing by zero.
     */
  }, {
    key: "operate",
    value: function operate(operation, operand) {
      var r = this.r,
        g = this.g,
        b = this.b; // Use current values

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
          console.warn("Invalid color operation: ".concat(operation));
          return this;
        // Return original on invalid operation
      }
      // Return a new, clamped instance
      return new Color(r, g, b, this.a);
    }

    /**
     * Returns the CSS rgba() string representation.
     * e.g., "rgba(255,0,100,0.8)"
     * @returns {string}
     */
  }, {
    key: "toRGBA",
    value: function toRGBA() {
      // Use clamped values directly from properties
      return "rgba(".concat(this.r, ",").concat(this.g, ",").concat(this.b, ",").concat(this.a, ")");
    }

    /**
     * Returns a CSS string representation of the color.
     * Outputs rgb() if alpha is 1, otherwise rgba().
     * @returns {string}
     */
  }, {
    key: "toString",
    value: function toString() {
      if (this.a === 1) {
        return "rgb(".concat(this.r, ",").concat(this.g, ",").concat(this.b, ")");
      } else {
        // Round alpha to avoid excessive decimal places in CSS if needed
        var alphaRounded = Math.round(this.a * 100) / 100;
        return "rgba(".concat(this.r, ",").concat(this.g, ",").concat(this.b, ",").concat(alphaRounded, ")");
      }
    }

    /**
    * Returns the HSL(A) CSS string representation.
    * @returns {string} e.g., "hsl(120, 100%, 50%)" or "hsla(120, 50%, 50%, 0.8)"
    */
  }, {
    key: "toHslString",
    value: function toHslString() {
      var _this$toHsl = this.toHsl(),
        h = _this$toHsl.h,
        s = _this$toHsl.s,
        l = _this$toHsl.l,
        a = _this$toHsl.a;
      var sPercent = Math.round(s * 100);
      var lPercent = Math.round(l * 100);
      if (a === 1) {
        return "hsl(".concat(h, ", ").concat(sPercent, "%, ").concat(lPercent, "%)");
      } else {
        // Round alpha to avoid excessive decimal places
        var alphaRounded = Math.round(a * 100) / 100;
        return "hsla(".concat(h, ", ").concat(sPercent, "%, ").concat(lPercent, "%, ").concat(alphaRounded, ")");
      }
    }
  }], [{
    key: "fromHex",
    value: function fromHex(hex) {
      if (typeof hex !== 'string' || !hex.startsWith('#')) {
        throw new Error('Invalid hex format: Must start with #.');
      }
      var hexVal = hex.slice(1);
      var r,
        g,
        b,
        a = 1;
      if (hexVal.length === 3 || hexVal.length === 4) {
        // #RGB or #RGBA
        r = parseInt(hexVal[0] + hexVal[0], 16);
        g = parseInt(hexVal[1] + hexVal[1], 16);
        b = parseInt(hexVal[2] + hexVal[2], 16);
        if (hexVal.length === 4) {
          a = parseInt(hexVal[3] + hexVal[3], 16) / 255;
        }
      } else if (hexVal.length === 6 || hexVal.length === 8) {
        // #RRGGBB or #RRGGBBAA
        r = parseInt(hexVal.slice(0, 2), 16);
        g = parseInt(hexVal.slice(2, 4), 16);
        b = parseInt(hexVal.slice(4, 6), 16);
        if (hexVal.length === 8) {
          a = parseInt(hexVal.slice(6, 8), 16) / 255;
        }
      } else {
        throw new Error('Invalid hex format: Length should be 3, 4, 6, or 8 after #.');
      }
      if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
        throw new Error('Invalid hex format: Contains non-hex characters.');
      }
      return new Color(r, g, b, a);
    }

    /**
     * Creates a new Color instance from an rgb string.
     * e.g., "rgb(255, 0, 128)"
     * @param {string} rgb - The rgb color string.
     * @returns {Color} A new Color instance.
     * @throws {Error} If the rgb string format is invalid.
     */
  }, {
    key: "fromRgb",
    value: function fromRgb(rgb) {
      if (typeof rgb !== 'string') throw new Error("Invalid rgb format: Input must be a string.");
      var match = rgb.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
      if (!match) {
        throw new Error('Invalid rgb format. Expected "rgb(R, G, B)".');
      }
      return new Color(Number(match[1]), Number(match[2]), Number(match[3]));
    }

    /**
    * Creates a new Color instance from an rgba string.
    * e.g., "rgba(255, 0, 128, 0.5)"
    * @param {string} rgba - The rgba color string.
    * @returns {Color} A new Color instance.
    * @throws {Error} If the rgba string format is invalid.
    */
  }, {
    key: "fromRgba",
    value: function fromRgba(rgba) {
      if (typeof rgba !== 'string') throw new Error("Invalid rgba format: Input must be a string.");
      // Regex allows for integer or float alpha values
      var match = rgba.match(/rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\.?\d+)\s*\)/);
      if (!match) {
        throw new Error('Invalid rgba format. Expected "rgba(R, G, B, A)".');
      }
      return new Color(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]));
    }

    /**
     * Creates a new Color instance from HSL(A) values.
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-1 or 0-100) - Assumed 0-1 if <= 1, else 0-100
     * @param {number} l - Lightness (0-1 or 0-100) - Assumed 0-1 if <= 1, else 0-100
     * @param {number} [a=1] - Alpha (0-1)
     * @returns {Color}
     */
  }, {
    key: "fromHsl",
    value: function fromHsl(h, s, l) {
      var a = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      // Normalize s and l to range 0-1
      s = s <= 1 ? s : s / 100;
      l = l <= 1 ? l : l / 100;
      h = (h % 360 + 360) % 360; // Normalize h to 0-360

      s = Math.max(0, Math.min(1, s));
      l = Math.max(0, Math.min(1, l));
      if (s === 0) {
        var gray = Math.round(l * 255);
        return new Color(gray, gray, gray, a);
      }
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      var hNorm = h / 360;
      var hueToRgb = function hueToRgb(t) {
        t = (t + 1) % 1; // Wrap around
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      var r = Math.round(hueToRgb(hNorm + 1 / 3) * 255);
      var g = Math.round(hueToRgb(hNorm) * 255);
      var b = Math.round(hueToRgb(hNorm - 1 / 3) * 255);
      return new Color(r, g, b, a);
    }
  }]);
}();

/**
 * Represents a CSS rule or a block.
 * Enables chaining. Can be contextualized with theme and SSR info.
 */
var DynSJS = /*#__PURE__*/function () {
  /**
   * Creates an instance of DynSJS representing a CSS rule.
   * Intended for internal use by StyleSheet. Use StyleSheet.rule() instead.
   * @internal
   * @param {string[]} selectors - CSS selectors.
   * @param {object} [theme={}] - Optional theme object.
   * @param {boolean} [ssr=false] - Optional SSR context flag.
   * @param {DynSJS|null} [parent=null] - Parent rule reference.
   */
  function DynSJS() {
    var selectors = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var theme = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var ssr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    _classCallCheck(this, DynSJS);
    // Adding theme and context properties
    _defineProperty(this, "_theme", {});
    _defineProperty(this, "_ssr", false);
    // Flag for SSR context, passed down
    _defineProperty(this, "_selectors", []);
    _defineProperty(this, "_properties", {});
    _defineProperty(this, "_children", []);
    _defineProperty(this, "_mediaQueries", []);
    _defineProperty(this, "_conditionFn", null);
    _defineProperty(this, "_parent", null);
    var selectorList = Array.isArray(selectors) ? selectors : [selectors].filter(Boolean); // Ensure array and filter empty

    if (selectorList.length > 0 && !selectorList.every(DynSJS._isValidSelector)) {
      throw new Error("One or more selectors are invalid. Selectors must be non-empty strings.");
    }
    this._selectors = selectorList;
    this._properties = {};
    this._children = [];
    this._mediaQueries = [];
    this._conditionFn = null;
    this._parent = parent; // Set parent reference

    // Store theme and SSR context
    this._theme = parent ? parent._theme : theme; // Inherit theme from parent
    this._ssr = parent ? parent._ssr : ssr; // Inherit SSR flag
  }

  /**
   * Validates if the given selector is a non-empty string.
   * @param {*} sel - Selector to be validated.
   * @returns {boolean} - True if valid, otherwise false.
   * @private
   */
  return _createClass(DynSJS, [{
    key: "theme",
    value:
    /**
     * Access theme variables using dot notation.
     * @param {string} key - The theme key (e.g., 'colors.primary').
     * @param {*} [defaultValue] - Value to return if key not found.
     * @returns {*} The theme value or default.
     */
    function theme(key) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      // Simple dot notation getter for nested theme object
      try {
        var keys = key.split('.');
        var value = this._theme;
        var _iterator = _createForOfIteratorHelper(keys),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var k = _step.value;
            if (value && _typeof(value) === 'object' && k in value) {
              value = value[k];
            } else {
              return defaultValue;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return value;
      } catch (e) {
        console.error("Error accessing theme key \"".concat(key, "\":"), e);
        return defaultValue;
      }
    }

    /**
     * Sets one or more CSS properties. Values can be strings, numbers, Color instances,
     * or functions that receive (theme, context) and return a value.
     * @param {object} props - An object containing CSS properties.
     * @returns {DynSJS} The current instance for chaining.
     */
  }, {
    key: "set",
    value: function set(props) {
      for (var key in props) {
        var value = props[key];
        if (!DynSJS._isValidProperty(key, value)) {
          console.warn("DynSJS: Invalid property key or value type for \"".concat(key, "\". Skipping."));
          continue;
        }
        // Store the raw value (could be string, number, Color, function)
        // Resolution happens in _generateProperties
        this._properties[key] = value;
      }
      return this;
    }

    /**
     * Adds a nested rule. Handles '&' for selector combination.
     * Inherits theme and SSR context.
     * @param {...string} selectors - CSS selectors for the nested rule.
     * @returns {DynSJS} The nested rule instance.
     */
  }, {
    key: "nested",
    value: function nested() {
      for (var _len = arguments.length, selectors = new Array(_len), _key = 0; _key < _len; _key++) {
        selectors[_key] = arguments[_key];
      }
      // Pass theme and context to child
      var rule = new DynSJS(selectors, this._theme, this._ssr, this);
      this._children.push(rule);
      return rule; // Return the new nested rule
    }

    /**
     * Adds a media query rule. Inherits theme and context.
     * @param {string} query - Media query condition.
     * @returns {DynSJS} The media query rule instance.
     */
  }, {
    key: "media",
    value: function media(query) {
      if (typeof query !== 'string' || query.trim().length === 0) {
        throw new Error("Invalid media query string.");
      }
      // Pass theme and context to the rule inside media
      // It keeps the same initial selectors, applied within the media query context
      var rule = new DynSJS(this._selectors, this._theme, this._ssr, this);
      this._mediaQueries.push({
        query: query,
        rule: rule
      });
      return rule; // Return the rule *inside* the media query
    }

    /**
     * Sets a condition function. Function receives theme and SSR context.
     * @param {function(theme: object, ssr: boolean): boolean} conditionFn - Function to evaluate.
     * @returns {DynSJS} The current instance.
     */
  }, {
    key: "when",
    value: function when(conditionFn) {
      if (typeof conditionFn !== 'function') {
        throw new Error("`conditionFn` must be a function.");
      }
      this._conditionFn = conditionFn;
      return this;
    }
  }, {
    key: "_isConditionMet",
    value: function _isConditionMet() {
      // Check parent condition first
      if (this._parent && !this._parent._isConditionMet()) {
        return false;
      }
      // Check own condition, passing context
      try {
        return this._conditionFn ? this._conditionFn(this._theme, this._ssr) : true;
      } catch (e) {
        console.error("Error evaluating DynSJS 'when' condition:", e);
        return false; // Fail safe if condition function throws
      }
    }

    /**
     * Generates selectors, handling '&' replacement.
     * @param {string} [parentSelector=''] - Parent selector string.
     * @returns {string} - Combined selectors string.
     * @private
     */
  }, {
    key: "_generateSelectors",
    value: function _generateSelectors() {
      var parentSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var parentTrimmed = parentSelector.trim();
      var currentSelectors = this._selectors.length > 0 ? this._selectors : ['&']; // Treat empty selector as '&' for context

      if (!parentTrimmed) {
        // For top-level rules or rules without parent context, '&' should likely be ignored or error
        return currentSelectors.map(function (sel) {
          return sel.replace(/&/g, '');
        }).filter(Boolean).join(', ') || '';
      }
      return currentSelectors.map(function (sel) {
        var trimmedSel = sel.trim();
        // Handle '&' selector replacement (more robustly)
        if (trimmedSel.includes('&')) {
          // Split parent selectors if multiple exist (e.g., "h1, h2")
          return parentTrimmed.split(',').map(function (pSel) {
            return trimmedSel.replace(/&/g, pSel.trim());
          }).join(', ');
        }
        // Basic descendant combination (can be made more complex if needed)
        return parentTrimmed.split(',').map(function (pSel) {
          return "".concat(pSel.trim(), " ").concat(trimmedSel);
        }).join(', ');
      }).join(', ');
    }

    /**
     * Generates the properties string, resolving functional values.
     * @returns {string} - CSS properties string.
     * @private
     */
  }, {
    key: "_generateProperties",
    value: function _generateProperties() {
      var _this = this;
      return Object.entries(this._properties).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
        var finalValue;
        // Resolve function-based values
        if (typeof value === 'function') {
          try {
            finalValue = value(_this._theme, _this);
          } catch (e) {
            console.error("Error resolving function value for property \"".concat(key, "\":"), e);
            return null; // Skip property if function fails
          }
        } else {
          finalValue = value;
        }

        // Convert Color instances
        if (finalValue instanceof Color$1) {
          finalValue = finalValue.toString();
        }

        // Convert numbers to string (assuming they are valid CSS numerical values)
        if (typeof finalValue === 'number') {
          finalValue = String(finalValue);
        }

        // Validate resolved value type (should be string now)
        if (typeof finalValue !== 'string') {
          console.warn("DynSJS: Resolved value for property \"".concat(key, "\" is not a string. Skipping."));
          return null;
        }
        var kebabKey = DynSJS.camelToKebab(key);
        return "".concat(kebabKey, ": ").concat(finalValue, ";");
      }).filter(Boolean) // Remove nulls (skipped properties)
      .join(' ');
    }

    /**
     * Helper method to set a color property using a Color instance.
     * @param {Color} color - The Color instance.
     * @param {string} [property='color'] - The CSS property name (camelCase or kebab-case).
     * @returns {DynSJS} The current instance for chaining.
     */
  }, {
    key: "setColor",
    value: function setColor(color) {
      var property = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'color';
      if (!(color instanceof Color$1)) {
        throw new Error("The first argument must be an instance of Color.");
      }
      // Store the Color instance directly, resolution happens in _generateProperties
      this._properties[property] = color;
      return this;
    }

    /**
     * Converts the rule and its children/media queries into a structured object.
     * This object contains the CSS parts for this rule and its descendants.
     * Passes down context (theme, ssr) implicitly via constructor.
     * @param {string} [parentSelector=''] - Parent selector string.
     * @returns {{ruleCSS: string, childrenCSS: string, mediaCSS: Array<{query: string, css: string}>}|null} - Object containing CSS parts, or null if condition not met.
     * @internal
     */
  }, {
    key: "toCSS",
    value: function toCSS() {
      var parentSelector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      if (!this._isConditionMet()) {
        return null; // Rule is skipped
      }
      var combinedSelectors = this._generateSelectors(parentSelector);
      var properties = this._generateProperties(); // Properties might depend on theme

      var ruleCSS = "";
      // Generate rule only if it has properties OR children OR media queries to ensure selector context exists
      if (combinedSelectors && (properties || this._children.length > 0 || this._mediaQueries.length > 0)) {
        if (properties) {
          ruleCSS = "".concat(combinedSelectors, " { ").concat(properties, " }");
        }
        // If no properties, ruleCSS remains empty, but combinedSelectors are passed down
      } else if (!combinedSelectors && properties) {
        console.warn("DynSJS Rule has properties but no selectors:", properties);
      }

      // Generate CSS for nested children, passing down the current combined selector
      var childrenCSSList = this._children.map(function (child) {
        return child.toCSS(combinedSelectors);
      }) // Child already inherits context
      .filter(Boolean);
      var combinedChildrenCSS = childrenCSSList.map(function (childOutput) {
        var css = childOutput.ruleCSS || '';
        css += childOutput.childrenCSS ? '\n' + childOutput.childrenCSS : '';
        // Basic handling: Bubble up media queries from children
        // A more robust system might merge/group them here
        if (childOutput.mediaCSS) ;
        return css.trim();
      }).filter(Boolean).join('\n');

      // Generate CSS for media queries defined at this level
      var mediaCSSList = this._mediaQueries.map(function (_ref3) {
        var _ruleOutput$mediaCSS;
        var query = _ref3.query,
          rule = _ref3.rule;
        // Pass down the *current combined selector* as the parent context for the media rule content
        var ruleOutput = rule.toCSS(combinedSelectors);
        if (ruleOutput && (ruleOutput.ruleCSS || ruleOutput.childrenCSS || ((_ruleOutput$mediaCSS = ruleOutput.mediaCSS) === null || _ruleOutput$mediaCSS === void 0 ? void 0 : _ruleOutput$mediaCSS.length) > 0)) {
          var mediaContent = ruleOutput.ruleCSS || '';
          if (ruleOutput.childrenCSS) mediaContent += '\n' + ruleOutput.childrenCSS;
          // Handle media queries nested inside this media query (basic pass-through)
          if (ruleOutput.mediaCSS && ruleOutput.mediaCSS.length > 0) {
            // These should ideally be processed and merged at the top level
            console.warn("DynSJS: Nested media queries detected. Deep merging not fully implemented in this simple version.");
            // Simple append for now (may create nested @media blocks - often invalid)
            // mediaContent += '\n' + ruleOutput.mediaCSS.map(mq => `@media ${mq.query} { ${mq.css} }`).join('\n');
          }
          return {
            query: query,
            css: mediaContent.trim()
          };
        }
        return null;
      }).filter(Boolean);
      return {
        ruleCSS: ruleCSS.trim(),
        childrenCSS: combinedChildrenCSS.trim(),
        mediaCSS: mediaCSSList // Media queries defined directly on this rule
      };
    }
  }], [{
    key: "_isValidSelector",
    value: function _isValidSelector(sel) {
      return typeof sel === 'string' && sel.trim().length > 0;
    }

    /**
     * Validates if the given key and value are suitable for CSS properties.
     * Allows numbers and functions (which will be resolved).
     * @param {string} key - CSS property name.
     * @param {string|number|Color|Function} value - Value for the CSS property.
     * @returns {boolean} - True if valid, otherwise false.
     * @private
     */
  }, {
    key: "_isValidProperty",
    value: function _isValidProperty(key, value) {
      return typeof key === 'string' && (typeof value === 'string' || typeof value === 'number' || typeof value === 'function' ||
      // Allow functions for lazy/themed values
      value instanceof Color$1);
    }

    /**
     * Converts camelCase strings to kebab-case (e.g., backgroundColor -> background-color).
     * @param {string} string - The string to convert.
     * @returns {string} - The kebab-cased string.
     */
  }, {
    key: "camelToKebab",
    value: function camelToKebab(string) {
      // Handle potential vendor prefixes starting with uppercase correctly
      return string.replace(/([A-Z])/g, function (match) {
        return "-".concat(match.toLowerCase());
      })
      // Correct for first letter if it was uppercase
      .replace(/^-/, '');
    }
  }]);
}();

// Simple cache for injected styles to avoid duplicates
var injectedCache = new Set();
// Use a map to handle multiple style tags if needed (e.g., per StyleSheet instance)
var styleTags = new Map();

/**
 * Manages DynSJS rules, compiles them, and handles injection.
 */
var StyleSheet = /*#__PURE__*/function () {
  // Default ID for the style tag

  /**
   * Creates a StyleSheet instance.
   * @param {object} [theme={}] - Optional theme object.
   * @param {object} [options={}] - Options object.
   * @param {boolean} [options.ssr=false] - Indicate SSR context (disables injection).
   * @param {string} [options.styleTagId='dynsjs-styles'] - ID for the injected style tag.
   */
  function StyleSheet() {
    var theme = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, StyleSheet);
    _defineProperty(this, "_rules", []);
    _defineProperty(this, "_keyframes", {});
    // Dedicated storage for keyframes
    _defineProperty(this, "_theme", {});
    // Theme object for this sheet
    _defineProperty(this, "_ssr", false);
    // SSR context for this sheet
    _defineProperty(this, "_styleTagId", 'dynsjs-styles');
    this._theme = theme || {}; // Ensure theme is an object
    this._ssr = options.ssr || false;
    // Make style tag ID unique per instance if multiple sheets are used?
    this._styleTagId = options.styleTagId || "dynsjs-styles-".concat(Math.random().toString(36).substring(7));
  }

  /**
   * Creates a new top-level CSS rule. Passes theme and context.
   * @param {...string} selectors - CSS selectors.
   * @returns {DynSJS} The new rule instance.
   */
  return _createClass(StyleSheet, [{
    key: "rule",
    value: function rule() {
      for (var _len = arguments.length, selectors = new Array(_len), _key = 0; _key < _len; _key++) {
        selectors[_key] = arguments[_key];
      }
      // Pass theme and context to the rule
      var rule = new DynSJS(selectors, this._theme, this._ssr);
      this._rules.push(rule);
      return rule;
    }

    /**
     * Defines CSS keyframes.
     * @param {string} name - Animation name.
     * @param {object} definition - Keyframe steps (e.g., { '0%': { opacity: 0 }, '100%': { opacity: 1 } }).
     * @returns {StyleSheet} The current instance.
     */
  }, {
    key: "keyframes",
    value: function keyframes(name, definition) {
      if (typeof name !== 'string' || !name.trim() || _typeof(definition) !== 'object' || definition === null) {
        throw new Error("Invalid arguments for keyframes(name, definition). Name must be non-empty string, definition must be object.");
      }
      // Basic validation of definition structure could be added here
      this._keyframes[name] = definition;
      return this;
    }

    /**
     * Compiles all rules and keyframes into a CSS string.
     * @returns {string} The compiled CSS string.
     */
  }, {
    key: "compile",
    value: function compile() {
      var _this = this;
      var allRuleCSS = [];
      var allChildrenCSS = [];
      // Use a Map to collect and merge media query content intelligently
      var mediaQueryMap = new Map(); // Map<query: string, cssContent: string[]>

      // 1. Generate CSS for standard rules and collect media queries
      this._rules.forEach(function (rule) {
        var output = rule.toCSS();
        if (output) {
          if (output.ruleCSS) allRuleCSS.push(output.ruleCSS);
          if (output.childrenCSS) allChildrenCSS.push(output.childrenCSS);
          // Collect media queries into the map
          if (output.mediaCSS && output.mediaCSS.length > 0) {
            output.mediaCSS.forEach(function (_ref) {
              var query = _ref.query,
                css = _ref.css;
              if (!mediaQueryMap.has(query)) {
                mediaQueryMap.set(query, []);
              }
              var trimmedCss = css.trim();
              if (trimmedCss) mediaQueryMap.get(query).push(trimmedCss);
            });
          }
        }
      });

      // 2. Generate CSS for keyframes
      var keyframesCSS = Object.entries(this._keyframes).map(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
          name = _ref3[0],
          definition = _ref3[1];
        var steps = Object.entries(definition).map(function (_ref4) {
          var _ref5 = _slicedToArray(_ref4, 2),
            step = _ref5[0],
            props = _ref5[1];
          // Resolve properties defined as functions (e.g., using theme)
          var propString = Object.entries(props).map(function (_ref6) {
            var _ref7 = _slicedToArray(_ref6, 2),
              key = _ref7[0],
              value = _ref7[1];
            var finalValue = value;
            if (typeof value === 'function') {
              try {
                finalValue = value(_this._theme, null); // Pass theme, null for context? Or skip functions here? Assume static for now.
              } catch (e) {
                console.error("Error resolving function value in keyframe \"".concat(name, "\" step \"").concat(step, "\" for property \"").concat(key, "\":"), e);
                return null;
              }
            }
            if (finalValue instanceof Color) finalValue = finalValue.toString();
            if (typeof finalValue === 'number') finalValue = String(finalValue);
            if (typeof finalValue !== 'string') return null; // Skip if not resolvable to string

            return "".concat(DynSJS.camelToKebab(key), ": ").concat(finalValue, ";");
          }).filter(Boolean).join(' ');
          return "".concat(step, " { ").concat(propString, " }");
        }).join('\n  ');
        return "@keyframes ".concat(name, " {\n  ").concat(steps, "\n}");
      }).join('\n\n');

      // 3. Combine and Format Core CSS
      // Filter empty strings before joining
      var coreCSS = [keyframesCSS].concat(allRuleCSS, allChildrenCSS).filter(Boolean).join('\n');

      // 4. Format and Append Media Queries
      var mediaOutput = "";
      mediaQueryMap.forEach(function (cssContents, query) {
        if (cssContents.length > 0) {
          // Join unique CSS content lines, indented
          var uniqueContent = _toConsumableArray(new Set(cssContents)).join('\n'); // Avoid duplicate rules if possible
          var indentedContent = uniqueContent.split('\n').map(function (line) {
            return "  ".concat(line);
          }).join('\n');
          mediaOutput += "\n\n@media ".concat(query, " {\n").concat(indentedContent, "\n}");
        }
      });
      var compiledCSS = coreCSS + mediaOutput;
      return compiledCSS ? compiledCSS.trim() + '\n' : "";
    }

    /**
     * Compiles the CSS and injects it into a <style> tag in the document head.
     * Only runs in a browser environment (checks for `document`). Avoids duplicate injections for the *same CSS content*.
     * @param {object} [options={}] - Options object.
     * @param {boolean} [options.force=false] - Force reinjection even if content seems identical.
     */
  }, {
    key: "inject",
    value: function inject() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // Don't inject in SSR context or if document is not available
      if (this._ssr || typeof document === 'undefined') {
        if (!this._ssr && !this._warnedAboutSSR) {
          console.warn("DynSJS: `inject()` called in non-browser environment. Skipping injection.");
          this._warnedAboutSSR = true; // Warn only once per instance
        }
        return;
      }
      var css = this.compile();
      // Use a hash or the full CSS as cache key. Full CSS is simpler.
      var cacheKey = css;

      // Check global cache unless forced
      if (!options.force && injectedCache.has(cacheKey)) {
        // Ensure the style tag for *this instance* exists if content is cached globally
        this._ensureStyleTagExists();
        return;
      }
      var styleElement = this._ensureStyleTagExists();

      // Update content using textContent for performance
      // This handles adding/removing/updating styles efficiently
      if (styleElement.textContent !== css) {
        styleElement.textContent = css;
      }

      // Update global cache
      // Consider limiting cache size if memory becomes an issue
      injectedCache.add(cacheKey);
    }

    /**
     * Ensures the style tag for this instance exists in the head.
     * @returns {HTMLStyleElement} The style tag element.
     * @private
     */
  }, {
    key: "_ensureStyleTagExists",
    value: function _ensureStyleTagExists() {
      var styleElement = styleTags.get(this._styleTagId);
      if (!styleElement || !document.getElementById(this._styleTagId)) {
        styleElement = document.createElement('style');
        styleElement.id = this._styleTagId;
        styleElement.type = 'text/css';
        // Add nonce support if needed for CSP? styleElement.setAttribute('nonce', '...');
        document.head.appendChild(styleElement);
        styleTags.set(this._styleTagId, styleElement);
      }
      return styleElement;
    }

    /**
    * Clears the injected styles associated *with this StyleSheet instance* and its cache entry.
    * Useful for hot reloading or dynamic theme changes where content needs full replacement.
    */
  }, {
    key: "clearInjected",
    value: function clearInjected() {
      var styleElement = styleTags.get(this._styleTagId);
      if (styleElement) {
        // Find corresponding entry in global cache to remove (may need better key management)
        // Simple approach: iterate cache, but inefficient.
        // Better: Store cacheKey on styleElement or instance? For now, just clear tag content.
        if (styleElement.textContent) {
          injectedCache["delete"](styleElement.textContent); // Attempt removal from global cache
        }
        styleElement.textContent = ''; // Clear content instead of removing tag to avoid layout shifts? Or remove?
        // Optional: Remove the tag itself
        if (styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
        styleTags["delete"](this._styleTagId);
      }
      // Note: This doesn't clear the global cache completely, only attempts to remove this sheet's last known content.
      // A full `injectedCache.clear()` might be needed for complete global reset.
    }
  }]);
}();

export { Color$1 as Color, DynSJS, StyleSheet };
//# sourceMappingURL=dynsjs.esm.js.map
