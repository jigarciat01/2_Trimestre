const express = require('express');
const cors = require('cors');
const path = require('path'); // Módulo nativo de Node.js para manejar rutas de archivos

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta actual
// path.join une las rutas de forma segura independientemente del sistema operativo
// __dirname es la carpeta donde está este archivo (server.js)
app.use(express.static(__dirname));

// Ruta principal: cuando accedes a localhost:3000 sirve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const tickets = [
    { id: 1, title: "Fallo servidor", priority: "Alta", hours: 5, description: "El servidor principal no responde a ping." },
    { id: 2, title: "Cambio ratón", priority: "Baja", hours: 0.5, description: "Usuario solicita ratón ergonómico." },
    { id: 3, title: "Actualizar Windows", priority: "Media", hours: 2, description: "Parche de seguridad pendiente." },
    { id: 4, title: "Wifi lenta", priority: "Alta", hours: 3, description: "Sala de reuniones sin conexión estable." }
];

app.get('/tickets', (req, res) => res.json(tickets));

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    if(user === "admin" && pass === "1234") {
        res.json({ ok: true, username: "Administrador", token: "ABC-123" });
    } else {
        res.status(401).json({ ok: false, message: "Credenciales incorrectas" });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));