// 1. Funciones del Carrito (Las que ya tenías)
export function saveCartToCookie(cart) {
    const cartJSON = JSON.stringify(cart);
    document.cookie = `cart=${encodeURIComponent(cartJSON)}; path=/; max-age=86400`;
}

export function loadCartFromCookie() {
    const cookies = document.cookie.split(';');
    const cartCookie = cookies.find(row => row.trim().startsWith('cart='));
    if (cartCookie) {
        try {
            return JSON.parse(decodeURIComponent(cartCookie.split('=')[1]));
        } catch (e) { return []; }
    }
    return [];
}

// 2. NUEVO: Funciones de Stock (Persistencia)
export function saveStockToStorage(products) {
    // Guardamos un array simple con ID y Stock actual
    const stockData = products.map(p => ({ id: p.id, stock: p.stock }));
    localStorage.setItem('shop_stock', JSON.stringify(stockData));
}

export function loadStockFromStorage() {
    const data = localStorage.getItem('shop_stock');
    return data ? JSON.parse(data) : null;
}