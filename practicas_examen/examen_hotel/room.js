export default class Room {
    #id;
    #type;
    #price;
    #status;

    constructor(data) {
        this.#id = data.id;
        this.#type = data.type;
        this.#price = data.price;
        this.#status = data.status; 
    }


    get id() { 
        return this.#id; 
    }
    get type() { 
        return this.#type; 
    }
    get price() { 
        return this.#price; 
    }
    get status() { 
        return this.#status; 
    }


    render() {
        const statusClass = this.#status === 'available' ? 'available' : 'booked';
        
        let actionHTML = '';
        if (this.#status === 'available') {
            actionHTML = `<button class="btn-book" data-id="${this.#id}">Reservar</button>`;
        } else {
            actionHTML = `<span>Ocupada</span>`;
        }

        return `
            <article class="room-card ${statusClass}">
                <h3>Habitación ${this.#id}</h3>
                <p>Tipo: <strong>${this.#type}</strong></p>
                <div class="price">${this.#price}€ <small>/ noche</small></div>
                ${actionHTML}
            </article>
        `;
    }
}