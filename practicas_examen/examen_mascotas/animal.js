export class animal{
    #id 
    #name
    #age

    constructor(id,name,age){
        this.#id=id;
        this.#name=name;
        this.#age=age;
    }

    getid(){
        return this.#id;
    }

    getname(){
        return this.#name;
    }

    getage(){
        return this.#age;
    }

    render(){
        return `Nombre: ${this.#name}, Edad: ${this.#age}`
    }
}