import { counter } from "./counter.js";

const btn= document.getElementById('btn-inc');
const texto= document.getElementById('display');

const valor= new counter();

document.addEventListener('DOMContentLoaded',() => {
    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find(row => row.startsWith('number='));

    const numero= userCookie.split('=')[1];

    valor.setvalue(numero);
    texto.textContent = valor.getvalue();
});

btn.addEventListener('click', () => {
    valor.add();
    texto.textContent = valor.getvalue();

    document.cookie =`number=${valor.getvalue()}; max-age=3600 path=/`;
});