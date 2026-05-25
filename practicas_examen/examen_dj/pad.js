export class pad {
  #id;
  #key;
  #color;

  constructor(id, key, color) {
    this.#id = id;
    this.#key = key;
    this.#color = color;
  }

  getkey() {
    return this.#key;
  }

  getcolor(){
    return this.#color;
  }

  render() {
    return `
            <span class="key-hint">${this.#key.toUpperCase()}</span>
        `;
  }
}
