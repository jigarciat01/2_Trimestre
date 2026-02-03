// --- task6.js (CON BARRA DE NOTIFICACIONES SUPERIOR) ---

import { loadCartFromCookie } from './task6storage.js';
import * as CartLogic from './task6cart.js';

let isLoggedIn = false;
let products = []; // Se llena desde el servidor

// --- NUEVA FUNCIÓN: MENSAJE SUPERIOR (Sin Librerías) ---
function showMessage(msg, type = 'success') {
    const bar = document.getElementById('notification-bar');
    
    // 1. Poner texto y resetear clases
    bar.innerText = msg;
    bar.className = ''; // Limpiar clases anteriores (success/error/show)
    
    // 2. Añadir clase de color y clase 'show' para bajar la barra
    bar.classList.add(type === 'success' ? 'success' : 'error');
    
    // Pequeño retardo para permitir que el navegador procese el cambio de clase base
    requestAnimationFrame(() => {
        bar.classList.add('show');
    });

    // 3. Ocultar automáticamente después de 3 segundos
    setTimeout(() => {
        bar.classList.remove('show');
    }, 3000);
}

// --- FUNCIONES DE RENDERIZADO ---

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
    
    if (!list || list.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; padding:20px;">Cargando productos...</p>';
        return;
    }

    container.innerHTML = list.map(p => {
        const isOutOfStock = p.stock === 0;
        const stockDisplay = isOutOfStock 
            ? '<span style="color: #e74c3c; font-weight: bold;">¡AGOTADO!</span>' 
            : `<span style="color: #7f8c8d;">Stock: ${p.stock}</span>`;
        
        const btnState = isOutOfStock ? 'disabled style="background-color: #555; cursor: not-allowed; opacity: 0.7;"' : '';
        const btnValue = isOutOfStock ? 'Sin Stock' : 'Añadir al Carrito';

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
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #888;">Tu carrito está vacío</td></tr>';
        subtotalEl.innerText = "Subtotal: $0.00";
        totalEl.innerText = "Total: $0.00";
        discountEl.style.display = 'none';
    } else {
        tbody.innerHTML = cart.map(item => {
            const originalProduct = products.find(p => p.id === item.id);
            const maxStock = originalProduct ? originalProduct.stock : item.quantity;
            const rowTotal = item.price * item.quantity;
            subtotal += rowTotal;

            return `
                <tr>
                    <td>${item.name}</td>
                    <td>$${item.price}</td>
                    <td>
                        <input type="number" class="qty-input" data-id="${item.id}" data-max="${maxStock}" value="${item.quantity}" min="1" max="${maxStock}">
                        <div style="font-size:0.7em; color:#888; margin-top:2px;">Máx: ${maxStock}</div>
                    </td>
                    <td>$${rowTotal.toFixed(2)}</td>
                    <td style="text-align: right;">
                        <input type="button" class="btn-remove" data-id="${item.id}" value="X">
                    </td>
                </tr>
            `;
        }).join('');
    }

    const discountAmount = subtotal * discountPercent;
    const finalTotal = subtotal - discountAmount;

    subtotalEl.innerText = `Subtotal: $${subtotal.toFixed(2)}`;
    
    if (discountPercent > 0) {
        discountEl.style.display = 'block';
        discountEl.innerText = `Descuento (${Math.round(discountPercent*100)}%): -$${discountAmount.toFixed(2)}`;
    } else {
        discountEl.style.display = 'none';
    }
    
    totalEl.innerText = `Total: $${finalTotal.toFixed(2)}`;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const fabCount = document.getElementById('fab-count');
    if(fabCount) {
        fabCount.innerText = totalItems;
        fabCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    updateCheckoutButton();
}

function updateCheckoutButton() {
    const btn = document.getElementById('btn-checkout');
    const cart = CartLogic.getCart();
    
    if (isLoggedIn && cart.length > 0) {
        btn.disabled = false;
        btn.value = "Finalizar Compra";
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.title = "";
    } else if (!isLoggedIn) {
        btn.disabled = true;
        btn.value = "Inicia sesión para comprar";
        btn.style.opacity = "0.6";
        btn.style.cursor = "not-allowed";
        btn.title = "Debes loguearte primero";
    } else {
        btn.disabled = true;
        btn.value = "Carrito vacío";
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
    const limitedMatches = matches.slice(0, 5);
    
    suggestionsList.innerHTML = limitedMatches.map(p => `
        <li class="suggestion-item" data-name="${p.name}">
            ${p.name} <span style="font-size:0.8em; color:#888;">(${p.category})</span>
        </li>
    `).join('');
    suggestionsList.style.display = 'block';
}

// --- LOGICA DE CONEXIÓN CON SERVIDOR (HANDLERS) ---

async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        products = await response.json();
        renderProducts(products);
        renderCart(); 
    } catch (error) {
        console.error("Error cargando productos:", error);
        // Aquí mostramos el error en la barra roja
        document.getElementById('product-list').innerHTML = '<p style="color:red; text-align:center;">Error: No se puede conectar con el servidor.</p>';
        showMessage("No se puede conectar con el servidor", 'error');
    }
}

async function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await response.json();

        if (data.ok) {
            isLoggedIn = true;
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('user-info').style.display = 'flex';
            document.getElementById('user-name-display').innerText = data.user;
            updateCheckoutButton();
            // USAMOS showMessage EN LUGAR DE ALERT
            showMessage(`¡Hola ${data.user}! Has entrado correctamente.`, 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error("Error en login:", error);
        showMessage("Error de conexión con el servidor", 'error');
    }
}

function handleLogout() {
    isLoggedIn = false;
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    updateCheckoutButton();
    showMessage("Sesión cerrada correctamente", 'success');
}

function handleAdd(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const success = CartLogic.addItem(product);
    if (success) {
        renderCart();
        showMessage("Producto añadido al carrito", 'success');
    } else {
        showMessage(`¡Stock insuficiente! Solo quedan ${product.stock} unidades.`, 'error');
    }
}

function handleRemove(id) {
    // Usamos confirm porque es una acción destructiva, pero mostramos mensaje al final
    if(confirm('¿Eliminar producto del carrito?')) {
        CartLogic.removeItem(id);
        renderCart();
        showMessage("Producto eliminado", 'success');
    }
}

function handleUpdateQty(id, val, maxStock) {
    if(val === '') return;
    let quantity = parseInt(val);
    const max = parseInt(maxStock);
    if (quantity < 1) quantity = 1;
    
    const success = CartLogic.updateItemQty(id, quantity, max);
    if (!success) {
        showMessage(`Lo sentimos, solo disponemos de ${max} unidades.`, 'error');
        renderCart(); 
    } else {
        renderCart();
    }
}

async function handleApplyCoupon() {
    const codeInput = document.getElementById('coupon-code');
    const code = codeInput.value.trim();
    if(!code) return;

    try {
        const response = await fetch(`http://localhost:3000/coupon/${code}`);
        const data = await response.json();

        if (data.valid) {
            CartLogic.setDiscount(data.discount);
            showMessage(`¡Cupón aplicado! ${data.discount * 100}% de descuento.`, 'success');
            renderCart();
        } else {
            CartLogic.setDiscount(0);
            showMessage("El cupón no es válido.", 'error');
            codeInput.value = '';
            renderCart();
        }
    } catch (error) {
        console.error(error);
        showMessage("Error al validar cupón", 'error');
    }
}

function handleClearAll() {
    if(confirm('¿Estás seguro de vaciar el carrito?')) {
        CartLogic.clearCart();
        renderCart();
        showMessage("El carrito ha sido vaciado", 'success');
    }
}

async function handleCheckout() {
    const cart = CartLogic.getCart();
    if (cart.length === 0) return;

    // Cambiar estado del botón mientras carga
    const btn = document.getElementById('btn-checkout');
    const prevText = btn.value;
    btn.value = "Procesando...";
    btn.disabled = true;

    try {
        const response = await fetch('http://localhost:3000/checkout', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ cart: cart })
        });
        
        const data = await response.json();

        if (data.ok) {
            showMessage("¡Compra realizada con éxito! Gracias.", 'success');
            
            CartLogic.clearCart();
            renderCart();
            await loadProducts(); 

        } else {
            showMessage("Error: " + data.message, 'error');
        }
    } catch (error) {
        console.error("Error en checkout:", error);
        showMessage("Error de conexión al finalizar compra", 'error');
    } finally {
        // Restaurar botón (aunque el carrito se vacíe, es buena práctica)
        btn.value = prevText;
        if (CartLogic.getCart().length > 0) btn.disabled = false;
    }
}

function handleSearch(query) {
    const filteredList = filterProducts(query);
    renderProducts(filteredList);
    if (query.length > 0) showSuggestions(filteredList);
    else showSuggestions([]);
}

// --- INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    const storedCart = loadCartFromCookie();
    CartLogic.setCart(storedCart);
    renderCart();

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