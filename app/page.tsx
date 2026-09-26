"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface DatosSensores {
  temperatura?: number;
  humedadAire?: number;
  humedadSuelo?: number;
  timestamp?: number;
}

export default function Home() {
  const [datos, setDatos] = useState<DatosSensores>({});
  const [conectado, setConectado] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState("");

  useEffect(() => {
    async function actualizar() {
      try {
        const r = await fetch("/api/data", { cache: "no-store" });
        if (!r.ok) throw new Error("Respuesta no OK");

        const d: DatosSensores = await r.json();
        if (d.temperatura === undefined) throw new Error("Sin datos aun");

        setDatos(d);
        setConectado(true);
        setUltimaActualizacion(new Date().toLocaleTimeString());
      } catch {
        setConectado(false);
      }
    }

    actualizar();
    const intervalo = setInterval(actualizar, 5000);
    return () => clearInterval(intervalo);
  }, []);

  async function guardarRegistro() {
    setGuardando(true);
    setMensajeGuardado("");

    try {
      const r = await fetch("/api/guardar", { method: "POST" });
      const resultado = await r.json();

      if (!r.ok) {
        throw new Error(resultado.error || "Error al guardar");
      }

      setMensajeGuardado("Guardado ✅ (" + new Date().toLocaleTimeString() + ")");
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error desconocido";
      setMensajeGuardado("Error al guardar: " + mensaje);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className={styles.main}>
      <h1>Estación de Sensores</h1>
      <div className={conectado ? styles.online : styles.offline}>
        {conectado ? "Conectado" : "Sin datos / Error de conexión"}
      </div>

      <div className={styles.valores}>
        <div className={styles.card}>
          <div>Temperatura</div>
          <div className={`${styles.valor} ${styles.temp}`}>
            {datos.temperatura !== undefined ? datos.temperatura.toFixed(1) : "--"} °C
          </div>
        </div>
        <div className={styles.card}>
          <div>Humedad Aire</div>
          <div className={`${styles.valor} ${styles.humAire}`}>
            {datos.humedadAire !== undefined ? datos.humedadAire.toFixed(1) : "--"} %
          </div>
        </div>
        <div className={styles.card}>
          <div>Humedad Suelo</div>
          <div className={`${styles.valor} ${styles.humSuelo}`}>
            {datos.humedadSuelo ?? "--"} %
          </div>
        </div>
      </div>

      {ultimaActualizacion && (
        <div className={styles.actualizado}>
          Última actualización: {ultimaActualizacion}
        </div>
      )}

      <button
        className={styles.botonGuardar}
        onClick={guardarRegistro}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar registro"}
      </button>

      {mensajeGuardado && (
        <div className={styles.mensajeGuardado}>{mensajeGuardado}</div>
      )}

      <div className={styles.actualizado}>
        <Link href="/registro" style={{ color: "#4dabf7" }}>
          Ver registro histórico →
        </Link>
      </div>
    </main>
  );
}