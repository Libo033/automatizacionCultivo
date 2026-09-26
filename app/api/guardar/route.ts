import { NextResponse } from "next/server";

export async function POST() {
  const host = process.env.FIREBASE_HOST;
  const secret = process.env.FIREBASE_SECRET;

  if (!host || !secret) {
    return NextResponse.json(
      { error: "Faltan variables de entorno FIREBASE_HOST o FIREBASE_SECRET" },
      { status: 500 }
    );
  }

  try {
    // 1. Leer el valor actual de los sensores
    const urlActual = `https://${host}/sensores.json?auth=${secret}`;
    const respActual = await fetch(urlActual, { cache: "no-store" });

    if (!respActual.ok) {
      return NextResponse.json(
        { error: "No se pudo leer el valor actual de los sensores" },
        { status: respActual.status }
      );
    }

    const datosActuales = await respActual.json();

    if (!datosActuales || datosActuales.temperatura === undefined) {
      return NextResponse.json(
        { error: "Todavia no hay datos de sensores disponibles" },
        { status: 404 }
      );
    }

    // 2. Guardar ese valor como un registro nuevo en /historial
    //    POST hace que Firebase genere una clave unica, asi no se pisan los registros
    const urlHistorial = `https://${host}/historial.json?auth=${secret}`;
    const registro = {
      ...datosActuales,
      guardadoEl: Date.now(), // fecha/hora real del servidor, en milisegundos desde 1970
    };

    const respGuardar = await fetch(urlHistorial, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registro),
    });

    if (!respGuardar.ok) {
      return NextResponse.json(
        { error: "Error al guardar en el historial" },
        { status: respGuardar.status }
      );
    }

    const resultado = await respGuardar.json(); // { name: "-Nxxxxxxxxxx" } -> la clave generada

    return NextResponse.json({ ok: true, clave: resultado.name, registro });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error interno", detalle: mensaje },
      { status: 500 }
    );
  }
}