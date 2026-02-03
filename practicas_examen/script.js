import { Film } from './film.js';
const films = [
    new Film("Inception", 8.8, 2010, "A thief who steals corporate secrets through the use of dream-sharing technology."),
    new Film("The Matrix", 8.7, 1999, "A computer hacker learns about the true nature of his reality and his role in the war against its controllers."),
    new Film("Interstellar", 8.6, 2014, "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.")
];

const filmsContainer = document.getElementById('films-container');
films.forEach(film => {
    filmsContainer.innerHTML += film.displayFilm();
});