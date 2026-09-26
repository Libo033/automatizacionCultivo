# Estación de Sensores - Página Vercel

Muestra en tiempo real los datos que el ESP32 manda a Firebase (temperatura, humedad de aire, humedad de suelo), accesible desde cualquier lugar con internet.

## Cómo está armado

- `index.html`: la página que ves en el navegador. Pide los datos a `/api/data` cada 5 segundos.
- `api/data.js`: función serverless de Vercel. Es la única parte que conoce el secreto de Firebase — lo lee de una variable de entorno, nunca queda expuesto en el navegador.

## Pasos para desplegar

### 1. Instalar Vercel CLI (una sola vez)
```bash
npm install -g vercel
```

### 2. Desde esta carpeta, iniciar sesión y desplegar
```bash
vercel login
vercel
```
Seguí las preguntas (aceptá los valores por defecto). Al terminar te da una URL tipo `https://tu-proyecto.vercel.app`.

### 3. Configurar las variables de entorno (IMPORTANTE)

En el [dashboard de Vercel](https://vercel.com/dashboard) → tu proyecto → **Settings → Environment Variables**, agregá:

| Nombre | Valor |
|--------|-------|
| `FIREBASE_HOST` | `tu-proyecto-default-rtdb.firebaseio.com` (sin `https://` ni barra al final) |
| `FIREBASE_SECRET` | el Database Secret que sacaste de Firebase |

### 4. Volver a desplegar para que tome las variables nuevas
```bash
vercel --prod
```

## Alternativa: desplegar desde GitHub (sin usar la terminal)

1. Subí esta carpeta a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) → **Add New Project** → importá el repositorio.
3. Antes de darle a "Deploy", agregá las mismas dos variables de entorno (`FIREBASE_HOST` y `FIREBASE_SECRET`) en la sección que aparece en esa misma pantalla.
4. Desplegar.

## Sobre las reglas de Firebase

Como esta página consulta Firebase a través de la función serverless (que sí tiene el secreto), podés dejar las reglas de Firebase **cerradas** (sin lectura/escritura pública), y solo el ESP32 (con el secreto) y esta función van a poder acceder. Es la opción más segura.

## Nota sobre "tiempo real"

Esta página consulta los datos cada 5 segundos (no es una conexión permanente tipo WebSocket), lo cual es más que suficiente para sensores ambientales que no cambian de golpe. Si el ESP32 no mandó datos hace rato (por ejemplo, se quedó sin WiFi), vas a ver "Sin datos / Error de conexión" en la parte de arriba de la página.
