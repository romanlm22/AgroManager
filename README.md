# AgroManager

Sistema web de gestión para establecimientos agrícolas y ganaderos. Permite administrar lotes, cultivos, labores, inventario de insumos, maquinaria y hacienda (rodeos, animales, sanidad, reproducción y producción), consultar el clima en vivo, hacer preguntas a un asistente de IA con los datos del establecimiento y generar reportes en PDF.

Es un proyecto de portfolio que combina dos áreas: la agronomía (el dominio) y el desarrollo Full Stack (la implementación). Interfaz en español, código en inglés.

> **Estado:** backend y frontend completos para los módulos listados abajo, probados manualmente de punta a punta. Tests unitarios del backend, CI con GitHub Actions y despliegue con Docker incluidos. Pendientes: tests de integración y de frontend, envío real de emails y los puntos del [Roadmap](#roadmap).

<!-- TODO: agregar capturas de pantalla (login, dashboard, lotes, ganadería, reportes) en docs/screenshots y enlazarlas acá -->

## Funcionalidades

### Agricultura

- **Autenticación:** registro, login, perfil, cambio de contraseña y recuperación de contraseña con token de un solo uso.
- **Establecimientos:** un usuario puede pertenecer a varios y cada establecimiento tiene varios usuarios, con rol de propietario o miembro.
- **Lotes y cultivos:** lotes por establecimiento (con uso agrícola, ganadero o mixto), catálogo de tipos de cultivo y ciclo de cada cultivo (siembra, cosecha estimada y real, superficie, rendimiento, estado).
- **Labores:** siembra, fertilización, pulverización, riego, cosecha y control de malezas, con costo, responsable y estado.
- **Inventario:** insumos por categoría con stock, precio, vencimiento y número de partida.
- **Maquinaria:** equipos con estado, horas de uso, próximo mantenimiento e historial de mantenimientos con costo.

### Ganadería

- **Rodeos y animales:** hacienda registrada por rodeo (con conteo manual de cabezas) y/o con ficha individual por caravana. Si un rodeo tiene fichas activas, las cabezas salen de ellas. Carga masiva de caravanas y movimientos entre potreros con historial.
- **Pesajes:** historial por animal con ganancia diaria de peso (GDP).
- **Sanidad:** vacunaciones, desparasitaciones y tratamientos por animal o por rodeo, con próxima dosis y estado (vencida, próxima).
- **Reproducción:** servicio, tacto, parto y aborto por hembra, estado reproductivo y fecha probable de parto (283 días). Al cargar un parto se puede registrar la cría, vinculada a su madre.
- **Producción:** leche, carne, lana y otros productos, con cantidad, unidad e ingreso. La baja de un animal por venta genera su producción de carne.

### Transversal

- **Clima:** condiciones actuales y pronóstico de 7 días por establecimiento, desde sus coordenadas, con datos de [Open-Meteo](https://open-meteo.com/).
- **Dashboard:** superficie, lotes, cultivos activos, costos, alertas de stock bajo, insumos por vencer, próximas labores, mantenimientos próximos y clima. Si hay hacienda, suma una sección de ganadería (cabezas, preñadas, partos próximos, dosis vencidas, GDP, producción e ingresos), separada de los costos agrícolas.
- **Asistente de IA:** chat por establecimiento que responde con los datos reales (lotes, cultivos, labores, inventario, maquinaria, clima y ganadería), usando [Google Gemini](https://ai.google.dev/).
- **Reportes en PDF:** labores, inventario, producción y gastos, más stock ganadero, sanidad y producción ganadera, con filtro opcional por fechas donde aplica.

## Stack

| Capa | Tecnologías |
| --- | --- |
| Backend | Java 21, Spring Boot 4.1, Spring Security (JWT sin estado), Spring Data JPA / Hibernate, Flyway, Lombok, OpenPDF |
| Base de datos | PostgreSQL 16 (Docker Compose) |
| Frontend | React, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, React Hook Form + Zod, Axios, Recharts |
| IA | Google Gemini (detrás de una interfaz `AiClient`) |
| Calidad y despliegue | JUnit 5, Mockito, AssertJ, GitHub Actions, Docker, nginx |
| Herramientas | Maven, npm, Git |

## Arquitectura

### Backend: monolito modular

Un solo servicio organizado por módulos de dominio, cada uno con su propio paquete bajo `com.agromanager`:

```
auth  user  farm  field  crop  task  inventory  machinery  weather  livestock  dashboard  report  ai  common
```

Cada módulo tiene su entidad, repositorio, servicio, controlador y DTOs. Los DTOs son `record` de Java con un método `fromEntity`. Los errores se centralizan en un `GlobalExceptionHandler`; los módulos de IA y ganadería tienen el suyo, para no tocar el global.

**Autorización jerárquica.** El acceso se verifica en cascada: un lote se resuelve siempre dentro de un establecimiento al que el usuario pertenece, un cultivo dentro de un lote, un animal dentro de un establecimiento, y así sucesivamente. Ningún recurso se busca solo por su id. Sin acceso responde `403`; si el recurso no pertenece al padre indicado, `404`.

### Frontend

Organizado por tipo (`pages`, `layouts`, `components`, `hooks`, `services`, `types`, `utils`) y por funcionalidad (`features/<módulo>`). La navegación está centrada en el establecimiento: `/farms/:farmId/...`. Cultivos y labores viven como pestañas dentro del detalle de cada lote, porque la API los cuelga de `/fields/{fieldId}`; ganadería tiene sus propias pestañas (rodeos, animales, sanidad, reproducción, producción).

- **Estado del servidor:** TanStack Query. Las mutaciones invalidan la caché del establecimiento, así el dashboard siempre refleja los cambios. La caché se limpia al iniciar y cerrar sesión.
- **Formularios:** React Hook Form con esquemas Zod.
- **Rutas:** cada página se carga con `React.lazy`, por lo que librerías pesadas como Recharts solo se descargan cuando hacen falta.

## Decisiones de diseño

Las decisiones que no son obvias, con su motivo:

- **JWT en `localStorage`.** Es lo más simple y encaja con un backend sin sesiones ni cookies. El costo es que un ataque XSS podría leer el token. Es una decisión consciente para este proyecto. En producción migraría a una cookie `httpOnly` con refresh tokens, lo que exige reactivar la protección CSRF y ajustar CORS con credenciales.
- **El frontend descarta la sesión vencida.** Lee el campo `exp` del token al cargar y, si el backend responde `401` en una ruta protegida, vuelve al login. El backend distingue `401` (sin token válido) de `403` (sin permiso).
- **Roles en el registro.** Desde la pantalla de registro solo se puede elegir productor, ingeniero agrónomo o empleado. El backend rechaza `ADMIN` aunque se llame a la API directamente.
- **Enums como `VARCHAR` con `CHECK`**, nunca como enum nativo de PostgreSQL. Agregar un valor es una migración simple y no depende del driver.
- **Migraciones con Flyway, nunca editadas.** Una migración aplicada no se modifica: cualquier cambio es una migración nueva.
- **CORS por configuración.** Los orígenes permitidos viven en `app.cors.allowed-origins`, no en el código. Nunca se usa `*`. En producción, nginx sirve el frontend y reenvía `/api` al backend, así que comparten origen y no hace falta CORS.
- **Clima en vivo, sin persistencia.** No hay tabla ni caché: se consulta Open-Meteo en cada pedido. El proveedor está detrás de una interfaz (`WeatherClient`), así que cambiarlo implica solo una implementación nueva. Si el proveedor falla, el endpoint responde `503` y el dashboard sigue funcionando sin el clima.
- **Hacienda individual y por rodeo.** Un rodeo puede llevar solo un conteo manual o tener fichas individuales. Si tiene fichas activas, las cabezas salen de ellas y el conteo manual se ignora. Así se puede empezar simple y afinar después.
- **Resumen ganadero único.** Un solo servicio calcula las cifras de ganadería (cabezas, preñadas, dosis pendientes, GDP, producción) y lo usan el dashboard, los PDF y el asistente, para que todos muestren los mismos números.
- **Costos ganaderos aparte.** Los costos sanitarios y los ingresos de producción ganadera no se mezclan con los costos agrícolas del dashboard.
- **Reportes generados en memoria.** Los PDF se arman al momento con los datos actuales y no se guardan.
- **IA detrás de una interfaz y con límites.** El proveedor está encapsulado en `AiClient`. La API key solo se lee de la variable de entorno `GEMINI_API_KEY`. El contexto que se envía al modelo contiene datos agronómicos y ganaderos, nunca datos de personas, y tiene topes por lista. Hay un límite de 30 consultas por hora por usuario. Los datos del establecimiento se le pasan al modelo como información, no como instrucciones.
- **Superficies con un decimal, rendimiento en kg/ha, fechas calendario como `LocalDate`.**

## Cómo correrlo en local

### Requisitos

- Java 21
- Node.js 22 o superior y npm
- Docker (con Docker Compose)

### 1. Base de datos

Desde la raíz del repositorio:

```bash
docker compose up -d
```

Levanta PostgreSQL 16 en el puerto 5432 con la base, el usuario y la contraseña `agromanager` (solo para desarrollo).

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run        # en Windows: .\mvnw.cmd spring-boot:run
```

Corre en `http://localhost:8080` con el perfil `dev`. Flyway crea las tablas al arrancar. La configuración de desarrollo está en `backend/src/main/resources/application-dev.yml`.

> El secreto del JWT que está en `application-dev.yml` es solo para desarrollo. En producción debe venir de una variable de entorno (ver [Despliegue](#despliegue-con-docker)).

**Asistente de IA (opcional).** Para activarlo, creá una API key en [Google AI Studio](https://aistudio.google.com/) y definila como variable de entorno antes de arrancar el backend. Nunca la escribas en un archivo del repositorio.

```powershell
$env:GEMINI_API_KEY = "tu-api-key"      # PowerShell
```

```bash
export GEMINI_API_KEY="tu-api-key"      # Linux / macOS
```

Sin la key, el resto de la aplicación funciona igual y el asistente responde `503`.

> **Privacidad con el plan gratuito de Gemini.** Con el plan gratuito, Google puede usar lo que se le envía para mejorar sus productos. Por eso el contexto no incluye datos personales, pero sí datos del establecimiento. Para un uso real conviene un plan de pago, donde esos datos no se usan para entrenar.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Corre en `http://localhost:5173`. La URL del backend se define en `frontend/.env.development` (`VITE_API_URL=http://localhost:8080`).

### 4. Primer usuario

Ingresá a `http://localhost:5173/register`, creá tu cuenta y quedás logueado. Después podés crear tu primer establecimiento.

## Despliegue con Docker

El archivo `docker-compose.prod.yml` levanta PostgreSQL, el backend y el frontend (nginx) con una sola orden. nginx sirve la aplicación y reenvía `/api` al backend.

```bash
cp .env.example .env        # completar POSTGRES_PASSWORD y JWT_SECRET
docker compose -f docker-compose.prod.yml up -d --build
```

Variables (archivo `.env`, que no se sube al repositorio):

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | Sí | Contraseña de la base de datos |
| `JWT_SECRET` | Sí | Secreto de firma de los JWT. Generalo con `openssl rand -base64 64` |
| `GEMINI_API_KEY` | No | API key del asistente de IA |
| `CORS_ALLOWED_ORIGINS` | No | Solo si el frontend se sirve desde otro origen que la API |
| `HTTP_PORT` | No | Puerto de publicación (por defecto 80) |

Antes de exponerlo a internet:

- Servilo siempre detrás de **HTTPS** (por ejemplo con Caddy o un proxy del proveedor): el token JWT viaja en cada pedido.
- La recuperación de contraseña todavía no envía emails: el token de reseteo se escribe en el log del backend. Hasta integrar un proveedor SMTP, deshabilitá ese flujo o restringí el acceso a los logs.

## API

Todos los endpoints, salvo los de `/api/auth` y `/api/health`, requieren el header `Authorization: Bearer <token>`.

| Recurso | Endpoints |
| --- | --- |
| Autenticación | `POST /api/auth/register`, `/login`, `/forgot-password`, `/reset-password` |
| Usuario | `GET /api/users/me`, `PUT /api/users/me/password` |
| Establecimientos | `GET/POST /api/farms`, `GET/PUT/DELETE /api/farms/{farmId}` |
| Lotes | `/api/farms/{farmId}/fields` |
| Cultivos | `GET /api/crop-types`, `/api/farms/{farmId}/fields/{fieldId}/crops` |
| Labores | `/api/farms/{farmId}/fields/{fieldId}/tasks` |
| Inventario | `/api/farms/{farmId}/inventory` |
| Maquinaria | `/api/farms/{farmId}/machinery`, `/api/farms/{farmId}/machinery/{machineryId}/maintenances` |
| Rodeos | `/api/farms/{farmId}/herds`, `POST .../herds/{herdId}/move` |
| Animales | `/api/farms/{farmId}/animals`, `POST .../animals/bulk`, `POST .../animals/{id}/move`, `POST .../animals/{id}/retire`, `GET .../animals/{id}/movements` |
| Pesajes | `/api/farms/{farmId}/animals/{animalId}/weighings` |
| Sanidad | `/api/farms/{farmId}/health-events` |
| Reproducción | `/api/farms/{farmId}/reproduction-events`, `GET /api/farms/{farmId}/reproduction-status` |
| Producción ganadera | `/api/farms/{farmId}/productions` |
| Clima | `GET /api/farms/{farmId}/weather` |
| Dashboard | `GET /api/farms/{farmId}/dashboard` |
| Asistente de IA | `POST /api/farms/{farmId}/ai/chat` |
| Reportes | `GET /api/farms/{farmId}/reports/{tasks\|inventory\|production\|expenses\|livestock-stock\|livestock-health\|livestock-production}/pdf` |
| Estado | `GET /api/health` |

Los recursos con CRUD completo exponen `POST`, `GET` (lista y detalle), `PUT` y `DELETE`. Solo el propietario de un establecimiento puede eliminarlo.

## Pruebas

**Backend.** Tests unitarios con JUnit 5, Mockito y AssertJ, sin levantar Spring:

```bash
cd backend
./mvnw test
```

Cubren el registro (incluido el rechazo del rol `ADMIN` y de emails repetidos), el login, la recuperación de contraseña, los JWT (firma, vencimiento, token adulterado), la autorización por establecimiento de ganadería, el estado reproductivo de una hembra, las dosis sanitarias pendientes y el resumen ganadero (cabezas, GDP, producción e ingresos).

`BackendApplicationTests` levanta el contexto completo y necesita la base de datos del perfil `dev` (`docker compose up -d`).

**Integración continua.** El workflow `.github/workflows/ci.yml` corre en cada push y pull request a `main` y `develop`: compila y testea el backend contra un PostgreSQL de servicio, hace lint y build del frontend, y construye las imágenes Docker.

**Frontend.** Se probó manualmente en el navegador, módulo por módulo. Los tests automatizados del frontend están pendientes.