import { saveCartToCookie } from './task6storage.js';

let cart = [];
let discount = 0; // Porcentaje de descuento (0 a 1)

export function setCart(newCart) { cart = newCart; }
export function getCart() { return cart; }
export function getDiscount() { return discount; }

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

// MODIFICADO: Devuelve true si se pudo añadir, false si no hay stock
export function addItem(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    // Caso 1: El producto ya está en el carrito
    if (existingItem) {
        // Verificamos si al sumar 1 superamos el stock disponible
        if (existingItem.quantity + 1 > product.stock) {
            return false; // Error: Stock insuficiente
        }
        existingItem.quantity++;
    } 
    // Caso 2: El producto es nuevo en el carrito
    else {
        // Verificamos si el producto tiene stock inicial (por si es 0)
        if (product.stock < 1) {
            return false; // Error: Producto agotado
        }
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCartToCookie(cart);
    return true; // Éxito
}

// MODIFICADO: Acepta maxStock para validar input manual
export function updateItemQty(id, qty, maxStock) {
    const item = cart.find(p => p.id === id);
    
    if (item && qty > 0) {
        // Si intenta poner más cantidad que el stock real
        if (qty > maxStock) {
            // No actualizamos o lo limitamos al máximo
            return false; // Indicamos fallo
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