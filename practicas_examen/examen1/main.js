/**
 * Main.js - Punto de entrada de la aplicación
 * Importa todos los módulos necesarios y configura los event listeners
 */

// ==================== IMPORTS ====================
// Importamos la clase Ticket para crear objetos Ticket
import { Ticket } from './Ticket.js';

// Importamos las funciones de la API para comunicarnos con el servidor
import { fetchTickets, loginUser } from './api.js';

// Importamos las funciones de cookies para gestionar la sesión
import { setCookie, getCookie, deleteCookie } from './cookies.js';

// ==================== VARIABLES GLOBALES ====================
// Array para almacenar todos los tickets cargados
let tickets = [];

// ==================== REFERENCIAS AL DOM ====================
// Obtenemos referencias a los elementos del HTML que vamos a manipular
const btnLoad = document.getElementById('btn-load');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const filterPriority = document.getElementById('filter-priority');
const ticketContainer = document.getElementById('ticket-container');
const welcomeMsg = document.getElementById('welcome-msg');
const totalHours = document.getElementById('total-hours');
const notificationArea = document.getElementById('notification-area');

// ==================== FUNCIONES ====================

/**
 * Función de inicialización
 * Se ejecuta cuando el DOM está completamente cargado
 * Configura el estado inicial de la aplicación
 */
function init() {
    // Verificamos si hay una sesión guardada en cookies
    const savedUser = getCookie('username');
    const savedToken = getCookie('token');
    
    if (savedUser && savedToken) {
        // Si hay sesión guardada, mostramos el usuario como logueado
        showLoggedInState(savedUser);
    }
    
    console.log('Aplicación inicializada');
}

/**
 * Carga los tickets desde el servidor y los muestra
 */
async function loadTickets() {
    // Obtenemos los tickets del servidor
    const ticketsData = await fetchTickets();
    
    // Convertimos cada objeto plano en una instancia de Ticket
    tickets = ticketsData.map(data => new Ticket(data));
    
    // Mostramos los tickets en el contenedor
    renderTickets(tickets);
    
    // Calculamos el total de horas
    calculateTotalHours(tickets);
    
    // Mostramos notificación de éxito
    showNotification('Tickets cargados correctamente', 'success');
}

/**
 * Renderiza los tickets en el contenedor HTML
 */
function renderTickets(ticketsToRender) {
    // Limpiamos el contenedor
    ticketContainer.innerHTML = '';
    
    // Añadimos el HTML de cada ticket
    ticketsToRender.forEach(ticket => {
        ticketContainer.innerHTML += ticket.renderHTML();
    });
}

/**
 * Filtra los tickets por prioridad
 */
function filterTickets(priority) {
    if (priority === 'all') {
        // Si es 'all', mostramos todos los tickets
        renderTickets(tickets);
        calculateTotalHours(tickets);
    } else {
        // Filtramos solo los tickets con la prioridad seleccionada
        const filtered = tickets.filter(ticket => ticket.priority === priority);
        renderTickets(filtered);
        calculateTotalHours(filtered);
    }
}

/**
 * Calcula el total de horas estimadas
 */
function calculateTotalHours(ticketsToSum) {
    // reduce() suma todas las horas de los tickets
    const total = ticketsToSum.reduce((sum, ticket) => sum + ticket.hours, 0);
    totalHours.textContent = total;
}

/**
 * Maneja el proceso de login
 */
async function handleLogin() {
    // Pedimos usuario y contraseña con prompts
    const user = prompt('Usuario:');
    const pass = prompt('Contraseña:');
    
    if (!user || !pass) {
        showNotification('Debes introducir usuario y contraseña', 'error');
        return;
    }
    
    // Intentamos hacer login
    const result = await loginUser(user, pass);
    
    if (result.ok) {
        // Login exitoso: guardamos en cookies y actualizamos UI
        setCookie('username', result.username, 3600); // 1 hora
        setCookie('token', result.token, 3600);
        
        showLoggedInState(result.username);
        showNotification(`Bienvenido, ${result.username}!`, 'success');
    } else {
        // Login fallido: mostramos error
        showNotification(result.message, 'error');
    }
}

/**
 * Maneja el proceso de logout
 */
function handleLogout() {
    // Eliminamos las cookies de sesión
    deleteCookie('username');
    deleteCookie('token');
    
    // Actualizamos la UI al estado de invitado
    showLoggedOutState();
    showNotification('Sesión cerrada', 'success');
}

/**
 * Actualiza la UI para mostrar estado de usuario logueado
 */
function showLoggedInState(username) {
    welcomeMsg.textContent = `Hola, ${username}`;
    btnLogin.style.display = 'none';
    btnLogout.style.display = 'inline-block';
}

/**
 * Actualiza la UI para mostrar estado de invitado
 */
function showLoggedOutState() {
    welcomeMsg.textContent = 'Invitado';
    btnLogin.style.display = 'inline-block';
    btnLogout.style.display = 'none';
}

/**
 * Muestra una notificación en el área de notificaciones
 */
function showNotification(message, type) {
    notificationArea.textContent = message;
    notificationArea.className = type; // Aplica clase 'success' o 'error'
    notificationArea.style.display = 'block';
    
    // Ocultamos la notificación después de 3 segundos
    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 3000);
}

// ==================== EVENT LISTENERS ====================

// Esperamos a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Inicializamos la aplicación
    init();
    
    // Botón para cargar tickets
    btnLoad.addEventListener('click', () => {
        loadTickets();
    });
    
    // Botón de login
    btnLogin.addEventListener('click', () => {
        handleLogin();
    });
    
    // Botón de logout
    btnLogout.addEventListener('click', () => {
        handleLogout();
    });
    
    // Filtro por prioridad (select)
    filterPriority.addEventListener('change', (e) => {
        // e.target.value contiene la opción seleccionada
        filterTickets(e.target.value);
    });
});
