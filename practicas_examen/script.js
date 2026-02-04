import { Film } from './film.js';

const filmsContainer = document.getElementById('films-container');


const films = [
    new Film("Inception", 8.8, 2010, "A thief who steals corporate secrets through the use of dream-sharing technology."),
    new Film("The Matrix", 8.7, 1999, "A computer hacker learns about the true nature of his reality and his role in the war against its controllers."),
    new Film("Interstellar", 8.6, 2014, "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.")
];
films.push(new Film("The Dark Knight", 8.0, 2008, "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham."));



document.addEventListener('DOMContentLoaded', () => {
    films.forEach(film => {
        filmsContainer.innerHTML += film.displayFilm();
    });
});

const cookieContainer = document.getElementById('cookie-container');

// Función para actualizar la cookie con la película de mayor rating
function updateTopFilmCookie() {
    if (films.length === 0) {
        cookieContainer.innerHTML = 'No hay películas';
        return;
    }
    const topFilm = films.reduce((prev, current) => (prev.rating > current.rating) ? prev : current);
    document.cookie = `topFilm=${topFilm.name}; max-age=3600; path=/`;
    cookieContainer.innerHTML = `<strong>Top Film Cookie:</strong> ${topFilm.name}`;
}

// Actualizar cookie al cargar
updateTopFilmCookie();

//crea una barra de busqueda que filtre las peliculas por nombre de forma dinamica con key up event
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.toLowerCase();
    filmsContainer.innerHTML = '';
    films.filter(film => film.name.toLowerCase().includes(searchTerm))
        .forEach(film => {
            filmsContainer.innerHTML += film.displayFilm();
        });
});

// Formulario para añadir nuevas películas
const addFilmForm = document.getElementById('add-film-form');
const errorContainer = document.getElementById('error-container');

addFilmForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errorContainer.innerHTML = '';
    
    const name = document.getElementById('film-name').value;
    const rating = parseFloat(document.getElementById('film-rating').value);
    const year = parseInt(document.getElementById('film-year').value);
    const description = document.getElementById('film-description').value;
    
    try {
        const newFilm = new Film(name, rating, year, description);
        films.push(newFilm);
        filmsContainer.innerHTML += newFilm.displayFilm();
        updateTopFilmCookie(); // Actualizar la cookie
        addFilmForm.reset();
    } catch (error) {
        errorContainer.innerHTML = `Error: ${error.message}`;
    }
});

