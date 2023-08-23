export class MediaQueryManager {
    constructor(stylesheet) {
        if (typeof window === 'undefined') {
            throw new Error('MediaQueryManager ne peut être utilisé que dans un environnement de navigateur.');
        }

        this.stylesheet = stylesheet;
        this.queries = new Map();
    }

    /**
     * Ajoute une requête
     * @param name
     * @param queryString
     * @param callback
     */
    addQuery(name, queryString, callback) {
        this.queries.set(name, { queryString, callback });
    }

    /**
     * Applique les requêtes
     * @return void
     */
    applyQueries() {
        this.queries.forEach((data, name) => {
            const query = window.matchMedia(data.queryString);
            query.addEventListener("change", () => this._evaluateQuery(name));
            this._evaluateQuery(name);
        });
    }

    /**
     * Évalue une requête
     * @param name
     * @private
     */
    _evaluateQuery(name) {
        const data = this.queries.get(name);
        if (window.matchMedia(data.queryString).matches) {
            data.callback(this.stylesheet);
            // Ici, vous pourriez ajouter un appel pour recompiler ou mettre à jour les styles.
            // Exemple : this.stylesheet.update();
        }
    }
}

