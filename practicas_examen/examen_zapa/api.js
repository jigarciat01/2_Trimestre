export async function getproductos() {
  try {
    const res = await fetch("http://localhost:3000/api/products");
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Error: ", e);
    return [];
  }
}

export async function comprar(id) {
  try {
    const res = await fetch("http://localhost:3000/api/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Error: ", e);
    return [];
  }
}
