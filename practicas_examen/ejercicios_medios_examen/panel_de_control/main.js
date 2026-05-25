import { login, getSecret } from './api.js';

const btn = document.getElementById('btn-secret');
const list = document.getElementById('secret-list');
const welcome = document.getElementById('welcome');


async function showData() {
    list.innerHTML = 'Cargando secretos...';
    const users = await getSecret();
    list.innerHTML = '';
    users.forEach(u => {
        list.innerHTML += `<li>Agente: ${u.name} (Código: ${u.address.zipcode})</li>`;
    });
}


document.addEventListener('DOMContentLoaded', () => {
    if (document.cookie.includes('session_user=')) {
        const user = document.cookie.split('session_user=')[1].split(';')[0];
        welcome.textContent = `Usuario: ${user}`;
        welcome.style.color = 'green';
        btn.style.display = 'none'; 
        showData();
    }
});

btn.addEventListener('click', async () => {
    const user = prompt("Usuario:");
    if (!user) return;

    const result = await login(user);

    if (result && result.username) {
        document.cookie = `session_user=${result.username}; max-age=3600; path=/`;
        
        welcome.textContent = `Usuario: ${result.username}`;
        btn.style.display = 'none';
        showData();
    } else {
        alert("Error de conexión");
    }
});