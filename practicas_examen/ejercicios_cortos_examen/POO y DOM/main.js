import { counter } from "./counter.js";

const btn= document.getElementById('btn-inc');
const texto= document.getElementById('display');

const valor= new counter();

btn.addEventListener('click', () => {
    valor.add();
    texto.textContent = valor.getvalue();
});