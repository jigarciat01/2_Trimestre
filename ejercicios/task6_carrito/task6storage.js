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