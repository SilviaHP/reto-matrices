# Reto técnico — Factorización QR con dos APIs y frontend

Solución al reto técnico que implementa factorización QR sobre matrices rectangulares usando dos APIs independientes orquestadas con Docker.

---

## Arquitectura

```
Frontend (HTML/CSS/JS)
        |
        | POST /api/matrix/qr
        v
   API Go :8080          (Fiber)
        |
        | POST /api/stats  (interno, red Docker)
        v
  API Node.js :3000      (Express)
```

- **API Go**: recibe la matriz, calcula la factorización QR y llama a la API Node.js.
- **API Node.js**: recibe las matrices Q y R y calcula estadísticas (máximo, mínimo, promedio, suma, diagonal).
- **Frontend**: interfaz web que consume la API Go y muestra los resultados.

---

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

---

## Levantar el proyecto

Desde la raíz del repositorio:

```bash
docker compose up --build -d
```

Esto construye las imágenes y levanta ambos contenedores en la red interna `matrices-net`.

| Servicio   | Puerto local |
|------------|-------------|
| API Go     | 8080        |
| API Node.js| 3000        |

Para detener:

```bash
docker compose down
```

---

## Frontend

Abrir directamente en el navegador:

```
front-end/index.html
```

No requiere servidor — consume la API Go en `http://localhost:8080`.

---

## Endpoints

### API Go

**Health check**
```
GET http://localhost:8080/health
```

**Factorización QR**
```
POST http://localhost:8080/api/matrix/qr
Content-Type: application/json

{
  "matrix": [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]
}
```

Restricción: `filas >= columnas`.

Respuesta:
```json
{
  "qr": { "Q": [[...]], "R": [[...]] },
  "stats": {
    "max": 1.8,
    "min": -11.07,
    "average": -1.48,
    "sum": -26.66,
    "diagonals": { "Q": false, "R": false }
  }
}
```

### API Node.js

**Health check**
```
GET http://localhost:3000/health
```

**Estadísticas**
```
POST http://localhost:3000/api/stats
Content-Type: application/json

{
  "Q": [[...]],
  "R": [[...]]
}
```

---

## Pruebas

### API Go

```bash
cd api-go
go test ./test/...
```

### API Node.js

```bash
cd api-node
npm test
```

### Archivos `.http`

Cada API tiene un archivo `test.http` con ejemplos listos para usar con la extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) de VS Code.

---

## Estructura del proyecto

```
reto-matrices/
├── docker-compose.yml
├── api-go/
│   ├── Dockerfile
│   ├── main.go
│   ├── handlers/
│   │   ├── matrix.go
│   │   └── matrix_test.go
│   ├── services/
│   │   ├── qr.go
│   │   ├── qr_test.go
│   │   └── client.go
│   ├── models/
│   │   └── matrix.go
│   └── test.http
├── api-node/
│   ├── Dockerfile
│   ├── server.js
│   ├── app.js
│   ├── src/
│   │   ├── routes/stats.js
│   │   ├── services/matrixStats.js
│   │   └── middlewares/errorHandler.js
│   ├── test/
│   │   └── services/matrixStats.test.js
│   └── test.http
└── front-end/
    ├── index.html
    ├── app.js
    └── styles.css
```

---

## Decisiones técnicas

- **QR con `gonum`**: se usa la librería estándar de álgebra lineal de Go en lugar de implementar el algoritmo desde cero, priorizando corrección numérica.
- **Degradación elegante**: si la API Node.js no está disponible, la API Go devuelve igualmente el resultado QR con un campo `warning`, en lugar de fallar.
- **Red Docker interna**: la comunicación entre APIs usa el hostname del servicio (`api-node:3000`), no `localhost`, para funcionar dentro de la red `matrices-net`.
- **Frontend sin build step**: HTML/CSS/JS puro para no agregar complejidad innecesaria al reto.
