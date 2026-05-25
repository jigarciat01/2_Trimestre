import { animal } from "./animal.js";

export class cat extends animal{
    #lives

    constructor(id,name,age,lives){
        super(id,name,age);
        this.#lives=lives;
    }

    getlives(){
        return this.#lives;
    }

    render(){
        return `${super.render()} vidas: ${this.#lives} 🐱<br><br>`
    }
}