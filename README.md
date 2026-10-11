# AgroManager

Sistema web de gestión para establecimientos agrícolas. Permite administrar lotes, cultivos, labores, inventario de insumos y maquinaria de un establecimiento, consultar el clima en vivo y generar reportes en PDF.

Es un proyecto de portfolio que combina dos áreas: la agronomía (el dominio) y el desarrollo Full Stack (la implementación). Interfaz en español, código en inglés.

> **Estado:** backend y frontend completos para los módulos listados abajo, probados manualmente de punta a punta. Pendientes: tests automatizados, despliegue y CI/CD, y el módulo de IA. Ver [Roadmap](#roadmap).


## Funcionalidades

- **Autenticación:** registro, login, perfil, cambio de contraseña y recuperación de contraseña con token de un solo uso.
- **Establecimientos:** un usuario puede pertenecer a varios y cada establecimiento tiene varios usuarios, con rol de propietario o miembro.
- **Lotes y cultivos:** lotes por establecimiento, catálogo de tipos de cultivo y ciclo de cada cultivo (siembra, cosecha estimada y real, superficie, rendimiento, estado).
- **Labores:** siembra, fertilización, pulverización, riego, cosecha y control de malezas, con costo, responsable y estado.
- **Inventario:** insumos por categoría con stock, precio, vencimiento y número de partida.
- **Maquinaria:** equipos con estado, horas de uso, próximo mantenimiento e historial de mantenimientos con costo.
- **Clima:** condiciones actuales y pronóstico de 7 días por establecimiento, desde sus coordenadas, con datos de [Open-Meteo](https://open-meteo.com/).
- **Dashboard:** superficie, lotes, cultivos activos, costos, alertas de stock bajo, insumos por vencer, próximas labores, mantenimientos próximos y clima.
- **Reportes en PDF:** labores, inventario, producción y gastos, con filtro opcional por fechas.

## Stack

| Capa | Tecnologías |
| --- | --- |
| Backend | Java 21, Spring Boot 4.1, Spring Security (JWT sin estado), Spring Data JPA / Hibernate, Flyway, Lombok, OpenPDF |
| Base de datos | PostgreSQL 16 (Docker Compose) |
| Frontend | React, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, React Hook Form + Zod, Axios, Recharts |
| Herramientas | Maven, npm, Docker, Git |

## Arquitectura

### Backend: monolito modular

Un solo servicio organizado por módulos de dominio, cada uno con su propio paquete bajo `com.agromanager`:

```
auth  user  farm  field  crop  task  inventory  machinery  weather  dashboard  report  common
```

Cada módulo tiene su entidad, repositorio, servicio, controlador y DTOs. Los DTOs son `record` de Java con un método `fromEntity`. Los errores se centralizan en un único `GlobalExceptionHandler`.

**Autorización jerárquica.** El acceso se verifica en cascada: un lote se resuelve siempre dentro de un establecimiento al que el usuario pertenece, un cultivo dentro de un lote, y así sucesivamente. Ningún recurso se busca solo por su id. Sin acceso responde `403`; si el recurso no pertenece al padre indicado, `404`.

### Frontend

Organizado por tipo (`pages`, `layouts`, `components`, `hooks`, `services`, `types`, `utils`) y por funcionalidad (`features/<módulo>`). La navegación está centrada en el establecimiento: `/farms/:farmId/...`. Cultivos y labores viven como pestañas dentro del detalle de cada lote, porque la API los cuelga de `/fields/{fieldId}`.

- **Estado del servidor:** TanStack Query. Las mutaciones invalidan la caché del establecimiento, así el dashboard siempre refleja los cambios. La caché se limpia al iniciar y cerrar sesión.
- **Formularios:** React Hook Form con esquemas Zod.
- **Rutas:** cada página se carga con `React.lazy`, por lo que librerías pesadas como Recharts solo se descargan cuando hacen falta.

## Decisiones de diseño

Las decisiones que no son obvias, con su motivo:

- **JWT en `localStorage`.** Es lo más simple y encaja con un backend sin sesiones ni cookies. El costo es que un ataque XSS podría leer el token. Es una decisión consciente para este proyecto. En producción migraría a una cookie `httpOnly` con refresh tokens, lo que exige reactivar la protección CSRF y ajustar CORS con credenciales.
- **El frontend descarta la sesión vencida.** Lee el campo `exp` del token al cargar y, si el backend responde `401` en una ruta protegida, vuelve al login. El backend distingue `401` (sin token válido) de `403` (sin permiso).
- **Enums como `VARCHAR` con `CHECK`**, nunca como enum nativo de PostgreSQL. Agregar un valor es una migración simple y no depende del driver.
- **Migraciones con Flyway, nunca editadas.** Una migración aplicada no se modifica: cualquier cambio es una migración nueva.
- **CORS por configuración.** Los orígenes permitidos viven en `app.cors.allowed-origins`, no en el código, y se pueden cambiar en el despliegue sin tocar Java. Nunca se usa `*`.
- **Clima en vivo, sin persistencia.** No hay tabla ni caché: se consulta Open-Meteo en cada pedido. El proveedor está detrás de una interfaz (`WeatherClient`), así que cambiarlo implica solo una implementación nueva. Si el proveedor falla, el endpoint responde `503` y el dashboard sigue funcionando sin el clima.
- **Reportes generados en memoria.** Los PDF se arman al momento con los datos actuales y no se guardan.
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
./mvnw spring-boot:run        
```

Corre en `http://localhost:8080` con el perfil `dev`. Flyway crea las tablas al arrancar. La configuración de desarrollo está en `backend/src/main/resources/application-dev.yml`, incluidos el secreto del JWT, su expiración (24 h) y el origen permitido para CORS.

> El secreto del JWT que está en `application-dev.yml` es solo para desarrollo. En un entorno real debe venir de una variable de entorno.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Corre en `http://localhost:5173`. La URL del backend se define en `frontend/.env.development` (`VITE_API_URL=http://localhost:8080`).

### 4. Primer usuario

El frontend todavía no tiene pantalla de registro. Creá el usuario con una request a la API:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"unaClaveSegura123","firstName":"Nombre","lastName":"Apellido","role":"PRODUCER"}'
```

Los roles disponibles son `ADMIN`, `AGRONOMIST`, `PRODUCER` y `EMPLOYEE`. Después ingresá desde `http://localhost:5173/login`.

## API

Todos los endpoints, salvo los de `/api/auth`, requieren el header `Authorization: Bearer <token>`.

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
| Clima | `GET /api/farms/{farmId}/weather` |
| Dashboard | `GET /api/farms/{farmId}/dashboard` |
| Reportes | `GET /api/farms/{farmId}/reports/{tasks\|inventory\|production\|expenses}/pdf` |

Los recursos con CRUD completo exponen `POST`, `GET` (lista y detalle), `PUT` y `DELETE`. Solo el propietario de un establecimiento puede eliminarlo.

## Pruebas

Hasta ahora el proyecto se probó manualmente: los endpoints con Postman y las pantallas en el navegador, módulo por módulo. Los tests automatizados (JUnit y Mockito en el backend) están pendientes.

## Roadmap

- [ ] Tests automatizados del backend
- [ ] Pantalla de registro y de recuperación de contraseña en el frontend
- [ ] Despliegue y CI/CD con GitHub Actions
- [ ] Módulo de IA (asistente con los datos del establecimiento)
- [ ] Reportes en Excel
- [ ] Relacionar labores con maquinaria e insumos utilizados
- [ ] Migrar el JWT a cookie `httpOnly` con refresh tokens

## Autor