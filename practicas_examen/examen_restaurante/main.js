import { getmenu, pagar } from "./api.js";
import { menuitem } from "./menuitem.js";
import { comida } from "./comida.js";
import { bebida } from "./bebida.js";

const cargar = document.getElementById("btn-load");
const carta = document.getElementById("menu-grid");
const asignar = document.getElementById("btn-table");
const mesaasig = document.getElementById("table-display");

document.addEventListener("DOMContentLoaded", () => {
  recordarmesa();
});

//cargar menu
cargar.addEventListener("click", async () => {
  const menu = await getmenu();

  menu.forEach((elemento) => {
    if (elemento.type === "Drink") {
      const b = new bebida(
        elemento.id,
        elemento.name,
        elemento.price,
        elemento.isAlcoholic,
      );
      carta.innerHTML += b.render();
    } else {
      const c = new comida(
        elemento.id,
        elemento.name,
        elemento.price,
        elemento.isVegetarian,
      );
      carta.innerHTML += c.render();
    }
  });
});

//asignar mesa
asignar.addEventListener("click", () => {
  const mesa = prompt("Dime tu numero de mesa:");
  document.cookie = `mesa=${mesa};expires=7200; path=/`;
  mesaasig.textContent = mesa;
});

function recordarmesa() {
  const cookies = document.cookie.split("; ");
  const userCookie = cookies.find((row) => row.startsWith("mesa="));

  if (userCookie) {
    const mesa = userCookie.split("=")[1];
    mesaasig.textContent = mesa;
  }
}
