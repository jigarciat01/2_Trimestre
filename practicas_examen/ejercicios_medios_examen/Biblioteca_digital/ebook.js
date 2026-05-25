import { book } from './book.js';
export class ebook extends book{
    #format

    constructor(title,author,price,format){
        super(title, author, price);
        this.#format = format
    }


    render() {  
        return `<div class="ebook-wrapper">${super.render()} <p>${this.#format}</p></div>`;
    }
}