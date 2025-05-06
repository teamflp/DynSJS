// --- src/DynSJS.ts --- (Version Finale Corrigée)

import { Color } from "./Color.js";
import { isThemeLookup } from "./utils.js";
import type {
  DynSJSTheme,
  StyleProperties,
  ConditionFunction,
  CSSEntry,
  SetFunction,
  StyleValue,
} from "./types";

/**
 * Represents a CSS rule or a block. Enables chaining.
 */
export class DynSJS {
  // Propriétés privées
  private _theme: DynSJSTheme = {};
  private _ssr: boolean = false;
  private _selectors: string[] = [];
  // _properties peut contenir soit l'objet de styles, soit la fonction qui le retourne
  private _properties: StyleProperties | SetFunction = {};
  private _children: DynSJS[] = [];
  private _mediaQueries: Array<{ query: string; rule: DynSJS }> = [];
  private _conditionFn: ConditionFunction | null = null;
  _parent: DynSJS | null = null; // Garder accessible pour _isConditionMet

  /** @internal */
  constructor(
    selectors: string | string[] = [],
    theme: DynSJSTheme = {},
    ssr: boolean = false,
    parent: DynSJS | null = null
  ) {
    const selectorList = Array.isArray(selectors)
      ? selectors
      : [selectors].filter(Boolean);
    if (
      selectorList.length > 0 &&
      !selectorList.every(DynSJS._isValidSelector)
    ) {
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

  /**
   * Définit une variable CSS (propriété personnalisée) sur la règle actuelle.
   * Ajoute automatiquement '--' si manquant.
   * @param name Nom de la variable (ex: 'primary-color' ou '--primary-color')
   * @param value Valeur de la variable (peut être string, number, Color, theme(), etc.)
   * @returns {this}
   */
  setVar(name: string, value: StyleValue): this {
    const varName = name.startsWith("--") ? name : `--${name}`;
    this.set({ [varName]: value });
    return this;
  }

  // --- MÉTHODES STATIQUES (Versions finales) ---
  private static _isValidSelector(sel: any): sel is string {
    return typeof sel === "string" && sel.trim().length > 0;
  }

  private static _isValidPropertyInput(key: string, value: any): boolean {
    if (typeof key !== "string") return false;
    // Vérifie si c'est un tableau et si chaque élément est valide
    if (Array.isArray(value)) {
      // Note: On ne vérifie pas récursivement les fonctions/arrays ici pour éviter complexité/boucles infinies dans la validation simple.
      // La résolution dans _generateProperties gérera les types internes.
      return value.every(
        (item) =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "function" ||
          item?.__isDynSJSColor === true ||
          isThemeLookup(item)
      );
    }
    // Vérifie les types primitifs/autorisés
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "function" ||
      value?.__isDynSJSColor === true ||
      isThemeLookup(value)
    );
  }

  // Version finale gérant préfixes et nombres
  static camelToKebab(string: string): string {
    let r = string
      .replace(/([a-z\d])([A-Z])/g, "$1-$2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
      .toLowerCase();
    if (/^(webkit|moz|ms|o)-/.test(r)) {
      r = "-" + r;
    }
    return r;
  }
  // --- FIN MÉTHODES STATIQUES ---

  // --- MÉTHODES PUBLIQUES / INTERNES ---
  /** @internal Gets theme value with cycle detection */
  _getThemeValue(
    key: string,
    defaultValue: any = undefined,
    visited = new Set<object>()
  ): any {
    try {
      // Correction: Vérifier type avant trim
      if (typeof key !== "string" || key.trim() === "") return defaultValue;
      const keys = key.split(".");
      let value = this._theme;
      if (visited.has(value)) {
        console.warn(`Circular theme ref detected: ${key}`);
        return defaultValue;
      }
      visited.add(value);
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          const nextValue = value[k];
          if (typeof nextValue === "object" && nextValue !== null) {
            if (visited.has(nextValue)) {
              console.warn(
                `Circular theme ref at key "${k}" while accessing "${key}".`
              );
              return defaultValue;
            }
            visited.add(nextValue);
          }
          value = nextValue;
        } else {
          return defaultValue;
        } // Chemin non trouvé
      }
      return value; // Valeur finale
    } catch (e) {
      console.error(`Theme access error for key "${key}":`, e);
      return defaultValue;
    }
  }

  /**
   * Sets CSS properties. Stores the object or the function itself.
   * Resolution happens in _generateProperties. Allows merging with object argument.
   */
  // --- MÉTHODE SET FINALE ---
  set(propsOrFn: StyleProperties | SetFunction): this {
    // 1. Si l'argument est une fonction, on la stocke directement (écrase l'existant)
    if (typeof propsOrFn === "function") {
      this._properties = propsOrFn;
    }
    // 2. Si c'est un objet valide
    else if (
      typeof propsOrFn === "object" &&
      propsOrFn !== null &&
      !Array.isArray(propsOrFn)
    ) {
      // Assure que _properties est un objet avant de fusionner/ajouter
      if (typeof this._properties === "function") {
        // Si on avait une fonction, on la remplace par un objet vide avant d'ajouter les nouvelles props
        this._properties = {};
      }
      // Ajoute/Écrase les propriétés fournies dans l'objet _properties actuel
      for (const key in propsOrFn) {
        if (Object.prototype.hasOwnProperty.call(propsOrFn, key)) {
          const value = propsOrFn[key];
          if (!DynSJS._isValidPropertyInput(key, value)) {
            console.warn(
              `DynSJS: Invalid property value type provided for "${key}" in set(). Skipping.`
            );
            continue;
          }
          this._properties[key] = value; // Stocke/Écrase la valeur brute
        }
      }
    }
    // 3. Argument invalide
    else {
      console.warn(
        "DynSJS: Invalid argument passed to set(). Expected an object or a function."
      );
    }
    return this; // Pour chaînage
  }
  // --- FIN MÉTHODE SET ---

  nested(...selectors: string[]): DynSJS {
    const rule = new DynSJS(selectors, this._theme, this._ssr, this);
    this._children.push(rule);
    return rule;
  }
  media(query: string): DynSJS {
    if (typeof query !== "string" || !query.trim()) {
      throw new Error("Invalid media query.");
    }
    const rule = new DynSJS([], this._theme, this._ssr, this);
    this._mediaQueries.push({ query, rule });
    return rule;
  }
  when(conditionFn: ConditionFunction): this {
    if (typeof conditionFn !== "function") {
      throw new Error("`conditionFn` must be a function.");
    }
    this._conditionFn = conditionFn;
    return this;
  }
  /** @internal */ _isConditionMet(): boolean {
    if (this._parent && !this._parent._isConditionMet()) return false;
    try {
      return this._conditionFn
        ? this._conditionFn(this._theme, this._ssr)
        : true;
    } catch (e) {
      console.error("Error in 'when' condition:", e);
      return false;
    }
  }

  /**
   * Generates selectors, handling '&' replacement and context-aware joining.
   * @param {string} [parentSelector=''] - Parent selector string.
   * @returns {string} - Combined selectors string.
   * @private
   */
  /** @private Generates selectors */
  _generateSelectors(parentSelector: string = ""): string {
    const parentSelectors = parentSelector
      .trim()
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const currentSelectors = this._selectors;

    if (currentSelectors.length === 0) {
      return parentSelectors.join(", ");
    }

    if (parentSelectors.length === 0) {
      // Pour les règles top-level, on retire le '&' initial s'il est seul ou au début
      return currentSelectors
        .map((s) => {
          const trimmed = s.trim();
          if (trimmed === "&") return ""; // & seul ne génère rien
          return trimmed.replace(/^&\s*/, "").trim(); // Retire & au début
        })
        .filter(Boolean)
        .join(", ");
    }

    const combined: string[] = [];
    parentSelectors.forEach((pSel) => {
      currentSelectors.forEach((cSel) => {
        const currentTrimmed = cSel.trim();
        if (currentTrimmed.includes("&")) {
          // Remplacement de toutes les occurrences de '&'
          combined.push(currentTrimmed.replace(/&/g, pSel));
        } else {
          // Comportement par défaut : sélecteur descendant (ajoute un espace)
          // Sauf si currentTrimmed commence par un combinateur direct (> + ~)
          // ou est une pseudo-classe/élément ou un sélecteur d'attribut
          // qui devrait être collé.
          // Pour .classe, #id on veut un espace si pas de &
          if (
            currentTrimmed.startsWith(":") ||
            currentTrimmed.startsWith("[")
          ) {
            combined.push(
              `<span class="math-inline">\{pSel\}</span>{currentTrimmed}`
            );
          } else if (
            currentTrimmed.startsWith(">") ||
            currentTrimmed.startsWith("+") ||
            currentTrimmed.startsWith("~")
          ) {
            combined.push(
              `<span class="math-inline">\{pSel\}</span>{currentTrimmed}`
            ); // Le combinateur a déjà l'espace ou n'en veut pas
          } else {
            combined.push(`${pSel} ${currentTrimmed}`); // Cas descendant par défaut
          }
        }
      });
    });

    // Retourne les sélecteurs combinés uniques et triés pour des tests stables
    return [...new Set(combined)].sort().join(", ");
  }

  /** @private Generates property string, handles array/function values */
  // --- MÉTHODE _generateProperties FINALE ---
  _generateProperties(): string {
    let propsToProcess: StyleProperties;

    // 1. Obtenir l'objet de propriétés à traiter (exécuter la fonction si nécessaire)
    if (typeof this._properties === "function") {
      try {
        propsToProcess = this._properties(this._theme, this); // Exécute la fonction stockée
        if (
          typeof propsToProcess !== "object" ||
          propsToProcess === null ||
          Array.isArray(propsToProcess)
        ) {
          console.warn(
            "DynSJS: Function passed to set() did not return a plain object during compile."
          );
          return "";
        }
      } catch (e) {
        console.error(
          "DynSJS: Error executing function passed to set() during compile:",
          e
        );
        return "";
      }
    } else {
      propsToProcess = this._properties; // Utilise l'objet stocké
    }

    // 2. Itérer sur les propriétés finales et résoudre les valeurs
    return Object.entries(propsToProcess)
      .map(([key, rawValue]) => {
        // Fonction interne pour résoudre une valeur (string, number, Color, theme(), function, ou array)
        const resolveItem = (item: any): string | null => {
          let v: any = item;
          // ORDRE DE RÉSOLUTION : Fonction -> Thème -> Color -> Nombre -> String
          if (typeof v === "function") {
            try {
              v = v(this._theme, this);
            } catch (e) {
              console.error(`Func prop value error [${key}]:`, e);
              return null;
            }
          }
          if (isThemeLookup(v)) {
            v = this._getThemeValue(v.key, v.defaultValue);
          }
          if (v?.__isDynSJSColor === true) {
            v = (v as Color).toString();
          } else if (typeof v === "number") {
            v = String(v);
          }
          // Validation finale
          if (typeof v !== "string") {
            console.warn(`Non-string value [${key}]: ${typeof v}`);
            return null;
          }
          if (v.trim() === "") return null; // Ignore chaînes vides
          return v;
        };

        let resolvedValue: string | null = null;
        // Gestion des Tableaux
        if (Array.isArray(rawValue)) {
          resolvedValue = rawValue
            .map(resolveItem)
            .filter((item): item is string => item !== null)
            .join(" ");
          if (resolvedValue.trim() === "") resolvedValue = null;
        }
        // Gestion des valeurs simples
        else {
          resolvedValue = resolveItem(rawValue);
        }

        if (resolvedValue === null) return null; // Skip si valeur finale invalide

        const kebabKey = DynSJS.camelToKebab(key);
        return `${kebabKey}: ${resolvedValue};`;
      })
      .filter((item): item is string => item !== null)
      .join(" "); // Filtre les nulls et joint
  }
  // --- FIN MÉTHODE _generateProperties ---

  /** Helper to set a color property */
  // --- MÉTHODE setColor FINALE ---
  setColor(color: Color, property: string = "color"): this {
    if (color?.__isDynSJSColor !== true) {
      throw new Error("First arg must be a Color instance.");
    }
    // Assigne la propriété, que _properties soit un objet ou une fonction
    // Si _properties est une fonction, elle sera écrasée par un objet ici.
    if (typeof this._properties === "function") {
      this._properties = {};
    }
    this._properties[property] = color; // Assigne la couleur
    return this;
  }
  // --- FIN MÉTHODE setColor ---

  /** @internal Converts rule to CSS parts */
  toCSS(parentSelector: string = ""): CSSEntry | null {
    if (!this._isConditionMet()) return null;
    const sel = this._generateSelectors(parentSelector);
    const props = this._generateProperties();
    let ruleCSS = "";
    if (props && sel) {
      ruleCSS = `${sel} { ${props} }`;
    } else if (
      !props &&
      sel &&
      (this._children.length > 0 || this._mediaQueries.length > 0)
    ) {
      /* Context only */
    } else if (!sel && props) {
      console.warn("Rule props without selector:", props);
    } else if (!sel && !this._children.length && !this._mediaQueries.length) {
      return null;
    }

    const childrenCSS = this._children
      .map((c) => c.toCSS(sel))
      .filter((o): o is CSSEntry => o !== null)
      .map(
        (o) => (o.ruleCSS || "") + (o.childrenCSS ? "\n" + o.childrenCSS : "")
      )
      .filter(Boolean)
      .join("\n");
    const mediaCSS = this._mediaQueries
      .map(({ query, rule }) => {
        const o = rule.toCSS(sel);
        if (o && (o.ruleCSS || o.childrenCSS || o.mediaCSS?.length)) {
          let c =
            (o.ruleCSS || "") + (o.childrenCSS ? "\n" + o.childrenCSS : "");
          if (o.mediaCSS?.length)
            console.warn("Nested media queries detected.");
          return { query, css: c.trim() };
        }
        return null;
      })
      .filter((m): m is { query: string; css: string } => m !== null);

    if (!ruleCSS && !childrenCSS && mediaCSS.length === 0) return null;
    return {
      ruleCSS: ruleCSS.trim(),
      childrenCSS: childrenCSS.trim(),
      mediaCSS: mediaCSS,
    };
  }
}
