/**
 * Módulo API
 * Contiene las funciones para comunicarse con el servidor backend
 * Todas las funciones son asíncronas porque hacen peticiones HTTP
 */

// URL base del servidor (cambiar si el servidor está en otro puerto/dominio)
const BASE_URL = 'http://localhost:3000';

/**
 * Obtiene todos los tickets del servidor
 * Hace una petición GET al endpoint /tickets
 */
export async function fetchTickets() {
    try {
        // fetch() devuelve una Promise, por eso usamos await
        const response = await fetch(`${BASE_URL}/tickets`);
        
        // Verificamos si la respuesta fue exitosa (status 200-299)
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        // Convertimos la respuesta JSON a un objeto JavaScript
        const tickets = await response.json();
        
        return tickets;
        
    } catch (error) {
        // Capturamos cualquier error (de red, de parsing, etc.)
        console.error('Error al obtener tickets:', error.message);
        // Devolvemos un array vacío para que la aplicación no se rompa
        return [];
    }
}

/**
 * Inicia sesión de un usuario
 * Hace una petición POST al endpoint /login con las credenciales
 */
export async function loginUser(user, pass) {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            // Método POST porque enviamos datos
            method: 'POST',
            // Headers para indicar que enviamos JSON
            headers: {
                'Content-Type': 'application/json'
            },
            // Body con los datos convertidos a JSON string
            body: JSON.stringify({ user, pass })
        });
        
        // Parseamos la respuesta JSON
        const data = await response.json();
        
        // Si la respuesta no es ok (status 401, etc.), lanzamos error con el mensaje del servidor
        if (!response.ok) {
            throw new Error(data.message || 'Error de autenticación');
        }
        
        // Retornamos los datos del usuario (ok, username, token)
        return data;
        
    } catch (error) {
        // Capturamos el error y lo devolvemos en un formato consistente
        console.error('Error en login:', error.message);
        return { ok: false, message: error.message };
    }
}
