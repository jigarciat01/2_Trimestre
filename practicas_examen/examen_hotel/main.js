import Room from './room.js';
import { cargarhabitacion, login } from './api.js';


let roomsdata = []; 

const grid = document.getElementById('rooms-grid');
const btnLoad = document.getElementById('btn-load');
const filterSelect = document.getElementById('filter-type');
const totalRevenueSpan = document.getElementById('total-revenue');
const btnLogin = document.getElementById('btn-login');
const userDisplay = document.getElementById('username-display');
const msgContainer = document.getElementById('msg-container');

document.addEventListener('DOMContentLoaded', () => {
    checkCookie();
});

btnLoad.addEventListener('click', async () => {
    roomsdata = await cargarhabitacion();
    
    
    renderList(roomsdata);
});


function renderList(roomsArray) {
    grid.innerHTML = ''; 

    roomsArray.forEach(roomData => {
        const roomObj = new Room(roomData);
        grid.innerHTML += roomObj.render();
    });

    calculateTotal(roomsArray);
}

filterSelect.addEventListener('change', (e) => {
    const typeSelected = e.target.value;

    if (typeSelected === 'all') {
        renderList(roomsdata);
    } else {
        const filtered = roomsdata.filter(room => room.type === typeSelected);
        renderList(filtered);
    }
});

function calculateTotal(currentList) {
    const total = currentList.reduce((acc, room) => {
        if (room.status === 'available') {
            return acc + room.price;
        }
        return acc;
    }, 0);

    totalRevenueSpan.textContent = total;
}


btnLogin.addEventListener('click', async () => {
    const user = prompt("Introduce tu usuario:");
    if (!user) return;

    const response = await login(user);

    if (response.ok) {
        userDisplay.textContent = response.user;
        msgContainer.textContent = "¡Login correcto!";
        msgContainer.style.color = "green";

        document.cookie = `hotel_user=${response.user}; max-age=1800; path=/`;
    } else {
        msgContainer.textContent = "Error al entrar";
        msgContainer.style.color = "red";
    }
});

function checkCookie() {

    const cookies = document.cookie.split('; ');
    const userCookie = cookies.find(row => row.startsWith('hotel_user='));

    if (userCookie) {
        const username = userCookie.split('=')[1];
        userDisplay.textContent = username;
        btnLogin.style.display = 'none';
    }
}