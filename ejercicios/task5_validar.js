export function validar() {
  const palabras = document.querySelectorAll(".palabra");
  const mensajeDiv = document.getElementById("resultado"); // ¡Recuerda crear este div en el HTML!

  let aciertos = 0;
  let errores = 0;

  palabras.forEach((elemento) => {
    const padreId = elemento.parentElement.id;
    const categoriaCorrecta = elemento.getAttribute("data-categoria");

    // Si sigue en el origen, lo ignoramos
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

  // Mostramos el mensaje (comprobamos que mensajeDiv exista para no dar error)
  if (mensajeDiv) {
    if (aciertos === 6) {
      mensajeDiv.style.color = "green";
      mensajeDiv.innerText =
        "¡Felicidades! Todas las palabras están bien clasificadas.";
    } else {
      mensajeDiv.style.color = "red";
      mensajeDiv.innerText = `Tienes ${aciertos} aciertos y ${errores} errores.`;
    }
  } else {
    console.warn(
      "Falta el <div id='resultado'> en tu HTML para ver el mensaje."
    );
  }
}
