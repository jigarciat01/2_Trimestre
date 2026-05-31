const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;
const bancoPreguntas = require('./quesitos.json');
const Jugador = require('./Jugador');

const gameState = { jugadores: [], turnoActualIndex: 0 };

app.use(express.json());
app.use(express.static(__dirname));

// --- Endpoint REST: obtener pregunta aleatoria de una categoría ---
app.get('/pregunta/:categoria', (req, res) => {
    const lista = bancoPreguntas[req.params.categoria.toLowerCase()];
    if (!lista) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(lista[Math.floor(Math.random() * lista.length)]);
});

// --- Endpoint REST: guardar puntuación en ranking ---
let rankingGlobal = [];
// Responde a peticiones POST (cuando un jugador gana y guarda su puntuación)
app.post('/puntuacion', (req, res) => {
    rankingGlobal.push(req.body);
    // Ordena el ranking de mayor a menor puntuación automáticamente
    rankingGlobal.sort((a, b) => b.puntos - a.puntos);
    res.json({ mensaje: "Ranking actualizado", tabla: rankingGlobal });
});

// --- WebSocket ---
const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });

const getPublicState = () => ({
    jugadores: gameState.jugadores,
    turnoActualIndex: gameState.turnoActualIndex,
    jugadorTurnoActual: gameState.jugadores[gameState.turnoActualIndex] || null
});

const broadcast = (msg) => {
    const payload = JSON.stringify(msg);
    wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(payload));
};

wss.on('connection', (ws) => {
    ws.id = 'socket_' + Math.random().toString(36).substring(2, 9);
    ws.send(JSON.stringify({ type: 'askName' }));

    ws.on('message', (raw) => {
        let msg;
        try { msg = JSON.parse(raw); } catch { return; }

        const jugadorTurno = gameState.jugadores[gameState.turnoActualIndex];
        const esSuTurno = jugadorTurno?.socketId === ws.id;

        switch (msg.type) {
            case 'join': {
                // Se busca si el jugador ya existe (por si se ha desconectado y reconectado)
                let jug = gameState.jugadores.find(j => j.id === msg.id);
                if (!jug) {

                    jug = new Jugador(msg.id, msg.nombre || "Jugador");
                    gameState.jugadores.push(jug);
                }
                jug.socketId = ws.id; // Enlazamos su conexión actual
                broadcast({ type: 'gameState', state: getPublicState() });
                break;
            }
            case 'girarRuleta':
                broadcast({ ...msg, type: 'ruletaGirando' });
                break;

            case 'preguntaObtenida':
                if (esSuTurno) broadcast({ ...msg, type: 'mostrarPregunta' });
                break;

            case 'respuestaValidada':
                if (!esSuTurno) break;

                let resultado = { quesitoConseguido: false, intentoQuesitoFallido: false };

                if (msg.correcta) {
                    // Suma puntos y maneja la probabilidad de ganar un quesito
                    resultado = jugadorTurno.procesarAcierto(msg.categoriaId);
                } else {
                    jugadorTurno.procesarFallo(msg.categoriaId);
                    // Avanzar turno al siguiente jugador solo si falla la pregunta
                    gameState.turnoActualIndex = (gameState.turnoActualIndex + 1) % gameState.jugadores.length;
                }

                // Comunicamos a todos el resultado (acierto/fallo, racha, etc)
                broadcast({
                    type: 'resultadoRespuesta',
                    nombre: jugadorTurno.nombre,
                    jugadorId: jugadorTurno.id,
                    correcta: msg.correcta,
                    timeout: msg.timeout,
                    ...resultado,
                    racha: jugadorTurno.rachas[msg.categoriaId],
                    categoriaId: msg.categoriaId
                });
                // Actualizamos marcadores y turnos
                broadcast({ type: 'gameState', state: getPublicState() });
                break;
        }
    });

    ws.on('close', () => {
        gameState.jugadores = gameState.jugadores.filter(j => j.socketId !== ws.id);
        if (gameState.turnoActualIndex >= gameState.jugadores.length) gameState.turnoActualIndex = 0;
        broadcast({ type: 'gameState', state: getPublicState() });
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
});