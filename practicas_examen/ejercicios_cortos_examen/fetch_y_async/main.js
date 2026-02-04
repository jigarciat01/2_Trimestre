const btn = document.getElementById('btn-get');
const card = document.getElementById('user-card');

async function cargar() {
    try{
        const respuesta= await fetch('https://jsonplaceholder.typicode.com/users/1');

        const data= await respuesta.json();

        card.innerHTML = `
            <h3>${data.name}</h3>
            <p>${data.email}</p>
        `;
    }catch{
        //errores
    }
}

btn.addEventListener('click', cargar);