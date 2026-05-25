// ==========================================================
// ====== ESTADO DEL JUEGO Y CONFIGURACIÓN ==================
// ==========================================================
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

// Selectores del DOM agrupados para máxima simplicidad
const $ = id => document.getElementById(id);
const DOM = {
    opcionesContainer: $('opcionesContainer'), btnSortear: $('sortear'), cartelTexto: $('ganadorTexto'),
    modalPregunta: $('modal-pregunta'), feedbackContainer: $('feedback-container'), btnAnadirJugador: $('btn-anadir-jugador'),
    btnReiniciar: $('btn-reiniciar'), ruletaWrapper: $('ruleta-wrapper'), mensajeVictoria: $('mensaje-victoria'),
    temporizadorUI: $('temporizador'), indicadorTurno: $('indicador-turno'), listaSala: $('lista-sala')
};

let ws = null;

// Inicialización de Eventos y Carga de Componentes
document.addEventListener('DOMContentLoaded', () => {
    cargarJugadoresLocalesDeStorage();
    dibujarRuleta();
    conectarWebSocket();
    DOM.btnSortear.onclick = girarRuleta;
    DOM.btnAnadirJugador.onclick = agregarJugadorLocal;
    DOM.btnReiniciar.onclick = reiniciarPartidaLocal;
    DOM.opcionesContainer.ontransitionend = alTerminarGiro; // Fin de animación de ruleta
});

// Añadir un nuevo jugador a este cliente
function agregarJugadorLocal() {
    let nombre = "";
    while (!nombre.trim()) {
        const input = prompt('Introduce tu nombre:');
        if (input === null) return;
        nombre = input;
    }
    const localId = 'local_' + Math.random().toString(36).substring(2, 9);
    misJugadoresLocales.push({ id: localId, nombre: nombre.trim() });
    guardarJugadoresLocalesEnStorage();
    enviarMensaje('join', { id: localId, nombre: nombre.trim() });
}

// ==========================================================
// ====== LOGICA DE CONEXIÓN WEBSOCKET =======================
// ==========================================================
function conectarWebSocket() {
    ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`);
    ws.onopen = () => console.log("Conectado con el Servidor");
    ws.onmessage = e => manejarMensaje(JSON.parse(e.data));
    ws.onclose = () => setTimeout(conectarWebSocket, 3000); // Reintento de conexión automática
}

const enviarMensaje = (type, data = {}) => ws?.readyState === WebSocket.OPEN && ws.send(JSON.stringify({ type, ...data }));

// Manejador centralizado de mensajes recibidos por WebSockets
function manejarMensaje(msg) {
    const { type, state, randomIdx, girosAcumulados: nuevosGiros, correcta, respuestas, nombre, timeout, quesitoConseguido, categoriaId } = msg;

    if (type === 'askName') {
        if (misJugadoresLocales.length === 0) agregarJugadorLocal();
        else misJugadoresLocales.forEach(j => enviarMensaje('join', j));
    } else if (type === 'gameState') {
        renderizarLobby(state);
        renderizarRanking(state.rankingGlobal || []);
    } else if (type === 'ruletaGirando') {
        categoriaActual = categorias[randomIdx];
        girosAcumulados = nuevosGiros;
        DOM.btnSortear.style.pointerEvents = 'none';
        DOM.cartelTexto.innerText = "¡Girando...";
        DOM.feedbackContainer.className = 'oculto';
        DOM.opcionesContainer.style.transform = `rotate(${girosAcumulados}deg)`;
    } else if (type === 'mostrarPregunta') {
        preguntaActualCorrecta = correcta;
        textoRespuestaCorrecta = respuestas[correcta];
        mostrarModalPregunta(msg);
    } else if (type === 'resultadoRespuesta') {
        clearInterval(timerInterval);
        DOM.modalPregunta.close();
        const catNombre = categorias.find(c => c.id === categoriaId)?.nombre || categoriaId;
        if (correcta) {
            mostrarMensaje(`✅ ¡${nombre} acertó! (+10 pts)${quesitoConseguido ? `\n🎉 ¡CONSIGUIÓ EL QUESITO DE ${catNombre.toUpperCase()}!` : ''}`, 'success');
        } else {
            mostrarMensaje(`❌ A ${nombre} ${timeout ? 'se le agotó el tiempo' : 'falló'}.\nCorrecta: "${textoRespuestaCorrecta}".`, 'error');
        }
    }
}

// ==========================================================
// ====== DIBUJO Y LOGICA DE LA RULETA ======================
// ==========================================================
function dibujarRuleta() {
    const grados = 360 / categorias.length;
    let conic = [];
    categorias.forEach((cat, idx) => {
        conic.push(`${cat.color} ${idx * grados}deg ${(idx + 1) * grados}deg`);

        const sep = document.createElement('div');
        sep.className = 'separador';
        sep.style.transform = `rotate(${idx * grados}deg)`;
        DOM.opcionesContainer.appendChild(sep);

        const txt = document.createElement('p');
        txt.className = 'nombre';
        txt.innerText = cat.nombre;
        txt.style.transform = `rotate(${idx * grados + grados / 2}deg)`;
        DOM.opcionesContainer.appendChild(txt);
    });
    DOM.opcionesContainer.style.background = `conic-gradient(${conic.join(', ')})`;
}

function girarRuleta() {
    if (!ws || !miTurno) return;
    const idx = Math.floor(Math.random() * categorias.length);
    const grados = 360 / categorias.length;
    const dest = 360 - (idx * grados + grados / 2);
    let diff = dest - (girosAcumulados % 360);
    if (diff < 0) diff += 360;
    enviarMensaje('girarRuleta', { randomIdx: idx, girosAcumulados: girosAcumulados + 1800 + diff });
}

function alTerminarGiro() {
    if (categoriaActual) DOM.cartelTexto.innerText = `¡${categoriaActual.nombre}!`;
    if (miTurno) obtenerPreguntaDelServidor(categoriaActual.id);
}

// Obtener pregunta REST del servidor Express
async function obtenerPreguntaDelServidor(tema) {
    try {
        const res = await fetch(`/pregunta/${tema}`);
        if (!res.ok) throw new Error();
        enviarMensaje('preguntaObtenida', await res.json());
    } catch {
        DOM.cartelTexto.innerText = "Error de conexión";
    }
}

// ==========================================================
// ====== RENDERIZADO DE COMPONENTES DE INTERFAZ ============
// ==========================================================
function renderizarLobby(state) {
    const act = state.jugadorTurnoActual;
    if (!act) {
        DOM.indicadorTurno.innerText = "Esperando jugadores...";
        DOM.indicadorTurno.style.color = "#fbbf24";
        DOM.btnSortear.style.pointerEvents = 'none';
        return;
    }

    miTurno = misJugadoresLocales.some(j => j.id === act.id);
    DOM.indicadorTurno.innerText = miTurno ? `¡TURNO DE ${act.nombre.toUpperCase()}!` : `Turno de: ${act.nombre}`;
    DOM.indicadorTurno.style.color = miTurno ? "#4ade80" : "#fbbf24";
    DOM.btnSortear.style.pointerEvents = miTurno ? 'auto' : 'none';
    DOM.cartelTexto.innerText = miTurno ? '¡Click en "GIRAR"!' : "Esperando...";

    $('puntos-display').innerText = act.puntos;

    // Resetear e iluminar quesitos
    document.querySelectorAll('.quesito-icono').forEach(el => el.classList.remove('conseguido'));
    Object.entries(act.quesitosObj).forEach(([tema, ok]) => ok && $(`q-${tema}`)?.classList.add('conseguido'));

    // Estado de Victoria
    const gano = Object.values(act.quesitosObj).every(Boolean);
    DOM.ruletaWrapper.style.display = gano ? 'none' : 'flex';
    DOM.mensajeVictoria.classList.toggle('oculto', !gano);
    if (gano) {
        DOM.mensajeVictoria.innerHTML = `<h2>¡${act.nombre.toUpperCase()} HA GANADO!</h2><p>Consiguió todos los quesitos.</p>`;
    }

    // Listado de la sala de espera
    DOM.listaSala.innerHTML = state.jugadores.map((j, idx) => {
        const esTurno = idx === state.turnoActualIndex;
        const esLocal = misJugadoresLocales.some(l => l.id === j.id);
        const qCount = Object.values(j.quesitosObj).filter(Boolean).length;
        return `<li class="${esTurno ? 'turno-activo' : ''}">
            <span><strong>${j.nombre}</strong>${esLocal ? ' <span class="player-tag-you">Tú</span>' : ''}</span>
            <span>${j.puntos} pts | 🧀 ${qCount}/7</span>
        </li>`;
    }).join('');
}

const mostrarMensaje = (msg, tipo) => {
    DOM.feedbackContainer.innerText = msg;
    DOM.feedbackContainer.className = tipo;
};

// ==========================================================
// ====== DIALOG DE PREGUNTAS Y TEMPORIZADOR ================
// ==========================================================
function mostrarModalPregunta(datos) {
    $('tema-pregunta').innerText = categoriaActual.nombre;
    $('texto-pregunta').innerText = datos.pregunta;

    const ops = $('opciones-respuestas');
    ops.innerHTML = "";
    datos.respuestas.forEach((resp, idx) => {
        const btn = document.createElement('button');
        btn.innerText = resp;
        if (miTurno) btn.onclick = () => validarRespuesta(idx);
        else btn.style.cssText = "opacity: 0.7; cursor: not-allowed;";
        ops.appendChild(btn);
    });

    DOM.modalPregunta.showModal();

    let segs = 20;
    DOM.temporizadorUI.innerText = segs;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        DOM.temporizadorUI.innerText = --segs;
        if (segs <= 0) {
            clearInterval(timerInterval);
            if (miTurno) validarRespuesta(-1); // Responde timeout automáticamente
        }
    }, 1000);
}

function validarRespuesta(idx) {
    if (!miTurno) return;
    clearInterval(timerInterval);
    enviarMensaje('respuestaValidada', {
        correcta: idx === preguntaActualCorrecta,
        categoriaId: categoriaActual.id,
        timeout: idx === -1
    });
}

function renderizarRanking(tabla) {
    const listHtml = tabla.map(j => `<li><strong>${j.nombre}</strong>: ${j.puntos} pts (${j.quesitos}/7)</li>`).join('');
    $('ranking-lista').innerHTML = `<ol>${listHtml}</ol>`;
}

// ==========================================================
// ====== ALMACENAMIENTO Y REINICIO =========================
// ==========================================================
function cargarJugadoresLocalesDeStorage() {
    try {
        misJugadoresLocales = JSON.parse(localStorage.getItem('trivia_jugadores')) || [];
    } catch {
        misJugadoresLocales = [];
    }
}

const guardarJugadoresLocalesEnStorage = () => localStorage.setItem('trivia_jugadores', JSON.stringify(misJugadoresLocales));

function reiniciarPartidaLocal() {
    if (confirm('¿Reiniciar juego y borrar jugadores locales?')) {
        localStorage.removeItem('trivia_jugadores');
        window.location.reload();
    }
}
