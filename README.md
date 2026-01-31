# Player Client (Angular)

Este repositorio contiene el cliente **player** del juego estilo Jackbox.

## Requisitos

1. **Node.js 18+** (incluye npm). Si no lo tienes instalado:
   - Descarga desde https://nodejs.org
   - Verifica la instalación con:
     ```bash
     node -v
     npm -v
     ```

2. (Opcional) **Angular CLI** global. No es necesario, pero si prefieres:
   ```bash
   npm install -g @angular/cli
   ```

## Levantar la aplicación en desarrollo

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

3. Abre la app en el navegador:
   ```
   http://localhost:4200
   ```

## Notas importantes

- Este cliente consume la API en `http://18.222.254.35:8080` y se conecta vía SSE.
- El formulario inicial permite ingresar el **código de sala** y **nombre**.
- Al conectarse con éxito, se abre la conexión SSE y se espera el `PLAYER_SNAPSHOT`.

## Estructura principal

```
src/app/player/
  player-client.service.ts   // SSE + reconexión
  player-api.service.ts      // comandos HTTP
  player-store.service.ts    // BehaviorSubject + reducers
  models.ts                  // Snapshot/Event/Phase
  game-shell.component.ts    // ngSwitch por phase
  ui/
    lobby.component.ts
    answer.component.ts
    vote.component.ts
    results.component.ts
```
