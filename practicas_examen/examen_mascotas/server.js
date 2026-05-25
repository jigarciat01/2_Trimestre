const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const pets = [
    { id: 1, type: "Dog", name: "Rex", age: 5, breed: "Pastor Alemán" },
    { id: 2, type: "Cat", name: "Luna", age: 2, lives: 7 },
    { id: 3, type: "Dog", name: "Toby", age: 1, breed: "Golden Retriever" },
    { id: 4, type: "Cat", name: "Garfield", age: 8, lives: 1 },
    { id: 5, type: "Dog", name: "Chispa", age: 3, breed: "Chihuahua" }
];

app.get('/api/pets', (req, res) => {
    setTimeout(() => res.json(pets), 500); // Simula retardo
});

app.post('/api/adopt', (req, res) => {
    const { id, owner } = req.body;
    if (id && owner) {
        console.log(`Mascota ${id} adoptada por ${owner}`);
        res.json({ success: true, message: "¡Adopción completada!" });
    } else {
        res.status(400).json({ success: false, message: "Faltan datos" });
    }
});

app.listen(3000, () => console.log('Servidor en puerto 3000'));