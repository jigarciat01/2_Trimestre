// Exportamos las funciones para que 'main.js' las pueda usar
export function allowDrop(ev) {
  ev.preventDefault();
}

export function drag(ev) {
  // Guardamos el ID del elemento que arrastramos
  ev.dataTransfer.setData("text", ev.target.id);
}

export function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const draggedElement = document.getElementById(data);

  // Movemos el elemento
  ev.currentTarget.appendChild(draggedElement);

  // Limpiamos colores por si acaso
  draggedElement.classList.remove("correcto", "incorrecto");
}
