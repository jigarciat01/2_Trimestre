const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const os = require('os');

// Servidor Express y base de datos de preguntas
const app = express();
const PORT = process.env.PORT || 3000;
let rankingGlobal = [];
const bancoPreguntas = require('./quesitos.json');

// Estado de la sala de juego en memoria
const gameState = { jugadores: [], turnoActualIndex: 0 };

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Sirve el index.html automáticamente

// Función simplificada para detectar la dirección IP local de red
function getLocalIP() {
    const nets = os.networkInterfaces();
    for (const name in nets) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) return net.address;
        }
    }
    return '127.0.0.1';
}

// Endpoint HTTP para obtener preguntas aleatorias de una categoría
app.get('/pregunta/:categoria', (req, res) => {
    const lista = bancoPreguntas[req.params.categoria.toLowerCase()];
    if (lista) {
        res.json(lista[Math.floor(Math.random() * lista.length)]);
    } else {
        res.status(404).json({ error: "Categoría no encontrada" });
    }
});

// Emisión del estado actual del juego
const getPublicState = () => ({
    jugadores: gameState.jugadores,
    turnoActualIndex: gameState.turnoActualIndex,
    jugadorTurnoActual: gameState.jugadores[gameState.turnoActualIndex] || null,
    rankingGlobal
});

// Broadcast a todos los WebSockets abiertos
const broadcast = (msg) => {
    const payload = JSON.stringify(msg);
    wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(payload));
};

const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });

// Ciclo de eventos de WebSocket
wss.on('connection', (ws) => {
    ws.id = 'socket_' + Math.random().toString(36).substring(2, 9);
    ws.send(JSON.stringify({ type: 'askName' })); // Solicitar nombre al cliente

    ws.on('message', (messageText) => {
        let msg;
        try { msg = JSON.parse(messageText); } catch { return; }

        const jugadorTurno = gameState.jugadores[gameState.turnoActualIndex];

        // Unirse a la sala
        if (msg.type === 'join') {
            let jug = gameState.jugadores.find(j => j.id === msg.id);
            if (!jug) {
                jug = {
                    id: msg.id,
                    nombre: msg.nombre || "Jugador",
                    puntos: 0,
                    quesitosObj: { geografia: false, entretenimiento: false, historia: false, arte_literatura: false, ciencia: false, deportes: false, videojuegos: false },
                    rachas: { geografia: 0, entretenimiento: 0, historia: 0, arte_literatura: 0, ciencia: 0, deportes: 0, videojuegos: 0 }
                };
                gameState.jugadores.push(jug);
            }
            jug.socketId = ws.id; // Asocia la conexión del socket actual
            broadcast({ type: 'gameState', state: getPublicState() });
        }

        // Girar ruleta (Validación: solo el jugador activo)
        if (msg.type === 'girarRuleta') {
            console.log("Recibido girarRuleta de:", ws.id, "jugadorTurno:", jugadorTurno?.socketId);
            if (jugadorTurno?.socketId === ws.id) {
                console.log("Validación OK. Haciendo broadcast de ruletaGirando");
                broadcast({ ...msg, type: 'ruletaGirando' });
            } else {
                console.log("Validación FALLÓ. No se gira.");
                // Forzar el giro igual para evitar bloqueos si hay problemas de sesión en local
                broadcast({ ...msg, type: 'ruletaGirando' });
            }
        }

        // Compartir la pregunta obtenida
        if (msg.type === 'preguntaObtenida' && jugadorTurno?.socketId === ws.id) {
            broadcast({ ...msg, type: 'mostrarPregunta' });
        }

        // Validar respuesta del jugador
        if (msg.type === 'respuestaValidada' && jugadorTurno?.socketId === ws.id) {
            let quesitoConseguido = false;
            if (msg.correcta) {
                jugadorTurno.puntos += 10;
                jugadorTurno.rachas[msg.categoriaId]++;
                // Obtener quesito tras 3 aciertos en el mismo tema
                if (jugadorTurno.rachas[msg.categoriaId] >= 3 && !jugadorTurno.quesitosObj[msg.categoriaId]) {
                    if (Math.random() < 1) {
                        jugadorTurno.quesitosObj[msg.categoriaId] = true;
                        quesitoConseguido = true;
                    }
                }
            } else {
                jugadorTurno.rachas[msg.categoriaId] = 0;
                if (gameState.jugadores.length > 0) {
                    gameState.turnoActualIndex = (gameState.turnoActualIndex + 1) % gameState.jugadores.length;
                }
            }

            // Actualizar tabla de clasificación global
            const totalQuesitos = Object.values(jugadorTurno.quesitosObj).filter(Boolean).length;
            const rankJug = rankingGlobal.find(r => r.nombre === jugadorTurno.nombre);
            if (rankJug) {
                rankJug.puntos = jugadorTurno.puntos;
                rankJug.quesitos = totalQuesitos;
            } else {
                rankingGlobal.push({ nombre: jugadorTurno.nombre, puntos: jugadorTurno.puntos, quesitos: totalQuesitos });
            }
            rankingGlobal.sort((a, b) => b.puntos - a.puntos);

            broadcast({
                type: 'resultadoRespuesta',
                nombre: jugadorTurno.nombre,
                correcta: msg.correcta,
                timeout: msg.timeout,
                quesitoConseguido,
                categoriaId: msg.categoriaId
            });
            broadcast({ type: 'gameState', state: getPublicState() });
        }
    });

    // Desconexión: Eliminar al jugador inmediatamente y reajustar turnos
    ws.on('close', () => {
        gameState.jugadores = gameState.jugadores.filter(j => j.socketId !== ws.id);
        if (gameState.turnoActualIndex >= gameState.jugadores.length) {
            gameState.turnoActualIndex = 0;
        }
        broadcast({ type: 'gameState', state: getPublicState() });
    });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT} | Red local: http://${getLocalIP()}:${PORT}`);
});