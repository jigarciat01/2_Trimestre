const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const pads = [
    { id: 1, type: "Beat", key: "q", color: "red", name: "Bombo" },
    { id: 2, type: "Beat", key: "w", color: "red", name: "Caja" },
    { id: 3, type: "Effect", key: "e", color: "blue", name: "Sirena", duration: 2000 },
    { id: 4, type: "Effect", key: "r", color: "blue", name: "Láser", duration: 500 },
    { id: 5, type: "Beat", key: "a", color: "green", name: "Hi-Hat" },
    { id: 6, type: "Beat", key: "s", color: "green", name: "Clap" }
];

app.get('/pads', (req, res) => res.json(pads));

// Guardar la sesión del DJ
app.post('/save', (req, res) => {
    const { djName, timestamp } = req.body;
    console.log(`Sesión de ${djName} guardada a las ${timestamp}`);
    res.json({ ok: true });
});

app.listen(3000, () => console.log('DJ Server on 3000'));