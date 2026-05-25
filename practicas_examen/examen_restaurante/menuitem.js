export class menuitem{
    #id 
    #nombre
    #precio

    constructor(id,nombre,precio){
        this.#id=id
        this.#nombre=nombre
        this.#precio=precio
    }

    getId(){
        return this.#id;
    }

    getNombre(){
        return this.#nombre;
    }

    getPrecio(){
        return this.#precio;
    }

    render(){
        return `<div> nombre: ${this.#nombre}, precio:${this.#precio}</div>`;
    }
}