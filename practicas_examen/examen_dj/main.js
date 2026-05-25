import { beat } from "./beat.js";
import { efecto } from "./efecto.js";

const contenedor = document.getElementById("pad-container");
const btnCargar = document.getElementById("btn-load");
const Dj = document.getElementById("dj-display");

//cookies
document.addEventListener("DOMContentLoaded", () => {
    const cookie = document.cookie.split("; ").find(row => row.startsWith("djname="));
    if (cookie) {
        const nombre = cookie.split("=")[1];
        Dj.textContent = `DJ: ${nombre}`;
    } else {
        const nombre = prompt("¿Cómo te llamas, DJ?");
        if (nombre) {
            document.cookie = `djname=${nombre}; max-age=3600; path=/`;
            Dj.textContent = `DJ: ${nombre}`;
        }
    }
});

//cargar y pintar
btnCargar.addEventListener("click", async () => {
    try {
        const res = await fetch("http://localhost:3000/pads");
        const datos = await res.json();

        contenedor.innerHTML = "";

        datos.forEach(item => {
            let padObj;
            if (item.type === "Beat") {
                padObj = new beat(item.id, item.key, item.color, item.name);
            } else {
                padObj = new efecto(item.id, item.key, item.color, item.name, item.duration);
            }

            const div = document.createElement("div");
            

            div.classList.add("pad");
            div.style.backgroundColor = padObj.getcolor(); 
            div.innerHTML = padObj.render(); 

            div.setAttribute("data-key", padObj.getkey()); 


            contenedor.appendChild(div);
        });

    } catch (e) {
        console.error("Error cargando sonidos", e);
    }
});

// evento raton
contenedor.addEventListener("pointerdown", (e) => {
    const padDiv = e.target.closest(".pad");

    if (padDiv) {
        activarPad(padDiv);
    }
});

//evento teclado
document.addEventListener("keydown", (e) => {
    const teclaPulsada = e.key.toLowerCase();

    const padDiv = document.querySelector(`div[data-key="${teclaPulsada}"]`);

    if (padDiv) {
        activarPad(padDiv);
    }
});


function activarPad(elemento) {
    elemento.classList.add("active");
    
    setTimeout(() => {
        elemento.classList.remove("active");
    }, 150);


    console.log(`Reproduciendo tecla: ${elemento.dataset.key.toUpperCase()}`);
}