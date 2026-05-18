const btn=document.getElementById('btn-send');

async function enviarDatos() {
    try{
        const respuesta=await fetch('https://jsonplaceholder.typicode.com/posts',{
            method: 'POST',
            body: JSON.stringify({
                nombre: 'Nacho',
                edad: '19'
            }),
            headers:{
                'Content-type': 'application/json'
            }  
        });
        const datos=await respuesta.json();
        console.log("Datos:",datos);
        
    }catch{

    }
}

btn.addEventListener('click',enviarDatos)