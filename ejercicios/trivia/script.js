// ====== ESTADO DEL JUEGO ======
let misJugadoresLocales = [];
let miTurno = false;
let preguntaActualCorrecta = null;
let textoRespuestaCorrecta = "";
let categoriaActual = null;
let girosAcumulados = 0;
let timerInterval;

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
const feedbackContainer = document.getElementById('feedback-container');
const btnAnadirJugador = document.getElementById('btn-anadir-jugador');
const btnReiniciar = document.getElementById('btn-reiniciar');
const btnSaltarTurno = document.getElementById('btn-saltar-turno');
const inviteUrlInput = document.getElementById('invite-url');
const btnCopyInvite = document.getElementById('btn-copy-invite');
const ruletaWrapper = document.getElementById('ruleta-wrapper');
const mensajeVictoria = document.getElementById('mensaje-victoria');
const temporizadorUI = document.getElementById('temporizador');
const indicadorTurno = document.getElementById('indicador-turno');
const listaSala = document.getElementById('lista-sala');

// ====== INICIALIZACIÓN ======
document.addEventListener('DOMContentLoaded', () => {
    cargarJugadoresLocalesDeStorage();
    cargarEnlaceInvitacion();
    dibujarRuleta();
    btnSortear.addEventListener('click', girarRuleta);
    btnAnadirJugador.addEventListener('click', agregarJugadorLocal);
    if (btnReiniciar) btnReiniciar.addEventListener('click', reiniciarPartidaLocal);
    if (btnSaltarTurno) btnSaltarTurno.addEventListener('click', saltarTurnoDesconectado);
    if (btnCopyInvite) btnCopyInvite.addEventListener('click', copiarEnlaceInvitacion);
    opcionesContainer.addEventListener('transitionend', alTerminarGiro);
});

function agregarJugadorLocal() {
    let nombre = "";
    while (!nombre) {
        nombre = prompt('Nuevo jugador. Introduce su nombre:');
        if (nombre === null) return;
        nombre = nombre ? nombre.trim() : '';
    }

    if (nombre) {
        const localId = 'local_' + Math.random().toString(36).substr(2, 9);
        misJugadoresLocales.push({ id: localId, nombre: nombre });
        guardarJugadoresLocalesEnStorage();
        if (socket && conectado) {
            socket.emit('join', { id: localId, nombre: nombre });
        }
        mostrarMensaje('Jugador añadido: ' + nombre, 'info');
    }
}

// ====== SOCKET.IO ======
const socket = (typeof io !== 'undefined') ? io() : null;
let conectado = false;

if (socket) {
    socket.on('connect', () => {
        console.log('Conectado al servidor');
        conectado = true;
    });

    socket.on('askName', () => {
        conectado = true;
        cargarJugadoresLocalesDeStorage();
        if (misJugadoresLocales.length === 0) {
            agregarJugadorLocal();
        } else {
            misJugadoresLocales.forEach(j => {
                socket.emit('join', { id: j.id, nombre: j.nombre });
            });
        }
    });

    socket.on('gameState', (state) => {
        renderizarLobby(state);
        renderizarRanking(state.rankingGlobal || []);
    });

    socket.on('ruletaGirando', (data) => {
        // data: { randomIdx, girosAcumulados }
        categoriaActual = categorias[data.randomIdx];
        girosAcumulados = data.girosAcumulados;
        
        btnSortear.style.pointerEvents = 'none';
        cartelTexto.innerText = "¡Girando...";
        feedbackContainer.className = 'oculto';
        
        opcionesContainer.style.transform = `rotate(${girosAcumulados}deg)`;
    });

    socket.on('mostrarPregunta', (datos) => {
        preguntaActualCorrecta = datos.correcta;
        textoRespuestaCorrecta = datos.respuestas[datos.correcta];
        mostrarModalPregunta(datos);
    });

    socket.on('resultadoRespuesta', (data) => {
        // data: { nombre, correcta, timeout, quesitoConseguido, categoriaId }
        clearInterval(timerInterval);
        modalPregunta.close();
        
        const catNombre = categorias.find(c => c.id === data.categoriaId)?.nombre || data.categoriaId;

        if (data.correcta) {
            let msg = `✅ ¡${data.nombre} acertó! (+10 pts)`;
            if (data.quesitoConseguido) msg += `\n🎉 ¡${data.nombre} CONSIGUIÓ EL QUESITO DE ${catNombre.toUpperCase()}!`;
            mostrarMensaje(msg, 'success');
        } else {
            if (data.timeout) {
                mostrarMensaje(`⏳ A ${data.nombre} se le agotó el tiempo.\nLa respuesta era: "${textoRespuestaCorrecta}".`, 'error');
            } else {
                mostrarMensaje(`❌ ${data.nombre} falló.\nLa respuesta era: "${textoRespuestaCorrecta}".`, 'error');
            }
        }
    });
}

function renderizarLobby(state) {
    if (!state.jugadorTurnoActual) {
        if(indicadorTurno) indicadorTurno.innerText = "Esperando jugadores...";
        btnSortear.style.pointerEvents = 'none';
        if(btnSaltarTurno) btnSaltarTurno.classList.add('oculto');
        return;
    }

    miTurno = misJugadoresLocales.some(j => j.id === state.jugadorTurnoActual.id);
    
    if(indicadorTurno) {
        if (miTurno) {
            indicadorTurno.innerText = `¡TURNO DE ${state.jugadorTurnoActual.nombre.toUpperCase()}!`;
            indicadorTurno.style.color = "#4ade80";
            btnSortear.style.pointerEvents = 'auto';
            cartelTexto.innerText = "¡Click en \"GIRAR\"!";
        } else {
            indicadorTurno.innerText = `Turno de: ${state.jugadorTurnoActual.nombre}`;
            indicadorTurno.style.color = "#fbbf24";
            btnSortear.style.pointerEvents = 'none';
            cartelTexto.innerText = "Esperando...";
        }
    }

    // Mostrar/ocultar botón de saltar turno si el jugador actual está desconectado
    if (btnSaltarTurno) {
        if (state.jugadorTurnoActual.desconectado) {
            btnSaltarTurno.classList.remove('oculto');
            btnSaltarTurno.innerText = `Saltar Turno de ${state.jugadorTurnoActual.nombre} ⏳`;
        } else {
            btnSaltarTurno.classList.add('oculto');
        }
    }

    // Actualizar mis marcadores locales visuales basados en el JUGADOR ACTIVO
    const jugadorActivo = state.jugadorTurnoActual;
    if (jugadorActivo) {
        document.getElementById('puntos-display').innerText = jugadorActivo.puntos;
        
        // Quesitos
        document.querySelectorAll('.quesito-icono').forEach(el => el.classList.remove('conseguido'));
        Object.keys(jugadorActivo.quesitosObj).forEach(tema => {
            if (jugadorActivo.quesitosObj[tema]) {
                const icono = document.getElementById(`q-${tema}`);
                if (icono) icono.classList.add('conseguido');
            }
        });

        // Comprobar victoria
        const todosConseguidos = Object.values(jugadorActivo.quesitosObj).every(Boolean);
        if (todosConseguidos && ruletaWrapper) {
            ruletaWrapper.style.display = 'none';
            if(mensajeVictoria) {
                mensajeVictoria.innerHTML = `<h2>¡${jugadorActivo.nombre.toUpperCase()} HA GANADO!</h2><p>Ha conseguido todos los quesitos.</p>`;
                mensajeVictoria.classList.remove('oculto');
            }
            btnSortear.style.pointerEvents = 'none';
        } else if (ruletaWrapper && ruletaWrapper.style.display === 'none') {
            ruletaWrapper.style.display = 'flex';
            if(mensajeVictoria) mensajeVictoria.classList.add('oculto');
        }
    }

    // Actualizar lista de la sala
    if(listaSala) {
        let htmlSala = "";
        state.jugadores.forEach((j, index) => {
            const esTurno = index === state.turnoActualIndex;
            const esLocal = misJugadoresLocales.some(local => local.id === j.id);
            const qCount = Object.values(j.quesitosObj).filter(Boolean).length;
            
            let badges = "";
            let kickBtn = "";
            
            if (esLocal) {
                badges += `<span class="player-tag-you">Tú</span>`;
            }
            if (j.desconectado) {
                badges += `<span class="player-status-offline">(Desconectado)</span>`;
                kickBtn = `<button class="btn-kick" onclick="eliminarJugadorDesconectado('${j.id}')">Eliminar</button>`;
            }
            
            htmlSala += `<li class="${esTurno ? 'turno-activo' : ''}">
                <span><strong>${j.nombre}</strong>${badges}</span>
                <span>${j.puntos} pts | 🧀 ${qCount}/6 ${kickBtn}</span>
            </li>`;
        });
        listaSala.innerHTML = htmlSala;
    }
}

function mostrarMensaje(mensaje, tipo) {
    if(!feedbackContainer) return;
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
    if (!conectado || !miTurno) return;
    
    const randomIdx = Math.floor(Math.random() * categorias.length);
    const gradosPorOpcion = 360 / categorias.length;
    const offsetCentro = gradosPorOpcion / 2;
    const anguloDestino = 360 - (randomIdx * gradosPorOpcion + offsetCentro);
    const anguloActual = girosAcumulados % 360;
    
    let giroNecesario = anguloDestino - anguloActual;
    if (giroNecesario < 0) giroNecesario += 360;
    
    const vueltasExtra = 360 * 5;
    const nuevosGiros = girosAcumulados + vueltasExtra + giroNecesario;

    socket.emit('girarRuleta', { randomIdx, girosAcumulados: nuevosGiros });
}

function alTerminarGiro() {
    if (miTurno) {
        cartelTexto.innerText = `¡${categoriaActual.nombre}!`;
        obtenerPreguntaDelServidor(categoriaActual.id);
    }
}

async function obtenerPreguntaDelServidor(tema) {
    try {
        const respuesta = await fetch(`/pregunta/${tema}`);
        if (!respuesta.ok) throw new Error("Categoría vacía");
        
        const datos = await respuesta.json();
        socket.emit('preguntaObtenida', datos);
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
        
        if (miTurno) {
            btn.onclick = () => validarRespuesta(index);
        } else {
            btn.style.opacity = "0.7";
            btn.style.cursor = "not-allowed";
        }
        
        contenedorOpciones.appendChild(btn);
    });
    
    modalPregunta.showModal();

    if (temporizadorUI) {
        let tiempoRestante = 20; // 20 segundos según los requisitos
        temporizadorUI.innerText = tiempoRestante;
        clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            tiempoRestante--;
            temporizadorUI.innerText = tiempoRestante;
            if (tiempoRestante <= 0) {
                clearInterval(timerInterval);
                if (miTurno) {
                    validarRespuesta(-1);
                }
            }
        }, 1000);
    }
}

function validarRespuesta(indexSeleccionado) {
    if (!miTurno) return;
    
    clearInterval(timerInterval);
    const correcta = (indexSeleccionado === preguntaActualCorrecta);
    const timeout = (indexSeleccionado === -1);
    
    socket.emit('respuestaValidada', {
        correcta: correcta,
        categoriaId: categoriaActual.id,
        timeout: timeout
    });
}

function renderizarRanking(tabla) {
    const divLista = document.getElementById('ranking-lista');
    if(!divLista) return;
    let html = "<ol>";
    tabla.forEach(j => {
        html += `<li><strong>${j.nombre}</strong>: ${j.puntos} pts (${j.quesitos}/6)</li>`;
    });
    divLista.innerHTML = html + "</ol>";
}

// ====== FUNCIONES AUXILIARES MULTIJUGADOR ======
function cargarJugadoresLocalesDeStorage() {
    const almacenados = localStorage.getItem('trivia_jugadores_locales');
    if (almacenados) {
        try {
            misJugadoresLocales = JSON.parse(almacenados);
        } catch (e) {
            misJugadoresLocales = [];
        }
    }
    
    // Soporte para registrar un jugador automáticamente mediante parámetro de URL (ej. ?name=Jugador1)
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get('name');
    if (nameParam && nameParam.trim()) {
        const nombreLimpio = nameParam.trim();
        const existe = misJugadoresLocales.some(j => j.nombre.toLowerCase() === nombreLimpio.toLowerCase());
        if (!existe) {
            const localId = 'local_' + Math.random().toString(36).substr(2, 9);
            misJugadoresLocales.push({ id: localId, nombre: nombreLimpio });
            guardarJugadoresLocalesEnStorage();
        }
    }
}

// Guardar lista en localStorage
function guardarJugadoresLocalesEnStorage() {
    localStorage.setItem('trivia_jugadores_locales', JSON.stringify(misJugadoresLocales));
}

// Limpiar localStorage y reiniciar
function reiniciarPartidaLocal() {
    if (confirm('¿Estás seguro de que quieres reiniciar el juego y borrar todos los jugadores locales de este navegador?')) {
        localStorage.removeItem('trivia_jugadores_locales');
        misJugadoresLocales = [];
        window.location.reload();
    }
}

// Copiar URL de invitación
function copiarEnlaceInvitacion() {
    if (!inviteUrlInput) return;
    inviteUrlInput.select();
    inviteUrlInput.setSelectionRange(0, 99999); // Para móviles
    navigator.clipboard.writeText(inviteUrlInput.value)
        .then(() => {
            btnCopyInvite.innerText = "¡Copiado!";
            btnCopyInvite.classList.add('copied');
            setTimeout(() => {
                btnCopyInvite.innerText = "Copiar Enlace";
                btnCopyInvite.classList.remove('copied');
            }, 2000);
        })
        .catch(err => {
            console.error('Error al copiar el enlace: ', err);
        });
}

// Obtener enlace de invitación desde backend o usar el origin actual si es remoto
async function cargarEnlaceInvitacion() {
    if (!inviteUrlInput) return;
    try {
        let url;
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            url = window.location.origin;
        } else {
            const res = await fetch('/invite-info');
            if (!res.ok) throw new Error('Error en endpoint');
            const data = await res.json();
            url = data.url;
        }
        inviteUrlInput.value = url;
    } catch (e) {
        console.error('Error cargando enlace de invitación:', e);
        inviteUrlInput.value = window.location.origin;
    }
}

// Emitir evento socket para avanzar el turno de un jugador desconectado
function saltarTurnoDesconectado() {
    if (socket && conectado) {
        socket.emit('saltarTurno');
    }
}

// Eliminar jugador desconectado de la lista
function eliminarJugadorDesconectado(idJugador) {
    if (confirm('¿Quieres eliminar permanentemente a este jugador desconectado de la partida?')) {
        const esLocal = misJugadoresLocales.some(j => j.id === idJugador);
        if (esLocal) {
            misJugadoresLocales = misJugadoresLocales.filter(j => j.id !== idJugador);
            guardarJugadoresLocalesEnStorage();
        }
        if (socket && conectado) {
            socket.emit('eliminarJugador', idJugador);
        }
    }
}