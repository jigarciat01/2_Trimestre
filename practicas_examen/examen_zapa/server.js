const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let productos = [
    { id: 1, marca: "Nike", modelo: "Air Jordan 1", precio: 180, stock: 5, img: "👟" },
    { id: 2, marca: "Adidas", modelo: "Yeezy Boost", precio: 220, stock: 2, img: "🥥" },
    { id: 3, marca: "Nike", modelo: "Dunk Low", precio: 110, stock: 0, img: "🐼" }, // Sin stock
    { id: 4, marca: "New Balance", modelo: "550", precio: 130, stock: 8, img: "🟢" },
    { id: 5, marca: "Adidas", modelo: "Forum", precio: 100, stock: 10, img: "🔵" }
];

app.get('/api/products', (req, res) => {
    res.json(productos);
});

// Endpoint para comprar (restar stock)
app.post('/api/buy', (req, res) => {
    const { id } = req.body;
    const zapato = productos.find(p => p.id === id);

    if (zapato && zapato.stock > 0) {
        zapato.stock--; // Restamos 1 en el servidor
        res.json({ ok: true, nuevoStock: zapato.stock });
    } else {
        res.status(400).json({ ok: false, msg: "Sin stock o producto no encontrado" });
    }
});

app.listen(3000, () => console.log('Server on 3000'));