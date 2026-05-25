
export async function login(user){
    try{
        const respuesta= await fetch('https://jsonplaceholder.typicode.com/posts',{
            method: 'POST',
            body: JSON.stringify({ username }),
            headers: { 'Content-type': 'application/json' }
        })
        return await respuesta.json();

    }catch(e){
        console.error(e); return null;
    }
}

export async function getSecret() {
    try{
        const respuesta =await fetch('https://jsonplaceholder.typicode.com/users')
        return await respuesta.json();
    }catch(e){
        return [];
    }
}