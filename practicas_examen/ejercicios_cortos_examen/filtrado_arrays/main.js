const lista=document.getElementById('lista');
const busca=document.getElementById('buscador');
const personas=['Ana', 'Alberto', 'Bernardo', 'Carlos', 'Cecilia'];

document.addEventListener('DOMContentLoaded',()=>{
    pintar(personas);
})
function pintar(elementos){
    lista.innerHTML='';
    elementos.forEach(elemento => {
        const li=document.createElement('li');
        li.textContent=elemento;
        lista.appendChild(li);
    });
}

busca.addEventListener('keyup', (e) => {
    const texto = e.target.value.toLowerCase();
    
    const filtrados = personas.filter(persona => 
        persona.toLowerCase().includes(texto)
    );
    
    pintar(filtrados);
});