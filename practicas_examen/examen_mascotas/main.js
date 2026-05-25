import { getpets, adoptpet } from "./api.js";
import { cat } from "./cat.js";
import { dog } from "./dog.js";

const adoptante = document.getElementById("btn-login");
const msg = document.getElementById("welcome-msg");
const ver = document.getElementById("btn-load");
const lista = document.getElementById("pet-grid");
const filtro = document.getElementById("filter-type");
let inventario =[];

document.addEventListener("DOMContentLoaded", () => {
  recordarnombre();
});

//login y cookies
adoptante.addEventListener("click", () => {
  const nombre = prompt("Cual es tu nombre:");

  document.cookie = `username=${nombre}; expires=3600; path=/`;
  msg.textContent = nombre;
});

function recordarnombre() {
  const cookies = document.cookie.split("; ");
  const usercookie = cookies.find(row => row.startsWith('username='));
    console.log(usercookie);
  const nombre = usercookie.split('=')[1];
  msg.textContent = nombre;
}

//descarga datos y mostrar

ver.addEventListener("click", async () => {
  const datos = await getpets();
  lista.innerHTML = "";
  inventario = [];
  datos.forEach((mascota) => {
    if (mascota.type === "Dog") {
      const d = new dog(mascota.id, mascota.name, mascota.age, mascota.breed);
      lista.innerHTML += d.render();
      inventario.push(d);
    } else {
      const c = new cat(mascota.id, mascota.name, mascota.age, mascota.lives);
      lista.innerHTML += c.render();
      inventario.push(c);
    }
  });
});

filtro.addEventListener("change", async () => {
  lista.innerHTML='';
  if (filtro.value === "all") {
    inventario.forEach((mascota) => {
      lista.innerHTML += mascota.render();
    });
  } else if (filtro.value === "Dog") {
    inventario.forEach((mascota) => {
      if (mascota instanceof dog) {
        lista.innerHTML += mascota.render();
      }
    });
  } else {
    inventario.forEach((mascota) => {
      if (mascota instanceof cat) {
        lista.innerHTML += mascota.render();
      }
    });
  }
});
