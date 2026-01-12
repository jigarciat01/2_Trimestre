import { products } from './task6data.js';
import { loadCartFromCookie } from './task6storage.js';
import * as CartLogic from './task6cart.js';

// --- SECCIÓN 1: FUNCIONES DE VISUALIZACIÓN (UI) ---

// Renderiza la lista de productos en el HTML
function renderProducts() {
    const container = document.getElementById('product-list');
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" class="product-img">
            
            <h3>${p.name}</h3>
            <span class="price">$${p.price}</span>
            <button class="btn-add" onclick="app.add(${p.id})">Añadir al Carrito</button>
        </div>
    `).join('');
}

// Renderiza la tabla del carrito en el HTML
function renderCart() {
    const cart = CartLogic.getCart(); // Obtenemos el estado actual
    const tbody = document.getElementById('cart-body');
    const totalElement = document.getElementById('cart-total');
    let total = 0;

    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#777;">Carrito vacío.</td></tr>';
        totalElement.innerText = 'Total: $0.00';
        return;
    }

    tbody.innerHTML = cart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        return `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="app.updateQty(${item.id}, this.value)">
                </td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn-remove" onclick="app.remove(${item.id})">Borrar</button>
                </td>
            </tr>
        `;
    }).join('');

    totalElement.innerText = `Total: $${total.toFixed(2)}`;
}

// --- SECCIÓN 2: INICIALIZACIÓN Y CONTROL ---

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // 1. Pintar productos
    renderProducts();

    // 2. Recuperar carrito de cookies
    const storedCart = loadCartFromCookie();
    CartLogic.setCart(storedCart);

    // 3. Pintar carrito inicial
    renderCart();
});

// --- SECCIÓN 3: EXPOSICIÓN GLOBAL (window.app) ---
// Necesario para que el HTML (onclick) vea las funciones
window.app = {
    
    add: (id) => {
        const product = products.find(p => p.id === id);
        CartLogic.addItem(product);
        renderCart(); // Actualizamos la vista
    },

    remove: (id) => {
        if(confirm("¿Eliminar producto?")) {
            CartLogic.removeItem(id);
            renderCart(); // Actualizamos la vista
        }
    },

    updateQty: (id, value) => {
        const qty = parseInt(value);
        if (qty < 1) {
            alert("Cantidad mínima: 1");
            renderCart(); // Revertir visualmente el input
            return;
        }
        CartLogic.updateItemQty(id, qty);
        renderCart(); // Actualizamos la vista
    },

    clearAll: () => {
        if(confirm("¿Vaciar carrito?")) {
            CartLogic.clearCart();
            renderCart();
        }
    },

    checkout: () => {
        const cart = CartLogic.getCart();
        if (cart.length === 0) {
            alert("Carrito vacío.");
            return;
        }
        alert("¡Compra realizada!");
        CartLogic.clearCart();
        renderCart();
    }
};