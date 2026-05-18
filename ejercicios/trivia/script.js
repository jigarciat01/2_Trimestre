// ====== ESTADO DEL JUEGO ======
let marcadorActual = 0;
let rachas = { geografia: 0, entretenimiento: 0, historia: 0, arte_literatura: 0, ciencia: 0, deportes: 0 };
let quesitos = { geografia: false, entretenimiento: false, historia: false, arte_literatura: false, ciencia: false, deportes: false };
let preguntaActualCorrecta = null;
let textoRespuestaCorrecta = "";
let categoriaActual = null;
let girosAcumulados = 0;

// ====== CONFIGURACIÓN DE LAS 6 CATEGORÍAS ======
const categorias = [
    { id: 'geografia', nombre: 'Geografía', color: '#3498db' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', color: '#e84393' },
    { id: 'historia', nombre: 'Historia', color: '#f1c40f' },
    { id: 'arte_literatura', nombre: 'Arte y Letras', color: '#8e44ad' },
    { id: 'ciencia', nombre: 'Ciencia', color: '#2ecc71' },
    { id: 'deportes', nombre: 'Deportes', color: '#e67e22' }
];

// ====== REFERENCIAS AL DOM ======
const opcionesContainer = document.getElementById('opcionesContainer');
const btnSortear = document.getElementById('sortear');
const cartelTexto = document.getElementById('ganadorTexto');
const modalPregunta = document.getElementById('modal-pregunta');
const btnEnviar = document.getElementById('btn-enviar');
const feedbackContainer = document.getElementById('feedback-container');

// ====== INICIALIZACIÓN ======
document.addEventListener('DOMContentLoaded', () => {
    dibujarRuleta();
    btnSortear.addEventListener('click', girarRuleta);
    btnEnviar.addEventListener('click', enviarRanking);
    opcionesContainer.addEventListener('transitionend', alTerminarGiro);
});

// ====== SOCKET.IO: handshake para pedir nombre y gestionar jugadores ======
const socket = (typeof io !== 'undefined') ? io() : null;
let conectado = false;
if (socket) {
    socket.on('connect', () => {
        console.log('Conectado al servidor de websockets');
    });

    socket.on('askName', () => {
        // Pedimos nombre hasta que el usuario lo introduzca
        let nombre = document.getElementById('nick').value || '';
        while (!nombre) {
            nombre = prompt('Introduce tu nombre para unirte al juego:');
            if (nombre === null) break; // usuario canceló
            nombre = nombre ? nombre.trim() : '';
        }
        if (nombre) {
            document.getElementById('nick').value = nombre;
            socket.emit('join', nombre);
            conectado = true;
            btnSortear.style.pointerEvents = 'auto';
            mostrarMensaje('Conectado como ' + nombre, 'info');
        } else {
            mostrarMensaje('Necesitas un nombre para jugar', 'error');
            btnSortear.style.pointerEvents = 'none';
        }
    });

    socket.on('players', (lista) => {
        // Podríamos mostrar la lista de jugadores en la UI (opcional)
        console.log('Jugadores conectados:', lista);
    });
}

function mostrarMensaje(mensaje, tipo) {
    feedbackContainer.innerText = mensaje;
    feedbackContainer.className = tipo; 
}

function dibujarRuleta() {
    const gradosPorOpcion = 360 / categorias.length; // 60 grados cada uno
    let conicString = [];

    categorias.forEach((cat, index) => {
        const anguloInicio = index * gradosPorOpcion;
        const anguloFin = anguloInicio + gradosPorOpcion;
        conicString.push(`${cat.color} ${anguloInicio}deg ${anguloFin}deg`);

        const separador = document.createElement('div');
        separador.classList.add('separador');
        separador.style.transform = `rotate(${anguloInicio}deg)`;
        opcionesContainer.appendChild(separador);

        const texto = document.createElement('p');
        texto.classList.add('nombre');
        texto.innerText = cat.nombre;
        texto.style.transform = `rotate(${anguloInicio + (gradosPorOpcion / 2)}deg)`;
        opcionesContainer.appendChild(texto);
    });

    opcionesContainer.style.background = `conic-gradient(${conicString.join(', ')})`;
}

function girarRuleta() {
    if (!conectado && socket) return mostrarMensaje('No estás registrado en el servidor', 'error');
    btnSortear.style.pointerEvents = 'none';
    cartelTexto.innerText = "¡Girando...";
    feedbackContainer.className = 'oculto'; 
    
    const randomIdx = Math.floor(Math.random() * categorias.length);
    categoriaActual = categorias[randomIdx];

    const gradosPorOpcion = 360 / categorias.length;
    const offsetCentro = gradosPorOpcion / 2;
    const vueltasExtra = 360 * 5; 
    const giroObjetivo = vueltasExtra + (360 - (randomIdx * gradosPorOpcion + offsetCentro));

    girosAcumulados += giroObjetivo;
    opcionesContainer.style.transform = `rotate(${girosAcumulados}deg)`;
}

function alTerminarGiro() {
    cartelTexto.innerText = `¡${categoriaActual.nombre}!`;
    obtenerPreguntaDelServidor(categoriaActual.id);
}

async function obtenerPreguntaDelServidor(tema) {
    try {
        const respuesta = await fetch(`/pregunta/${tema}`);
        if (!respuesta.ok) throw new Error("Categoría vacía");
        
        const datos = await respuesta.json();
        preguntaActualCorrecta = datos.correcta;
        textoRespuestaCorrecta = datos.respuestas[datos.correcta]; 
        
        mostrarModalPregunta(datos);
    } catch (error) {
        cartelTexto.innerText = "Error. ¿Server encendido?";
        btnSortear.style.pointerEvents = 'auto';
    }
}

function mostrarModalPregunta(datos) {
    document.getElementById('tema-pregunta').innerText = categoriaActual.nombre;
    document.getElementById('texto-pregunta').innerText = datos.pregunta;
    const contenedorOpciones = document.getElementById('opciones-respuestas');
    contenedorOpciones.innerHTML = ""; 

    datos.respuestas.forEach((resp, index) => {
        const btn = document.createElement('button');
        btn.innerText = resp;
        btn.onclick = () => validarRespuesta(index);
        contenedorOpciones.appendChild(btn);
    });
    modalPregunta.showModal();
}

function validarRespuesta(indexSeleccionado) {
    modalPregunta.close(); 

    if (indexSeleccionado === preguntaActualCorrecta) {
        marcadorActual += 10;
        rachas[categoriaActual.id]++;
        let textoFeedback = `✅ ¡Correcto! +10 pts.\n🔥 Racha en ${categoriaActual.nombre}: ${rachas[categoriaActual.id]}`;

        if (rachas[categoriaActual.id] >= 3 && !quesitos[categoriaActual.id]) {
            if (Math.random() <= 0.25) {
                quesitos[categoriaActual.id] = true;
                textoFeedback += `\n\n🎉 ¡CONSEGUISTE EL QUESITO!`;
            }
        }
        mostrarMensaje(textoFeedback, 'success');
    } else {
        rachas[categoriaActual.id] = 0;
        mostrarMensaje(`❌ Fallo.\nLa respuesta correcta era: "${textoRespuestaCorrecta}".\nRacha reiniciada.`, 'error');
    }

    actualizarMarcadores();
    cartelTexto.innerText = "¡Tira otra vez!";
    btnSortear.style.pointerEvents = 'auto'; 
}

function actualizarMarcadores() {
    document.getElementById('puntos-display').innerText = marcadorActual;
    Object.keys(quesitos).forEach(tema => {
        if (quesitos[tema]) {
            const icono = document.getElementById(`q-${tema}`);
            if (icono) icono.classList.add('conseguido');
        }
    });
}

async function enviarRanking() {
    const nick = document.getElementById('nick').value;
    if (!nick) return mostrarMensaje("⚠️ Escribe tu nombre", 'error');

    const quesitosTotales = Object.values(quesitos).filter(Boolean).length;

    try {
        const respuesta = await fetch('/puntuacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nick, puntos: marcadorActual, quesitos: quesitosTotales })
        });
        const datos = await respuesta.json();
        renderizarRanking(datos.tabla);
        mostrarMensaje("💾 Partida guardada", 'info');
    } catch (error) {
        mostrarMensaje("⚠️ Error de conexión", 'error');
    }
}

function renderizarRanking(tabla) {
    const divLista = document.getElementById('ranking-lista');
    let html = "<ol>";
    tabla.forEach(j => {
        html += `<li><strong>${j.nombre}</strong>: ${j.puntos} pts (${j.quesitos}/6)</li>`;
    });
    divLista.innerHTML = html + "</ol>";
}