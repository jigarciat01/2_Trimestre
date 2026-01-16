// --- task6.js ---

import { products } from './task6data.js';
// IMPORTANTE: Añadimos las nuevas funciones al import
import { loadCartFromCookie, saveStockToStorage, loadStockFromStorage } from './task6storage.js';
import * as CartLogic from './task6cart.js';

let isLoggedIn = false;

// --- FUNCIONES LÓGICAS ---

function filterProducts(query) {
    if (!query) return products;
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.category.toLowerCase().includes(lowerQuery)
    );
}

function renderProducts(list = products) {
    const container = document.getElementById('product-list');
    
    if (list.length === 0) {
        container.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }

    container.innerHTML = list.map(p => {
        const isOutOfStock = p.stock === 0;
        const stockDisplay = isOutOfStock 
            ? '<span style="color: #e74c3c; font-weight: bold;">¡AGOTADO!</span>' 
            : `<span style="color: #7f8c8d;">Stock disponible: ${p.stock}</span>`;
        
        const btnState = isOutOfStock ? 'disabled style="background-color: #95a5a6; cursor: not-allowed;"' : '';
        const btnValue = isOutOfStock ? 'Sin Stock' : 'Añadir';

        return `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" class="product-img">
            <h3>${p.name}</h3>
            <span class="price">$${p.price}</span>
            <div style="margin-bottom: 10px; font-size: 0.9rem;">${stockDisplay}</div>
            <input type="button" class="btn-add" data-id="${p.id}" ${btnState} value="${btnValue}">
        </div>
        `;
    }).join('');
}

function renderCart() {
    const cart = CartLogic.getCart();
    const discountPercent = CartLogic.getDiscount();
    const tbody = document.getElementById('cart-body');
    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount-display');
    const totalEl = document.getElementById('cart-total');
    let subtotal = 0;

    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Vacío</td></tr>';
    } else {
        tbody.innerHTML = cart.map(item => {
            // Buscamos el producto original (que ahora tiene el stock actualizado)
            const originalProduct = products.find(p => p.id === item.id);
            const maxStock = originalProduct ? originalProduct.stock : 100;
            const rowTotal = item.price * item.quantity;
            subtotal += rowTotal;

            return `
                <tr>
                    <td>${item.name}</td>
                    <td>$${item.price}</td>
                    <td>
                        <input type="number" class="qty-input" data-id="${item.id}" data-max="${maxStock}" value="${item.quantity}" min="1" max="${maxStock}">
                        <div style="font-size:0.7em; color:#888;">Máx: ${maxStock}</div>
                    </td>
                    <td>$${rowTotal}</td>
                    <td><input type="button" class="btn-remove" data-id="${item.id}" value="X"></td>
                </tr>
            `;
        }).join('');
    }

    const discountAmount = subtotal * discountPercent;
    const finalTotal = subtotal - discountAmount;

    subtotalEl.innerText = `Subtotal: $${subtotal.toFixed(2)}`;
    if (discountPercent > 0) {
        discountEl.style.display = 'block';
        discountEl.innerText = `Descuento (${discountPercent*100}%): -$${discountAmount.toFixed(2)}`;
    } else {
        discountEl.style.display = 'none';
    }
    totalEl.innerText = `Total: $${finalTotal.toFixed(2)}`;
    updateCheckoutButton();
}

function updateCheckoutButton() {
    const btn = document.getElementById('btn-checkout');
    if (isLoggedIn) {
        btn.disabled = false;
        btn.value = "Finalizar Compra";
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
    } else {
        btn.disabled = true;
        btn.value = "Inicia sesión para comprar";
        btn.style.opacity = "0.6";
        btn.style.cursor = "not-allowed";
    }
}

function showSuggestions(matches) {
    const suggestionsList = document.getElementById('suggestions-list');
    if (matches.length === 0) {
        suggestionsList.style.display = 'none';
        suggestionsList.innerHTML = '';
        return;
    }
    suggestionsList.innerHTML = matches.map(p => `
        <li class="suggestion-item" data-name="${p.name}">
            ${p.name} <span style="font-size:0.8em; color:#888;">(${p.category})</span>
        </li>
    `).join('');
    suggestionsList.style.display = 'block';
}

// --- HANDLERS ---

function handleLogin() {
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
}

function handleLogout() {
    isLoggedIn = false;
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
    updateCheckoutButton();
}

function handleAdd(id) {
    const product = products.find(p => p.id === id);
    const success = CartLogic.addItem(product);
    if (success) {
        renderCart();
    } else {
        alert(`¡No puedes añadir más! Has alcanzado el límite de stock para ${product.name}.`);
    }
}

function handleRemove(id) {
    CartLogic.removeItem(id);
    renderCart();
}

function handleUpdateQty(id, val, maxStock) {
    if(val < 1) return renderCart();
    const quantity = parseInt(val);
    const max = parseInt(maxStock);
    const success = CartLogic.updateItemQty(id, quantity, max);
    if (!success) {
        alert(`Solo disponemos de ${max} unidades en stock.`);
    }
    renderCart();
}

function handleApplyCoupon() {
    const codeInput = document.getElementById('coupon-code');
    const code = codeInput.value.toUpperCase();
    const result = CartLogic.applyCouponLogic(code);
    if (result.success) {
        alert(`¡Cupón aplicado! Descuento del ${result.percent}%`);
    } else {
        alert("Cupón no válido");
    }
    renderCart();
}

function handleClearAll() {
    CartLogic.clearCart();
    renderCart();
}

// MODIFICADO: Lógica de Checkout con reducción de Stock
function handleCheckout() {
    const cart = CartLogic.getCart();
    if (cart.length === 0) {
        alert("Carrito vacío.");
        return;
    }

    // 1. Restar el stock de los productos comprados
    cart.forEach(cartItem => {
        // Encontramos el producto "real" en la base de datos (array products)
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            product.stock -= cartItem.quantity;
            if (product.stock < 0) product.stock = 0; // Por seguridad
        }
    });

    // 2. Guardar el nuevo stock en el navegador (LocalStorage)
    saveStockToStorage(products);

    alert("¡Compra procesada con éxito! El inventario ha sido actualizado.");
    
    // 3. Limpiar carrito y repintar todo
    CartLogic.clearCart();
    renderCart();
    renderProducts(); // Importante para que salgan como "AGOTADO"
}

function handleSearch(query) {
    const filteredList = filterProducts(query);
    renderProducts(filteredList);
    if (query.length > 0) {
        const matches = filterProducts(query);
        showSuggestions(matches);
    } else {
        showSuggestions([]);
    }
}

// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sincronizar Stock Guardado
    // (Si hay datos en localStorage, actualizamos los productos iniciales)
    const savedStock = loadStockFromStorage();
    if (savedStock) {
        savedStock.forEach(savedItem => {
            const product = products.find(p => p.id === savedItem.id);
            if (product) {
                product.stock = savedItem.stock;
            }
        });
    }

    // 2. Renderizar productos (con el stock actualizado)
    renderProducts(products); 

    // 3. Cargar carrito
    const storedCart = loadCartFromCookie();
    CartLogic.setCart(storedCart);
    renderCart();

    // Listeners
    document.getElementById('btn-login').addEventListener('click', handleLogin);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    document.getElementById('btn-apply-coupon').addEventListener('click', handleApplyCoupon);
    document.getElementById('btn-clear').addEventListener('click', handleClearAll);
    document.getElementById('btn-checkout').addEventListener('click', handleCheckout);
    
    const searchInput = document.getElementById('search-input');
    const suggestionsList = document.getElementById('suggestions-list');

    searchInput.addEventListener('keyup', (e) => handleSearch(e.target.value));
    
    suggestionsList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (li) {
            const productName = li.dataset.name;
            searchInput.value = productName;
            handleSearch(productName);
            showSuggestions([]);
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== searchInput && e.target !== suggestionsList) {
            showSuggestions([]);
        }
    });

    document.getElementById('product-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add')) {
            const id = parseInt(e.target.dataset.id);
            handleAdd(id);
        }
    });

    const cartBody = document.getElementById('cart-body');
    cartBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove')) {
            const id = parseInt(e.target.dataset.id);
            handleRemove(id);
        }
    });
    cartBody.addEventListener('change', (e) => {
        if (e.target.classList.contains('qty-input')) {
            const id = parseInt(e.target.dataset.id);
            const max = parseInt(e.target.dataset.max);
            handleUpdateQty(id, e.target.value, max);
        }
    });
});