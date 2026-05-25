import { menuitem } from "./menuitem.js";
export class bebida extends menuitem{
    #alcohol

    constructor(id,nombre,precio,alcohol){
        super(id,nombre,precio);
        this.#alcohol=alcohol
    }

    getAlcohol(){
        return this.#alcohol;
    }


    render(){
        if(this.#alcohol){
            return `<div>${super.render()}<p>🔞</p></div>`;
        }else{
            return super.render();
        }
    }
}