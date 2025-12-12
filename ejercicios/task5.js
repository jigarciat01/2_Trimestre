// --- 1. REFERENCIAS A ELEMENTOS ---
const palabras = document.querySelectorAll(".palabra");
const zonasDeSoltar = document.querySelectorAll(".dropzone"); // Categorías + Origen
const btnValidar = document.getElementById("btn-validar");

// --- 2. ASIGNACIÓN DE EVENTOS (LISTENERS) ---

// A) Eventos para las palabras arrastrables
palabras.forEach((palabra) => {
  palabra.addEventListener("dragstart", drag);
});

// B) Eventos para las zonas donde se suelta (Categorías y Origen)
zonasDeSoltar.forEach((zona) => {
  zona.addEventListener("dragover", allowDrop);
  zona.addEventListener("drop", drop);
});

// C) Evento para el botón
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

  // currentTarget es el div donde soltamos (la zona)
  ev.currentTarget.appendChild(draggedElement);

  // Limpiamos colores si el usuario mueve la ficha
  draggedElement.classList.remove("correcto", "incorrecto");
}

function validar() {
  const palabras = document.querySelectorAll(".palabra");
  let aciertos = 0;
  let errores = 0;

  palabras.forEach((elemento) => {
    const padreId = elemento.parentElement.id;
    const categoriaCorrecta = elemento.getAttribute("data-categoria");

    // Si está en el origen, no cuenta ni bien ni mal (o puedes contarlo como error si quieres)
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
