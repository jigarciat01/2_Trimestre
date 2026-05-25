import { menuitem } from "./menuitem.js";
export class comida extends menuitem{
    #vegetariano

    constructor(id,nombre,precio,vegetariano){
        super(id,nombre,precio);
        this.#vegetariano=vegetariano
    }

    getVegetariano(){
        return this.#vegetariano;
    }

    render(){
        if(this.#vegetariano){
            return `<div>${super.render()}<p>Vegetariano</p></div>`;
        }else{
            return super.render();
        }
    }
}