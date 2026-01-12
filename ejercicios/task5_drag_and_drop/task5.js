import { allowDrop, drag, drop } from './task5_dragDrop.js';

export function validar() {
  const palabras = document.querySelectorAll(".palabra");
  const mensajeDiv = document.getElementById("resultado");

  let aciertos = 0;
  let errores = 0;

  palabras.forEach((elemento) => {
    const padreId = elemento.parentElement.id;
    const categoriaCorrecta = elemento.getAttribute("data-categoria");

    if (padreId === "origen") return;

    if (padreId === categoriaCorrecta) {
      elemento.classList.add("correcto");
      elemento.classList.remove("incorrecto");
      aciertos++;
    } else {
      elemento.classList.add("incorrecto");
      elemento.classList.remove("correcto");
      errores++;
    }
  });

  if (mensajeDiv) {
    if (aciertos === 6) {
      mensajeDiv.style.color = "green";
      mensajeDiv.innerText = "¡Felicidades! Todas las palabras están bien clasificadas.";
    } else {
      mensajeDiv.style.color = "red";
      mensajeDiv.innerText = `Tienes ${aciertos} aciertos y ${errores} errores.`;
    }
  } else {
    console.warn("Falta el <div id='resultado'> en tu HTML.");
  }
}

document.addEventListener('DOMContentLoaded', () => {

  const palabras = document.querySelectorAll('.palabra');
  palabras.forEach(palabra => {
    palabra.addEventListener('dragstart', drag);
  });

  const zonasDeSoltar = document.querySelectorAll('.dropzone');
  zonasDeSoltar.forEach(zona => {
    zona.addEventListener('dragover', allowDrop);
    zona.addEventListener('drop', drop);
  });

  const btnValidar = document.getElementById('btn-validar');
  if (btnValidar) {
    btnValidar.addEventListener('click', validar);
  }
});