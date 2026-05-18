const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
// Importamos el módulo 'fs' (File System) integrado en Node para leer archivos
const fs = require('fs'); 

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (index.html, script.js, style.css)
app.use(express.static(__dirname));

let rankingGlobal = [];

// Cargamos las preguntas desde JSON
const bancoPreguntas = require('./quesitos.json');


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


// POST: Recibe nombre, puntos y quesitos
app.post('/puntuacion', (req, res) => {
    const { nombre, puntos, quesitos } = req.body;
    rankingGlobal.push({ nombre, puntos, quesitos });
    rankingGlobal.sort((a, b) => b.puntos - a.puntos); 
    res.status(201).json({ mensaje: "Puntuación y quesitos guardados", tabla: rankingGlobal });
});

// Crear servidor HTTP y Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// Map de jugadores conectados: socketId -> { nombre }
const jugadores = {};

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado:', socket.id);
    // Pedimos al cliente que nos envíe su nombre
    socket.emit('askName');

    socket.on('join', (nombre) => {
        jugadores[socket.id] = { nombre };
        console.log(`Jugador registrado: ${nombre} (${socket.id})`);
        // Enviar lista actualizada de jugadores a todos
        io.emit('players', Object.values(jugadores));
    });

    socket.on('disconnect', () => {
        const info = jugadores[socket.id];
        if (info) console.log('Jugador desconectado:', info.nombre);
        delete jugadores[socket.id];
        io.emit('players', Object.values(jugadores));
    });
});

httpServer.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor en http://0.0.0.0:${PORT}`));