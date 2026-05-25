import { zapatilla } from "./zapatilla.js";
import { getproductos, comprar } from "./api.js";

const btncargar = document.getElementById("btn-load");
const contenedor = document.getElementById("grid");
const filtro = document.getElementById("filter-brand");
let zapatos = [];

btncargar.addEventListener("click", async () => {
  const datos = await getproductos();
  contenedor.innerHTML='';
  zapatos = [];
  datos.forEach((item) => {
    const z = new zapatilla(
      item.id,
      item.marca,
      item.modelo,
      item.precio,
      item.stock,
      item.img,
    );
    zapatos.push(z);
    contenedor.innerHTML += z.render();
  });
});

filtro.addEventListener("change", () => {
  contenedor.innerHTML = "";
  if (filtro.value === "all") {
    zapatos.forEach((zapato) => {
      contenedor.innerHTML += zapato.render();
    });
  } else if (filtro.value === "Nike") {
    const filtrado = zapatos.filter(
      (zap) => zap.getmarca().toLowerCase() === "nike",
    );
    filtrado.forEach((fil) => {
      contenedor.innerHTML += fil.render();
    });
  } else if (filtro.value === "Adidas") {
    const filtrado = zapatos.filter(
      (zap) => zap.getmarca().toLowerCase() === "adidas",
    );
    filtrado.forEach((fil) => {
      contenedor.innerHTML += fil.render();
    });
  }else{
    const filtrado = zapatos.filter(
      (zap) => zap.getmarca().toLowerCase() === "new balance",
    );
    filtrado.forEach((fil) => {
      contenedor.innerHTML += fil.render();
    });
  }
});


// --- INTERACCIÓN DE COMPRA (DELEGACIÓN DE EVENTOS) ---
contenedor.addEventListener("click", async (e) => {

    if (e.target.classList.contains("btn-buy")) {
        
        const idProducto = parseInt(e.target.dataset.id);

        const respuesta = await comprar(idProducto);

        if (respuesta.ok) {
            const zapatilla = zapatos.find(z => z.getId() === idProducto);

            
            zapatilla.actualizar(respuesta.nuevoStock);

            
            const marcaActual = filtro.value;
            
            if (marcaActual === "all") {
                pintarGrid(zapatos);
            } else {
                const listaFiltrada = zapatos.filter(z => z.getMarca() === marcaActual);
                pintarGrid(listaFiltrada);
            }

        } else {
            alert("Error: " + respuesta.msg);
        }
    }
});