const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
// Importamos los módulos 'fs' y 'os' integrados en Node
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (index.html, script.js, style.css)
app.use(express.static(__dirname));

let rankingGlobal = [];

// Cargamos las preguntas desde JSON
const bancoPreguntas = require('./quesitos.json');

// Helper para obtener la IP en la red local
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// GET: Devuelve información para unirse a la partida desde red local
app.get('/invite-info', (req, res) => {
    const localIP = getLocalIP();
    res.json({
        ip: localIP,
        port: PORT,
        url: `http://${localIP}:${PORT}`
    });
});

// GET: Devuelve una pregunta ALEATORIA del tema solicitado
app.get('/pregunta/:categoria', (req, res) => {
    const categoria = req.params.categoria.toLowerCase();
    const preguntasTema = bancoPreguntas[categoria];
    if (preguntasTema) {
        const preguntaAleatoria = preguntasTema[Math.floor(Math.random() * preguntasTema.length)];
        res.json(preguntaAleatoria);
    } else {
        res.status(404).json({ error: "Categoría no encontrada" });
    }
});


// POST: Recibe nombre, puntos y quesitos (Mantenido por compatibilidad si se usa desde cliente, aunque ahora lo gestiona el server también)
app.post('/puntuacion', (req, res) => {
    const { nombre, puntos, quesitos } = req.body;
    actualizarRankingGlobal(nombre, puntos, quesitos);
    res.status(201).json({ mensaje: "Puntuación y quesitos guardados", tabla: rankingGlobal });
});

function actualizarRankingGlobal(nombre, puntos, quesitos) {
    const jugadorExistente = rankingGlobal.find(j => j.nombre === nombre);
    if (jugadorExistente) {
        jugadorExistente.puntos = puntos;
        jugadorExistente.quesitos = quesitos;
    } else {
        rankingGlobal.push({ nombre, puntos, quesitos });
    }
    rankingGlobal.sort((a, b) => b.puntos - a.puntos);
}

// Crear servidor HTTP y Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// Estado global del juego
const gameState = {
    jugadores: [], // Array de objetos { id, nombre, puntos, quesitosObj, rachas, desconectado }
    turnoActualIndex: 0,
};

// Mapa para gestionar los timeouts de desconexión por jugador
const disconnectTimeouts = new Map();

function getPublicGameState() {
    return {
        jugadores: gameState.jugadores,
        turnoActualIndex: gameState.turnoActualIndex,
        jugadorTurnoActual: gameState.jugadores[gameState.turnoActualIndex] || null,
        rankingGlobal: rankingGlobal
    };
}

function avanzarTurno() {
    if (gameState.jugadores.length > 0) {
        gameState.turnoActualIndex = (gameState.turnoActualIndex + 1) % gameState.jugadores.length;
    }
}

io.on('connection', (socket) => {
    // Pedimos al cliente que nos envíe su nombre/ID
    socket.emit('askName');

    socket.on('join', (data) => {
        let idJugador = socket.id;
        let nombre = data;
        if (typeof data === 'object') {
            idJugador = data.id;
            nombre = data.nombre;
        }

        // Cancelar el timeout de desconexión si existía
        if (disconnectTimeouts.has(idJugador)) {
            clearTimeout(disconnectTimeouts.get(idJugador));
            disconnectTimeouts.delete(idJugador);
        }

        const jugadorExistente = gameState.jugadores.find(j => j.id === idJugador);
        if (jugadorExistente) {
            // Reconexión: Actualizar socketId y estado
            jugadorExistente.socketId = socket.id;
            jugadorExistente.nombre = nombre;
            jugadorExistente.desconectado = false;
        } else {
            const nuevoJugador = {
                id: idJugador,
                socketId: socket.id,
                nombre: nombre,
                puntos: 0,
                quesitosObj: { geografia: false, entretenimiento: false, historia: false, arte_literatura: false, ciencia: false, deportes: false },
                rachas: { geografia: 0, entretenimiento: 0, historia: 0, arte_literatura: 0, ciencia: 0, deportes: 0 },
                desconectado: false
            };
            gameState.jugadores.push(nuevoJugador);
        }
        
        io.emit('gameState', getPublicGameState());
    });

    socket.on('girarRuleta', (data) => {
        if (gameState.jugadores[gameState.turnoActualIndex]?.socketId !== socket.id) return;
        io.emit('ruletaGirando', data);
    });

    socket.on('preguntaObtenida', (datosPregunta) => {
        if (gameState.jugadores[gameState.turnoActualIndex]?.socketId !== socket.id) return;
        io.emit('mostrarPregunta', datosPregunta);
    });

    socket.on('respuestaValidada', (data) => {
        if (gameState.jugadores[gameState.turnoActualIndex]?.socketId !== socket.id) return;
        
        const jugador = gameState.jugadores[gameState.turnoActualIndex];
        let quesitoConseguido = false;
        
        if (data.correcta) {
            jugador.puntos += 10;
            jugador.rachas[data.categoriaId]++;
            
            if (jugador.rachas[data.categoriaId] >= 3 && !jugador.quesitosObj[data.categoriaId]) {
                jugador.quesitosObj[data.categoriaId] = true;
                quesitoConseguido = true;
            }
        } else {
            jugador.rachas[data.categoriaId] = 0;
            avanzarTurno();
        }
        
        actualizarRankingGlobal(jugador.nombre, jugador.puntos, Object.values(jugador.quesitosObj).filter(Boolean).length);

        io.emit('resultadoRespuesta', {
            nombre: jugador.nombre,
            correcta: data.correcta,
            timeout: data.timeout,
            quesitoConseguido,
            categoriaId: data.categoriaId
        });
        
        io.emit('gameState', getPublicGameState());
    });

    // Permitir saltar el turno si el jugador activo se ha desconectado
    socket.on('saltarTurno', () => {
        const jugadorTurno = gameState.jugadores[gameState.turnoActualIndex];
        if (jugadorTurno && jugadorTurno.desconectado) {
            avanzarTurno();
            io.emit('gameState', getPublicGameState());
        }
    });

    // Eliminar un jugador desconectado manualmente
    socket.on('eliminarJugador', (idJugadorAEliminar) => {
        const jugadorAEliminar = gameState.jugadores.find(j => j.id === idJugadorAEliminar);
        if (jugadorAEliminar && jugadorAEliminar.desconectado) {
            if (disconnectTimeouts.has(idJugadorAEliminar)) {
                clearTimeout(disconnectTimeouts.get(idJugadorAEliminar));
                disconnectTimeouts.delete(idJugadorAEliminar);
            }
            
            const idJugadorTurnoAntes = gameState.jugadores[gameState.turnoActualIndex]?.id;
            
            gameState.jugadores = gameState.jugadores.filter(j => j.id !== idJugadorAEliminar);
            
            // Ajustar el turno actual tras eliminar al jugador
            if (gameState.jugadores.length === 0) {
                gameState.turnoActualIndex = 0;
            } else {
                let nuevoIndex = gameState.jugadores.findIndex(j => j.id === idJugadorTurnoAntes);
                if (nuevoIndex === -1) {
                    gameState.turnoActualIndex = gameState.turnoActualIndex % gameState.jugadores.length;
                } else {
                    gameState.turnoActualIndex = nuevoIndex;
                }
            }
            io.emit('gameState', getPublicGameState());
        }
    });

    socket.on('disconnect', () => {
        const idJugadorTurno = gameState.jugadores[gameState.turnoActualIndex]?.id;
        
        // Buscamos si este socket tiene algún jugador asignado
        const jugadoresAsociados = gameState.jugadores.filter(j => j.socketId === socket.id);
        
        if (jugadoresAsociados.length > 0) {
            jugadoresAsociados.forEach(j => {
                j.desconectado = true;
                
                // Programar eliminación permanente si no se reconecta en 60 segundos
                const playerId = j.id;
                const timeoutId = setTimeout(() => {
                    const playerObj = gameState.jugadores.find(p => p.id === playerId);
                    if (playerObj && playerObj.desconectado) {
                        gameState.jugadores = gameState.jugadores.filter(p => p.id !== playerId);
                        
                        // Ajustar turno si se ha eliminado el jugador activo o si el índice quedó fuera de rango
                        const jugadorTurnoActual = gameState.jugadores[gameState.turnoActualIndex];
                        if (!jugadorTurnoActual || jugadorTurnoActual.id === playerId) {
                            if (gameState.jugadores.length === 0) {
                                gameState.turnoActualIndex = 0;
                            } else {
                                let nuevoIndex = gameState.jugadores.findIndex(p => p.id === idJugadorTurno);
                                if (nuevoIndex === -1) {
                                    gameState.turnoActualIndex = gameState.turnoActualIndex % gameState.jugadores.length;
                                } else {
                                    gameState.turnoActualIndex = nuevoIndex;
                                }
                            }
                        }
                        io.emit('gameState', getPublicGameState());
                    }
                    disconnectTimeouts.delete(playerId);
                }, 60000);
                
                disconnectTimeouts.set(playerId, timeoutId);
            });
            
            io.emit('gameState', getPublicGameState());
        }
    });
});

httpServer.listen(PORT, () => {
    const localIP = getLocalIP();
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    console.log(`🌐 Accede en tu red local en: http://${localIP}:${PORT}`);
});