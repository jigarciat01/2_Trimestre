const API_URL = "http://localhost:3000";

// GET: Obtener habitaciones
export async function cargarhabitacion() {
    try {
        const response = await fetch(`${API_URL}/rooms`);
       
        if (!response.ok){
            throw new Error("Error en la petición");
        } 
        const data = await response.json();
        
        return data;

    } catch (error) {
        console.error("Fallo al obtener habitaciones:", error);
        return []; 
    }
}

export async function login(username) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user: username })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en login:", error);
        return { ok: false };
    }
}