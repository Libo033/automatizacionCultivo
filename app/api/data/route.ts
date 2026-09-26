import { NextResponse } from "next/server";

interface DatosSensores {
  temperatura?: number;
  humedadAire?: number;
  humedadSuelo?: number;
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
    const url = `https://${host}/sensores.json?auth=${secret}`;
    const respuesta = await fetch(url, { cache: "no-store" });

    if (!respuesta.ok) {
      return NextResponse.json(
        { error: "Error al consultar Firebase" },
        { status: respuesta.status }
      );
    }

    const datos: DatosSensores = await respuesta.json();

    return NextResponse.json(datos, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error interno", detalle: mensaje },
      { status: 500 }
    );
  }
}