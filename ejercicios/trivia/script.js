// ====== ESTADO Y CONFIGURACIÓN ======
let misJugadoresLocales = [], miTurno = false, preguntaActualCorrecta = null;
let textoRespuestaCorrecta = "", categoriaActual = null, girosAcumulados = 0, timerInterval;

const categorias = [
    { id: 'geografia', nombre: 'Geografía', color: '#3498db' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', color: '#e84393' },
    { id: 'historia', nombre: 'Historia', color: '#f1c40f' },
    { id: 'arte_literatura', nombre: 'Arte y Letras', color: '#8e44ad' },
    { id: 'ciencia', nombre: 'Ciencia', color: '#2ecc71' },
    { id: 'deportes', nombre: 'Deportes', color: '#e67e22' },
    { id: 'videojuegos', nombre: 'Videojuegos', color: '#32cd32' }
];

const $ = id => document.getElementById(id);
const DOM = {
    opciones: $('opcionesContainer'), btnSortear: $('sortear'), cartelTexto: $('ganadorTexto'),
    modal: $('modal-pregunta'), feedback: $('feedback-container'), btnAnadir: $('btn-anadir-jugador'),
    btnReiniciar: $('btn-reiniciar'), ruletaWrapper: $('ruleta-wrapper'), victoria: $('mensaje-victoria'),
    timer: $('temporizador'), turno: $('indicador-turno'), listaSala: $('lista-sala')
};

let ws = null;

// ====== INICIALIZACIÓN ======
document.addEventListener('DOMContentLoaded', () => {
    cargarJugadoresDeStorage();
    dibujarRuleta();
    conectarWebSocket();
    DOM.btnSortear.onclick = girarRuleta;
    DOM.btnAnadir.onclick = agregarJugador;
    DOM.btnReiniciar.onclick = reiniciarPartida;
    DOM.opciones.ontransitionend = alTerminarGiro;
});

function agregarJugador() {
    let nombre = "";
    while (!nombre.trim()) {
        const input = prompt('Introduce tu nombre:');
        if (input === null) return;
        nombre = input;
    }
    const id = 'local_' + Math.random().toString(36).substring(2, 9);
    misJugadoresLocales.push({ id, nombre: nombre.trim() });
    localStorage.setItem('trivia_jugadores', JSON.stringify(misJugadoresLocales));
    enviar('join', { id, nombre: nombre.trim() });
}

// ====== WEBSOCKET ======
// Establece la conexión bidireccional con el servidor para el modo multijugador
function conectarWebSocket() {
    ws = new WebSocket(`${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`);
    ws.onopen = () => console.log("Conectado con el Servidor");
    // Cada vez que el servidor nos manda un mensaje, lo procesamos aquí
    ws.onmessage = e => manejarMensaje(JSON.parse(e.data));
    ws.onclose = () => setTimeout(conectarWebSocket, 3000);
}


const enviar = (type, data = {}) => ws?.readyState === WebSocket.OPEN && ws.send(JSON.stringify({ type, ...data }));

// Esta función es el "cerebro" del cliente, reacciona a lo que manda el servidor
function manejarMensaje(msg) {
    switch (msg.type) {
        case 'askName':
            // El servidor nos pide presentarnos al conectarnos
            if (misJugadoresLocales.length === 0) agregarJugador();
            else misJugadoresLocales.forEach(j => enviar('join', j));
            break;

        case 'gameState':
            renderizarLobby(msg.state);
            break;

        case 'ruletaGirando':
            categoriaActual = categorias[msg.randomIdx];
            girosAcumulados = msg.girosAcumulados;
            DOM.btnSortear.style.pointerEvents = 'none';
            DOM.cartelTexto.innerText = "¡Girando...";
            DOM.feedback.className = 'oculto';
            DOM.opciones.style.transform = `rotate(${girosAcumulados}deg)`;
            break;

        case 'mostrarPregunta':
            preguntaActualCorrecta = msg.correcta;
            textoRespuestaCorrecta = msg.respuestas[msg.correcta];
            mostrarModalPregunta(msg);
            break;

        case 'resultadoRespuesta': {
            clearInterval(timerInterval);
            DOM.modal.close();
            const catNombre = categorias.find(c => c.id === msg.categoriaId)?.nombre || msg.categoriaId;
            if (msg.correcta) {
                if (msg.quesitoConseguido) {
                    mostrarFeedback(`✅ ¡${msg.nombre} acertó! (+10 pts)\n🎉 ¡CONSIGUIÓ EL QUESITO DE ${catNombre.toUpperCase()}!`, 'success');
                } else if (msg.intentoQuesitoFallido) {
                    mostrarFeedback(`✅ ¡${msg.nombre} acertó! (+10 pts) (Racha de ${msg.racha} en ${catNombre})\n⚠️ ¡Mala Suerte! No le tocó el quesito.`, 'warning');
                } else {
                    mostrarFeedback(`✅ ¡${msg.nombre} acertó! (+10 pts)`, 'success');
                }
            } else {
                mostrarFeedback(`❌ A ${msg.nombre} ${msg.timeout ? 'se le agotó el tiempo' : 'falló'}.\nCorrecta: "${textoRespuestaCorrecta}".`, 'error');
            }
            break;
        }
    }
}

// ====== RULETA ======
function dibujarRuleta() {
    const grados = 360 / categorias.length;
    const conic = categorias.map((cat, i) => `${cat.color} ${i * grados}deg ${(i + 1) * grados}deg`);
    DOM.opciones.style.background = `conic-gradient(${conic.join(', ')})`;

    categorias.forEach((cat, i) => {
        const sep = document.createElement('div');
        sep.className = 'separador';
        sep.style.transform = `rotate(${i * grados}deg)`;
        DOM.opciones.appendChild(sep);

        const txt = document.createElement('p');
        txt.className = 'nombre';
        txt.innerText = cat.nombre;
        txt.style.transform = `rotate(${i * grados + grados / 2}deg)`;
        DOM.opciones.appendChild(txt);
    });
}

function girarRuleta() {
    if (!ws || !miTurno) return; // Solo puedes girar si estás conectado y es tu turno

    // Elegimos una categoría al azar matemáticamente
    const idx = Math.floor(Math.random() * categorias.length);
    const grados = 360 / categorias.length;

    // Calculamos dónde tiene que parar visualmente la ruleta para señalar la categoría ganadora
    const dest = 360 - (idx * grados + grados / 2);
    let diff = dest - (girosAcumulados % 360);
    if (diff < 0) diff += 360;

    // Avisamos al servidor para que todos los jugadores vean la ruleta girar
    enviar('girarRuleta', { randomIdx: idx, girosAcumulados: girosAcumulados + 1800 + diff });
}

// Se ejecuta automáticamente gracias a 'ontransitionend' cuando la animación CSS termina
function alTerminarGiro() {
    if (categoriaActual) DOM.cartelTexto.innerText = `¡${categoriaActual.nombre}!`;
    if (miTurno) obtenerPregunta(categoriaActual.id);
}

// Hace una petición HTTP (API REST) al servidor para pedir una pregunta de un tema específico
async function obtenerPregunta(tema) {
    try {
        const res = await fetch(`/pregunta/${tema}`);
        if (!res.ok) throw new Error();
        // Una vez tengo la pregunta, aviso por WebSocket para que todos la vean en sus pantallas
        enviar('preguntaObtenida', await res.json());
    } catch {
        DOM.cartelTexto.innerText = "Error de conexión";
    }
}

// ====== INTERFAZ ======
function renderizarLobby(state) {
    const act = state.jugadorTurnoActual;
    if (!act) {
        DOM.turno.innerText = "Esperando jugadores...";
        DOM.turno.style.color = "#fbbf24";
        DOM.btnSortear.style.pointerEvents = 'none';
        return;
    }

    miTurno = misJugadoresLocales.some(j => j.id === act.id);
    DOM.turno.innerText = miTurno ? `¡TURNO DE ${act.nombre.toUpperCase()}!` : `Turno de: ${act.nombre}`;
    DOM.turno.style.color = miTurno ? "#4ade80" : "#fbbf24";
    DOM.btnSortear.style.pointerEvents = miTurno ? 'auto' : 'none';
    DOM.cartelTexto.innerText = miTurno ? '¡Click en "GIRAR"!' : "Esperando...";
    $('puntos-display').innerText = act.puntos;

    // Quesitos del jugador activo
    document.querySelectorAll('.quesito-icono').forEach(el => el.classList.remove('conseguido'));
    Object.entries(act.quesitosObj).forEach(([tema, ok]) => ok && $(`q-${tema}`)?.classList.add('conseguido'));

    // Victoria
    const gano = Object.values(act.quesitosObj).every(Boolean);
    DOM.ruletaWrapper.style.display = gano ? 'none' : 'flex';
    DOM.victoria.classList.toggle('oculto', !gano);
    if (gano) {
        DOM.victoria.innerHTML = `
            <h2>¡${act.nombre.toUpperCase()} HA GANADO!</h2>
            <p>Consiguió todos los quesitos.</p>
            ${miTurno ? '<button id="btn-guardar-ranking" class="btn-primary" style="margin-top:15px;">Guardar en Ranking Global</button>' : ''}
        `;
        if (miTurno) $('btn-guardar-ranking')?.addEventListener('click', () => guardarRanking(act));
    }

    // Lista de jugadores ordenada por puntos
    const ordenados = [...state.jugadores].sort((a, b) => b.puntos - a.puntos);
    DOM.listaSala.innerHTML = ordenados.map(j => {
        const esTurno = state.jugadores.indexOf(j) === state.turnoActualIndex;
        const esLocal = misJugadoresLocales.some(l => l.id === j.id);
        const minis = categorias.map(cat =>
            `<div class="quesito-mini ${cat.id} ${j.quesitosObj[cat.id] ? 'conseguido' : ''}" title="${cat.nombre}"></div>`
        ).join('');

        return `<li class="${esTurno ? 'turno-activo' : ''}">
            <div class="jugador-info-fila">
                <span><strong>${j.nombre}</strong>${esLocal ? ' <span class="player-tag-you">Tú</span>' : ''}</span>
                <span>${j.puntos} pts</span>
            </div>
            <div class="quesitos-mini-container">${minis}</div>
        </li>`;
    }).join('');
}

const mostrarFeedback = (msg, tipo) => {
    DOM.feedback.innerText = msg;
    DOM.feedback.className = tipo;
};

// ====== MODAL DE PREGUNTAS ======
// Abre el cuadro de diálogo (modal) en la pantalla de todos y arranca el cronómetro
function mostrarModalPregunta(datos) {
    $('tema-pregunta').innerText = categoriaActual.nombre;
    $('texto-pregunta').innerText = datos.pregunta;

    const ops = $('opciones-respuestas');
    ops.innerHTML = ""; // Limpiamos opciones anteriores

    datos.respuestas.forEach((resp, idx) => {
        const btn = document.createElement('button');
        btn.innerText = resp;

        if (miTurno) btn.onclick = () => validarRespuesta(idx);
        else btn.style.cssText = "opacity:0.7;cursor:not-allowed;"; // Los demás lo ven desactivado
        ops.appendChild(btn);
    });

    DOM.modal.showModal();

    // Cuenta atrás de 20 segundos
    let segs = 20;
    DOM.timer.innerText = segs;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        DOM.timer.innerText = --segs;
        if (segs <= 0) {
            clearInterval(timerInterval);
            // Si se acaba el tiempo y es mi turno, envío -1 como fallo por timeout
            if (miTurno) validarRespuesta(-1);
        }
    }, 1000);
}

// Envía al servidor la información de si acerté o fallé (y si fue por tiempo)
function validarRespuesta(idx) {
    if (!miTurno) return;
    clearInterval(timerInterval);
    enviar('respuestaValidada', {
        correcta: idx === preguntaActualCorrecta,
        categoriaId: categoriaActual.id,
        timeout: idx === -1
    });
}

// ====== ALMACENAMIENTO Y REINICIO ======
function cargarJugadoresDeStorage() {
    try { misJugadoresLocales = JSON.parse(localStorage.getItem('trivia_jugadores')) || []; }
    catch { misJugadoresLocales = []; }
}

function reiniciarPartida() {
    if (confirm('¿Reiniciar juego y borrar jugadores locales?')) {
        localStorage.removeItem('trivia_jugadores');
        location.reload();
    }
}

async function guardarRanking(jugador) {
    try {
        const res = await fetch('/puntuacion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: jugador.nombre,
                puntos: jugador.puntos,
                quesitos: Object.keys(jugador.quesitosObj).filter(k => jugador.quesitosObj[k])
            })
        });
        if (!res.ok) throw new Error();
        const data = await res.json();

        const btn = $('btn-guardar-ranking');
        if (btn) {
            btn.innerText = "¡Puntuación Guardada!";
            btn.disabled = true;
            btn.style.cssText = "opacity:0.5;cursor:not-allowed;";
        }
        mostrarFeedback(data.mensaje + ". ¡Felicidades!", 'success');
    } catch {
        alert("No se pudo conectar con el servidor para guardar el ranking.");
    }
}
