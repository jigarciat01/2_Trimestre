const url = "http://localhost:3000";
export async function getmenu() {
  try {
    const res = await fetch(`${url}/menu`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function pagar(mesa, cantidad) {
  try {
    const res = await fetch(`${url}/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        table: mesa,
        amount: cantidad,
      }),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}
