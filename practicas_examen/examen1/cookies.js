/**
 * Módulo de Cookies
 * Proporciona funciones para manejar cookies del navegador
 * Las cookies permiten almacenar datos pequeños en el navegador del usuario
 */

/**
 * Guarda una cookie en el navegador
 * Ejemplo: setCookie('usuario', 'Juan', 3600) -> cookie válida por 1 hora
 */
export function setCookie(name, value, seconds) {
    // max-age define cuántos segundos durará la cookie
    // path=/ hace que la cookie esté disponible en toda la web
    document.cookie = `${name}=${value}; max-age=${seconds}; path=/`;
    
    // Nota: Si seconds es 0 o negativo, la cookie se elimina inmediatamente
}

/**
 * Lee el valor de una cookie por su nombre
 * Ejemplo: getCookie('usuario') -> 'Juan' o null
 */
export function getCookie(name) {
    // document.cookie devuelve todas las cookies como un string
    // Formato: "cookie1=valor1; cookie2=valor2; cookie3=valor3"
    
    // Separamos las cookies por "; " para obtener un array
    const cookies = document.cookie.split('; ');
    
    // Buscamos la cookie que empiece con el nombre que buscamos
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    
    // Si encontramos la cookie, devolvemos solo el valor (después del =)
    // Si no la encontramos, devolvemos 
    // alumna = maria
    if (cookie) {
        return cookie.split('=')[1];
    }
    
    return null;
}

/**
 * Elimina una cookie estableciendo su max-age a 0
 */
export function deleteCookie(name) {
    // Al poner max-age=0, la cookie expira inmediatamente
    document.cookie = `${name}=; max-age=0; path=/`;
}
