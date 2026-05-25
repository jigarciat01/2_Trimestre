import { book } from "./book.js";
import { ebook } from "./ebook.js";

const texto=document.getElementById('library-grid');
const filtro=document.getElementById('filter');

document.addEventListener('DOMContentLoaded',()=>{ pintar(libros)});

const libros=[
    new book("El Quijote", "Miguel de Cervantes", 15),
    new book("Cien años de soledad", "Gabriel García Márquez", 20),
    new ebook("El Señor de los Anillos", "J.R.R. Tolkien", 25, "PDF"),
    new ebook("Harry Potter y la piedra filosofal", "J.K. Rowling", 10, "EPUB")
]

function pintar(biblioteca){
    texto.innerHTML = '';
    biblioteca.forEach(item => {
        texto.innerHTML += item.render();
    });
}

filtro.addEventListener('change', (e) =>{
   if (e.target.value === 'ebook') {
        const soloEbooks = libros.filter(b => b instanceof ebook);
        pintar(soloEbooks);
    } else {
        pintar(libros);
    }
})