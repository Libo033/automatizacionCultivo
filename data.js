export default async function handler(req, res) {
  try {
    const host = process.env.FIREBASE_HOST;     // ej: tu-proyecto-default-rtdb.firebaseio.com
    const secret = process.env.FIREBASE_SECRET; // el Database Secret de Firebase

    if (!host || !secret) {
      return res.status(500).json({ error: "Faltan variables de entorno FIREBASE_HOST o FIREBASE_SECRET" });
    }

    const url = `https://${host}/sensores.json?auth=${secret}`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      return res.status(respuesta.status).json({ error: "Error al consultar Firebase" });
    }

    const datos = await respuesta.json();

    // Evita que el navegador cachee la respuesta, para que siempre pida el dato fresco
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(datos);
  } catch (error) {
    res.status(500).json({ error: "Error interno", detalle: error.message });
  }
}
