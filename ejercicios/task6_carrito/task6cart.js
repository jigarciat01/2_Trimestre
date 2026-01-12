import { saveCartToCookie } from './task6storage.js';

let cart = [];

export function setCart(newCart) { cart = newCart; }
export function getCart() { return cart; }

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
    saveCartToCookie(cart);
}