export async function getpets() {
  try {
    const res = await fetch("http://localhost:3000/api/pets");
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function adoptpet(petid, ownername) {
  try {
    const res = await fetch("http://localhost:3000/api/adopt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: petid,
        owner: ownername,
      }),
    });

    const data = await res.json();

    return data;

  } catch (e) {
    console.error(e);
    return [];
  }
}
