import { NextResponse } from "next/server";

interface RegistroHistorial {
  temperatura?: number;
  humedadAire?: number;
  humedadSuelo?: number;
  guardadoEl?: number;
  timestamp?: number;
}

export async function GET() {
  const host = process.env.FIREBASE_HOST;
  const secret = process.env.FIREBASE_SECRET;

  if (!host || !secret) {
    return NextResponse.json(
      { error: "Faltan variables de entorno FIREBASE_HOST o FIREBASE_SECRET" },
      { status: 500 }
    );
  }

  try {
    const url = `https://${host}/historial.json?auth=${secret}`;
    const respuesta = await fetch(url, { cache: "no-store" });

    if (!respuesta.ok) {
      return NextResponse.json(
        { error: "Error al consultar el historial" },
        { status: respuesta.status }
      );
    }

    const datosCrudos: Record<string, RegistroHistorial> | null = await respuesta.json();

    if (!datosCrudos) {
      return NextResponse.json(
        { registros: [] },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // Firebase devuelve un objeto {clave: valor}; lo convertimos a lista ordenada
    const registros = Object.entries(datosCrudos)
      .map(([clave, valor]) => ({ clave, ...valor }))
      .sort((a, b) => (b.guardadoEl ?? 0) - (a.guardadoEl ?? 0));

    return NextResponse.json(
      { registros },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error interno", detalle: mensaje },
      { status: 500 }
    );
  }
}