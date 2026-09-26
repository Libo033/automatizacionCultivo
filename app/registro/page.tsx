"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../page.module.css";
import registroStyles from "./registro.module.css";

interface RegistroHistorial {
  clave: string;
  temperatura?: number;
  humedadAire?: number;
  humedadSuelo?: number;
  guardadoEl?: number;
}

export default function Registro() {
  const [registros, setRegistros] = useState<RegistroHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const r = await fetch("/api/historial", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Error al cargar historial");
      setRegistros(d.registros ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <main className={styles.main}>
      <h1>Registro Histórico</h1>
      <Link href="/" className={registroStyles.volver}>
        ← Volver a la estación
      </Link>

      <div className={registroStyles.acciones}>
        <button
          className={styles.botonGuardar}
          onClick={cargar}
          disabled={cargando}
        >
          {cargando ? "Cargando..." : "Actualizar lista"}
        </button>
      </div>

      {error && <div className={styles.offline}>{error}</div>}

      {!cargando && registros.length === 0 && !error && (
        <div className={registroStyles.vacio}>
          Todavía no hay registros guardados.
        </div>
      )}

      {registros.length > 0 && (
        <table className={registroStyles.tabla}>
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Temp.</th>
              <th>Hum. Aire</th>
              <th>Hum. Suelo</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((reg) => (
              <tr key={reg.clave}>
                <td>
                  {reg.guardadoEl
                    ? new Date(reg.guardadoEl).toLocaleString()
                    : "--"}
                </td>
                <td>
                  {reg.temperatura !== undefined
                    ? reg.temperatura.toFixed(1) + " °C"
                    : "--"}
                </td>
                <td>
                  {reg.humedadAire !== undefined
                    ? reg.humedadAire.toFixed(1) + " %"
                    : "--"}
                </td>
                <td>
                  {reg.humedadSuelo !== undefined ? reg.humedadSuelo + " %" : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}