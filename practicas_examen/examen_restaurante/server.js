const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const menu = [
    { id: 1, type: "Food", name: "Hamburguesa", price: 12.50, isVegetarian: false },
    { id: 2, type: "Drink", name: "Cerveza IPA", price: 4.00, isAlcoholic: true },
    { id: 3, type: "Food", name: "Ensalada César", price: 9.00, isVegetarian: true },
    { id: 4, type: "Drink", name: "Agua Mineral", price: 2.00, isAlcoholic: false },
    { id: 5, type: "Food", name: "Pizza Margarita", price: 11.00, isVegetarian: true },
    { id: 6, type: "Drink", name: "Vino Tinto", price: 3.50, isAlcoholic: true },
    { id: 7, type: "Food", name: "Chuletón", price: 22.00, isVegetarian: false }
];

app.get('/menu', (req, res) => setTimeout(() => res.json(menu), 500));

app.post('/pay', (req, res) => {
    const { table, amount } = req.body;
    if(table && amount > 0) {
        console.log(`Mesa ${table} pagó ${amount}€`);
        res.json({ ok: true, ticketId: Math.floor(Math.random() * 1000) });
    } else {
        res.status(400).json({ ok: false, msg: "Error en pago" });
    }
});

app.listen(3000, () => console.log('Restaurant Server on 3000'));