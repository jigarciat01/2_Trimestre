const lista=document.getElementById('lista');
const dias=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

dias.forEach(dia => {
    const li=document.createElement('li');
    li.textContent=dia;
    lista.appendChild(li);
});