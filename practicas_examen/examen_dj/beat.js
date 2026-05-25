import { pad } from "./Pad.js";

export class beat extends pad{
    #name

    constructor(id,key,color,name){
        super(id,key,color);
        this.#name=name;
    }

    render(){
        return `${super.render()} <div class="name-hint">🥁 ${this.#name}</div>`;
    }
}