import { products } from './task6data.js';
import { loadCartFromCookie } from './task6storage.js';
import * as CartLogic from './task6cart.js';

// Estado de usuario (simulado)
let isLoggedIn = false;

// --- FUNCIONES LÓGICAS DE UI ---

// Función de filtrado solicitada
function filterProducts(query) {
    if (!query) return products;
    const lowerQuery = query.toLowerCase();
    
    // Filtramos por nombre o por categoría
    return products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.category.toLowerCase().includes(lowerQuery)
    );
}

// Renderizar Productos (ahora acepta una lista opcional)
function renderProducts(list = products) {
    const container = document.getElementById('product-list');
    
    if (list.length === 0) {
        container.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }

    container.innerHTML = list.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" class="product-img">
            <h3>${p.name}</h3>
            <span class="price">$${p.price}</span>
            <button class="btn-add" onclick="app.add(${p.id})">Añadir</button>
        </div>
    `).join('');
}

// Renderizar Carrito (Con lógica de descuentos)
function renderCart() {
    const cart = CartLogic.getCart();
    const discountPercent = CartLogic.getDiscount(); // 0.10, 0.20, etc.

    const tbody = document.getElementById('cart-body');
    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount-display');
    const totalEl = document.getElementById('cart-total');
    
    let subtotal = 0;

    // Generar tabla
    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Vacío</td></tr>';
    } else {
        tbody.innerHTML = cart.map(item => {
            const rowTotal = item.price * item.quantity;
            subtotal += rowTotal;
            return `
                <tr>
                    <td>${item.name}</td>
                    <td>$${item.price}</td>
                    <td><input type="number" value="${item.quantity}" min="1" onchange="app.updateQty(${item.id}, this.value)"></td>
                    <td>$${rowTotal}</td>
                    <td><button class="btn-remove" onclick="app.remove(${item.id})">X</button></td>
                </tr>
            `;
        }).join('');
    }

    // Cálculos finales
    const discountAmount = subtotal * discountPercent;
    const finalTotal = subtotal - discountAmount;

    // Actualizar Textos
    subtotalEl.innerText = `Subtotal: $${subtotal.toFixed(2)}`;
    
    if (discountPercent > 0) {
        discountEl.style.display = 'block';
        discountEl.innerText = `Descuento (${discountPercent*100}%): -$${discountAmount.toFixed(2)}`;
    } else {
        discountEl.style.display = 'none';
    }

    totalEl.innerText = `Total: $${finalTotal.toFixed(2)}`;
    
    // Control del botón comprar según login
    updateCheckoutButton();
}

function updateCheckoutButton() {
    const btn = document.getElementById('btn-checkout');
    if (isLoggedIn) {
        btn.disabled = false;
        btn.innerText = "Finalizar Compra";
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
    } else {
        btn.disabled = true;
        btn.innerText = "Inicia sesión para comprar";
        btn.style.opacity = "0.6";
        btn.style.cursor = "not-allowed";
    }
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products); // Render inicial con todos
    const storedCart = loadCartFromCookie();
    CartLogic.setCart(storedCart);
    renderCart();
});

// --- EXPOSICIÓN GLOBAL (window.app) ---
window.app = {
    // ... Las funciones anteriores (add, remove, updateQty, clearAll) ...
    
    add: (id) => {
        const product = products.find(p => p.id === id);
        CartLogic.addItem(product);
        renderCart();
    },

    remove: (id) => {
        CartLogic.removeItem(id);
        renderCart();
    },

    updateQty: (id, val) => {
        if(val < 1) return renderCart();
        CartLogic.updateItemQty(id, parseInt(val));
        renderCart();
    },

    clearAll: () => {
        CartLogic.clearCart();
        renderCart();
    },

    // --- NUEVAS FUNCIONES ---

    // 1. Lógica de Búsqueda
    search: (query) => {
        const filteredList = filterProducts(query);
        renderProducts(filteredList);
    },

    // 2. Lógica de Cupón
    applyCoupon: () => {
        const codeInput = document.getElementById('coupon-code');
        const code = codeInput.value.toUpperCase();
        const result = CartLogic.applyCouponLogic(code);
        
        if (result.success) {
            alert(`¡Cupón aplicado! Descuento del ${result.percent}%`);
        } else {
            alert("Cupón no válido");
        }
        renderCart(); // Re-calcular totales
    },

    // 3. Lógica de Login Simulado
    login: () => {
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        if (user === 'admin' && pass === '1234') {
            isLoggedIn = true;
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('user-info').style.display = 'block';
            document.getElementById('user-name-display').innerText = user;
            updateCheckoutButton();
        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    },

    logout: () => {
        isLoggedIn = false;
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('user-info').style.display = 'none';
        updateCheckoutButton();
    },

    checkout: () => {
        const cart = CartLogic.getCart();
        if (cart.length === 0) {
            alert("Carrito vacío.");
            return;
        }
        alert("¡Compra procesada con éxito!");
        CartLogic.clearCart();
        renderCart();
    }
};