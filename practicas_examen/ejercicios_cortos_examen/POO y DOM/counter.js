export class counter{
    #count=0;


    add(){
        this.#count++;
    }

    getvalue() {
        return this.#count;
    }

    setvalue(count) {
        this.#count=count;
    }
}