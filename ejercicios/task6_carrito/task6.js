// --- task6.js (COMPLETO) ---

import { products } from './task6data.js';
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
        container.innerHTML = '<p style="text-align:center; width:100%; padding:20px;">No se encontraron productos.</p>';
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

    // --- Lógica de renderizado de filas ---
    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #888;">Tu carrito está vacío</td></tr>';
        subtotalEl.innerText = "Subtotal: $0.00";
        totalEl.innerText = "Total: $0.00";
        discountEl.style.display = 'none';
    } else {
        tbody.innerHTML = cart.map(item => {
            const originalProduct = products.find(p => p.id === item.id);
            if (!originalProduct) return ''; 

            const maxStock = originalProduct.stock;
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

    // --- Cálculos finales ---
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
    
    // --- ACTUALIZAR BOTÓN FLOTANTE (FAB) ---
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const fabCount = document.getElementById('fab-count');
    if(fabCount) {
        fabCount.innerText = totalItems;
        // Opcional: Ocultar badge si es 0, o dejarlo
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

// --- HANDLERS ---

function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    if (user === 'admin' && pass === '1234') {
        isLoggedIn = true;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('user-name-display').innerText = user;
        updateCheckoutButton();
    } else {
        alert("Usuario o contraseña incorrectos.\nPrueba: admin / 1234");
    }
}

function handleLogout() {
    isLoggedIn = false;
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    updateCheckoutButton();
}

function handleAdd(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const success = CartLogic.addItem(product);
    if (success) {
        renderCart();
    } else {
        alert(`¡Stock insuficiente! No quedan más unidades de "${product.name}".`);
    }
}

function handleRemove(id) {
    if(confirm('¿Eliminar producto del carrito?')) {
        CartLogic.removeItem(id);
        renderCart();
    }
}

function handleUpdateQty(id, val, maxStock) {
    if(val === '') return;

    let quantity = parseInt(val);
    const max = parseInt(maxStock);

    if (quantity < 1) quantity = 1;
    
    const success = CartLogic.updateItemQty(id, quantity, max);
    
    if (!success) {
        alert(`Lo sentimos, solo disponemos de ${max} unidades en stock.`);
        renderCart(); 
    } else {
        renderCart();
    }
}

function handleApplyCoupon() {
    const codeInput = document.getElementById('coupon-code');
    const code = codeInput.value.trim().toUpperCase();
    
    if(!code) return;

    const result = CartLogic.applyCouponLogic(code);
    if (result.success) {
        alert(`¡Éxito! Cupón aplicado: ${result.percent}% de descuento.`);
    } else {
        alert("El cupón ingresado no es válido.");
        codeInput.value = '';
    }
    renderCart();
}

function handleClearAll() {
    if(confirm('¿Estás seguro de vaciar todo el carrito?')) {
        CartLogic.clearCart();
        renderCart();
    }
}

function handleCheckout() {
    const cart = CartLogic.getCart();
    if (cart.length === 0) return;

    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            product.stock -= cartItem.quantity;
            if (product.stock < 0) product.stock = 0; 
        }
    });

    saveStockToStorage(products);

    alert("¡Compra realizada con éxito!\nGracias por confiar en Eclipse Gaming.");
    
    CartLogic.clearCart();
    renderCart();
    renderProducts();
}

function handleSearch(query) {
    const filteredList = filterProducts(query);
    renderProducts(filteredList);
    
    if (query.length > 0) {
        showSuggestions(filteredList);
    } else {
        showSuggestions([]);
    }
}

// --- INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
    const savedStock = loadStockFromStorage();
    if (savedStock) {
        savedStock.forEach(savedItem => {
            const product = products.find(p => p.id === savedItem.id);
            if (product) {
                product.stock = savedItem.stock;
            }
        });
    }

    renderProducts(products); 

    const storedCart = loadCartFromCookie();
    CartLogic.setCart(storedCart);
    
    renderCart();

    // Event Listeners
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