export class book {
    #title
    #author
    #price

    constructor(title,author,price){
        this.#title=title
        this.#author=author
        this.#price=price
    }

    render(){
        return `
            <div>
                <h3>${this.#title}</h3>
                <p>Autor: ${this.#author}</p>
                <p>Precio: ${this.#price}€</p>
            </div>
        `;
    }

}