export async function getpads() {
    try{
        const res=await fetch('http://localhost:3000/pads');
        const data=await res.json();
        return data; 
    }catch(e){
        console.error(e);
        return [];
    }
}