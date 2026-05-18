export class Film {
    #name;
    #rating;
    #year;
    #description;

    constructor(name, rating, year, description) {
        this.#name = name;
        this.rating = rating; // Usa el setter para validar
        this.#year = year;
        this.#description = description;
    }

    get name() {
        return this.#name;
    }

    set name(name) {
        this.#name = name;
    }

    get rating() {
        return this.#rating;
    }

    set rating(rating) {
        if (rating < 5) {
            throw new Error(`El rating ${rating} es menor que 5. La película no será añadida.`);
        }
        this.#rating = rating;
    }

    get year() {
        return this.#year;
    }

    set year(year) {
        this.#year = year;
    }

    get description() {
        return this.#description;
    }

    set description(description) {
        this.#description = description;
    }

    displayFilm() {
        return `<h2>${this.#name} (${this.#year})</h2>
                <p>Rating: ${this.#rating}</p>
                <p>Description: ${this.#description}</p>`;
    }
}