const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Base de datos en memoria
const rooms = [
    { id: 101, type: "Suite", price: 200, status: "available" },
    { id: 102, type: "Standard", price: 100, status: "booked" },
    { id: 103, type: "Economy", price: 60, status: "available" },
    { id: 104, type: "Standard", price: 110, status: "available" },
    { id: 105, type: "Suite", price: 220, status: "booked" },
    { id: 106, type: "Economy", price: 55, status: "available" }
];

app.get('/rooms', (req, res) => {
    // Simulamos un pequeño retraso de red
    setTimeout(() => res.json(rooms), 500);
});

app.post('/login', (req, res) => {
    const { user } = req.body;
    if(user) res.json({ ok: true, token: "HOTEL-TOKEN-123", user });
    else res.status(400).json({ ok: false });
});

app.listen(3000, () => console.log('Hotel Server on port 3000'));