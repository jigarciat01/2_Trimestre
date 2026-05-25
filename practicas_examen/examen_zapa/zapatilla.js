export class zapatilla {
  #id;
  #marca;
  #modelo;
  #precio;
  #stock;
  #img;

  constructor(id, marca, modelo, precio, stock, img) {
    this.#id = id;
    this.#marca = marca;
    this.#modelo = modelo;
    this.#precio = precio;
    this.#stock = stock;
    this.#img = img;
  }

  getmarca(){
    return this.#marca;
  }

  actualizar(n) {
    this.#stock = n;
  }

  render() {

    let texto;

    if ((this.#stock = 0)) {
      texto = `<div class=card>Marca: ${this.#marca} Modelo: ${this.#modelo} 
            Precio: ${this.#precio} Stock: ${this.#stock} ${this.#img} 
            <button class=".btn-buy:disabled">Agotado</button></div>`;
    } else if(this.#stock<=3){
      texto = `<div class=card>Marca: ${this.#marca} Modelo: ${this.#modelo} 
            Precio: ${this.#precio} Stock: ${this.#stock} ${this.#img}
            <span color=red>Ultimas unidades</span> 
            <button class=".btn-buy>Comprar</button></div>`;
    }else{
        texto = `<div class=card>Marca: ${this.#marca} Modelo: ${this.#modelo} 
            Precio: ${this.#precio} Stock: ${this.#stock} ${this.#img} 
            <button class=".btn-buy">Comprar</button></div>`;
    }

    return texto;

  }
}
