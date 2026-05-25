import { pad } from "./Pad.js";

export class efecto extends pad {
    #name;
    #duration;

    constructor(id, key, color, name, duration) {
        super(id, key, color);
        this.#name = name;
        this.#duration = duration;
    }

    render() {
        return `
            ${super.render()} 
            <div class="name-hint">⚡ ${this.#name} (${this.#duration}ms)</div>
        `;
    }
}