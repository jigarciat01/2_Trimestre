class Jugador {
    static CATEGORIAS = ['geografia', 'entretenimiento', 'historia', 'arte_literatura', 'ciencia', 'deportes', 'videojuegos'];
    static PUNTOS_POR_ACIERTO = 10;
    static RACHA_PARA_QUESITO = 2;
    static PROBABILIDAD_QUESITO = 0.75;

    constructor(id, nombre) {
        this.id = id;
        this.nombre = nombre;
        this.puntos = 0;
        this.socketId = null;
        this.quesitosObj = Object.fromEntries(Jugador.CATEGORIAS.map(c => [c, false]));
        this.rachas = Object.fromEntries(Jugador.CATEGORIAS.map(c => [c, 0]));
    }

    // Se llama cuando el jugador acierta una pregunta de una categoría
    procesarAcierto(categoriaId) {
        this.puntos += Jugador.PUNTOS_POR_ACIERTO;
        this.rachas[categoriaId]++;

        if (this.rachas[categoriaId] >= Jugador.RACHA_PARA_QUESITO && !this.quesitosObj[categoriaId]) {

            if (Math.random() < Jugador.PROBABILIDAD_QUESITO) {
                this.quesitosObj[categoriaId] = true;
                return { quesitoConseguido: true, intentoQuesitoFallido: false };
            }
            // Si la probabilidad falló, tiene que volver a acertar para tirar los dados otra vez
            return { quesitoConseguido: false, intentoQuesitoFallido: true };
        }
        return { quesitoConseguido: false, intentoQuesitoFallido: false };
    }

    procesarFallo(categoriaId) {
        this.rachas[categoriaId] = 0;
    }

    haGanado() {
        return Object.values(this.quesitosObj).every(Boolean);
    }
}

module.exports = Jugador;
