import { animal } from "./animal.js";

export class dog extends animal{
    #breed

    constructor(id,name,age,breed){
        super(id,name,age);
        this.#breed=breed;
    }

    getbreed(){
        return this.#breed;
    }

    render(){
        return `${super.render()} raza: ${this.#breed} 🐶<br><br>`
    }
}