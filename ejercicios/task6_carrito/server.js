// server.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// --- DATOS EN MEMORIA ---

// Usuarios
const users = [
    { username: "admin", password: "1234" },
    { username: "cliente", password: "user" }
];

// Cupones
const coupons = [
    { code: "DESC10", discount: 0.10 }, // 10%
    { code: "HOY20", discount: 0.20 },  // 20%
    { code: "GAMER50", discount: 0.50 } // 50%
];

// Productos (Stock inicial)
// Al reiniciar el servidor (node server.js), el stock vuelve a estos valores.
let products = [
    { id: 1, name: "Monitor 24\" Oficina", price: 150, category: "monitor", image: "img/monitor.jpg", stock: 5 },
    { id: 101, name: "Monitor 27\" Gaming 144Hz", price: 300, category: "monitor", image: "img/monitor.jpg", stock: 2 }, 
    { id: 102, name: "Monitor Curvo 32\"", price: 450, category: "monitor", image: "img/monitor.jpg", stock: 0 },
    { id: 2, name: "Teclado Mecánico RGB", price: 80, category: "teclado", image: "img/teclado.jpg", stock: 10 },
    { id: 201, name: "Teclado Inalámbrico Slim", price: 40, category: "teclado", image: "img/teclado.jpg", stock: 0 },
    { id: 202, name: "Teclado Ergonómico", price: 120, category: "teclado", image: "img/teclado.jpg", stock: 3 },
    { id: 3, name: "Ratón Gaming Pro", price: 40, category: "raton", image: "img/raton.jpg", stock: 15 },
    { id: 301, name: "Ratón Vertical Ergo", price: 35, category: "raton", image: "img/raton.jpg", stock: 4 },
    { id: 302, name: "Ratón Bluetooth Mini", price: 25, category: "raton", image: "img/raton.jpg", stock: 8 },
    { id: 4, name: "Auriculares Studio", price: 60, category: "audio", image: "img/auriculares.jpg", stock: 6 },
    { id: 401, name: "Auriculares True Wireless", price: 90, category: "audio", image: "img/auriculares.jpg", stock: 20 },
    { id: 5, name: "Silla Ergonómica Malla", price: 200, category: "silla", image: "img/silla.jpg", stock: 1 },
    { id: 501, name: "Silla Gaming Racing", price: 250, category: "silla", image: "img/silla.jpg", stock: 5 }
];

// --- RUTAS (ENDPOINTS) ---

// 1. Obtener lista de productos
app.get("/products", (req, res) => {
    res.json(products);
});

// 2. Login de usuario
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ ok: true, user: user.username });
    } else {
        res.json({ ok: false, message: "Usuario o contraseña incorrectos" });
    }
});

// 3. Validar cupón de descuento
app.get("/coupon/:code", (req, res) => {
    const code = req.params.code.toUpperCase();
    const coupon = coupons.find(c => c.code === code);

    if (coupon) {
        res.json({ valid: true, discount: coupon.discount });
    } else {
        res.json({ valid: false });
    }
});

// 4. Procesar compra y ACTUALIZAR STOCK
app.post("/checkout", (req, res) => {
    const { cart } = req.body; 

    if (!cart || !Array.isArray(cart)) {
        return res.status(400).json({ ok: false, message: "Carrito inválido" });
    }

    // Recorremos los productos comprados para restar el stock
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            product.stock -= cartItem.quantity;
            // Evitamos stock negativo por seguridad
            if (product.stock < 0) product.stock = 0;
        }
    });

    console.log("Compra procesada. Stock actualizado.");
    res.json({ ok: true, message: "Stock actualizado correctamente" });
});

// --- INICIO DEL SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor Eclipse Gaming corriendo en http://localhost:${PORT}`);
});