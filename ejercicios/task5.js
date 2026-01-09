const palabras = document.querySelectorAll(".palabra");
const zonasDeSoltar = document.querySelectorAll(".dropzone");
const btnValidar = document.getElementById("btn-validar");


palabras.forEach((palabra) => {
  palabra.addEventListener("dragstart", drag);
});

zonasDeSoltar.forEach((zona) => {
  zona.addEventListener("dragover", allowDrop);
  zona.addEventListener("drop", drop);
});

btnValidar.addEventListener("click", validar);

// --- 3. FUNCIONES LÓGICAS ---

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const draggedElement = document.getElementById(data);

  ev.currentTarget.appendChild(draggedElement);

  draggedElement.classList.remove("correcto", "incorrecto");
}

function validar() {
  const palabras = document.querySelectorAll(".palabra");
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

  const mensajeDiv = document.getElementById("resultado");
  if (aciertos === 6) {
    mensajeDiv.style.color = "green";
    mensajeDiv.innerText =
      "¡Felicidades! Todas las palabras están bien clasificadas.";
  } else {
    mensajeDiv.style.color = "red";
    mensajeDiv.innerText = `Tienes ${aciertos} aciertos y ${errores} errores. ¡Inténtalo de nuevo!`;
  }
}
