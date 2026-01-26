import { saveCartToCookie } from './task6storage.js';

let cart = [];
let discount = 0; // Porcentaje de descuento (0 a 1)

export function setCart(newCart) { cart = newCart; }
export function getCart() { return cart; }
export function getDiscount() { return discount; }

// NUEVO: Permite fijar el descuento desde task6.js después de validar con el servidor
export function setDiscount(amount) {
    discount = amount;
}

// Devuelve true si se pudo añadir, false si no hay stock
export function addItem(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        if (existingItem.quantity + 1 > product.stock) {
            return false; 
        }
        existingItem.quantity++;
    } 
    else {
        if (product.stock < 1) {
            return false;
        }
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCartToCookie(cart);
    return true; 
}

export function updateItemQty(id, qty, maxStock) {
    const item = cart.find(p => p.id === id);
    
    if (item && qty > 0) {
        if (qty > maxStock) {
            return false;
        }
        item.quantity = qty;
        saveCartToCookie(cart);
        return true;
    }
}

export function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCartToCookie(cart);
}

export function clearCart() {
    cart = [];
    discount = 0;
    saveCartToCookie(cart);
}