/**
 * Clase Ticket
 * Representa un ticket de soporte técnico con sus propiedades y métodos
 */
export class Ticket {
    // Propiedades privadas (solo accesibles dentro de la clase)
    #id;
    #title;
    #priority;
    #hours;
    #description;

    constructor({ id, title, priority, hours, description }) {
        this.#id = id;
        this.#title = title;
        this.#priority = priority;
        this.#hours = hours;
        this.#description = description;
    }

    // ==================== GETTERS ====================
    // Los getters permiten acceder a las propiedades privadas desde fuera de la clase

    
    get id() {
        return this.#id;
    }

    
    get title() {
        return this.#title;
    }

   
    get priority() {
        return this.#priority;
    }

    
    get hours() {
        return this.#hours;
    }

    
    get description() {
        return this.#description;
    }

    // ==================== MÉTODOS ====================

    /**
     * Genera el HTML de una tarjeta de ticket
     * La clase de prioridad se añade para aplicar estilos diferentes según la prioridad
     */
    renderHTML() {
        // Template literal para crear el HTML
        // La clase ticket-card es la base, y se añade la prioridad como clase adicional
        // Esto permite que el CSS aplique colores diferentes según la prioridad
        return `
            <div class="ticket-card ${this.#priority}">
                <h3>${this.#title}</h3>
                <p><strong>Prioridad:</strong> ${this.#priority}</p>
                <p><strong>Horas estimadas:</strong> ${this.#hours}h</p>
                <p><strong>Descripción:</strong> ${this.#description}</p>
            </div>
        `;
    }
}
