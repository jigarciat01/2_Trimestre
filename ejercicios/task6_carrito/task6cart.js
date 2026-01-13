import { saveCartToCookie } from './task6storage.js';

let cart = [];
let discount = 0; // Porcentaje de descuento (0 a 1)

export function setCart(newCart) { cart = newCart; }
export function getCart() { return cart; }
export function getDiscount() { return discount; } // Para leerlo desde la UI

// Nueva función para aplicar cupón
export function applyCouponLogic(code) {
    const validCoupons = {
        'DESC10': 0.10, // 10%
        'HOY20': 0.20   // 20%
    };

    if (validCoupons[code]) {
        discount = validCoupons[code];
        return { success: true, percent: discount * 100 };
    } else {
        discount = 0;
        return { success: false };
    }
}

export function addItem(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCartToCookie(cart);
}

export function updateItemQty(id, qty) {
    const item = cart.find(p => p.id === id);
    if (item && qty > 0) {
        item.quantity = qty;
        saveCartToCookie(cart);
    }
}

export function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCartToCookie(cart);
}

export function clearCart() {
    cart = [];
    discount = 0; // Resetear descuento al vaciar
    saveCartToCookie(cart);
}