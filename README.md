# MiInbox - Plataforma de Mensajería Interna

El reto consistió en construir un módulo de sistema de mensajería tipo "inbox", similar al que se encuentra en plataformas de soporte o correo electrónico interno. El sistema permite listar conversaciones (hilos), ver mensajes dentro de un hilo de manera fluida (scroll infinito), contactar usuarios, crear grupos y responder a mensajes existentes.

Este archivo documenta la estructura general, las decisiones arquitectónicas y los pasos para correr el proyecto completo.

## 📋 Características y Requerimientos Cumplidos

Siguiendo los criterios de evaluación, este proyecto implementa:
- **Separación de capas, patrones y escalabilidad**: Lógica de negocio separada en Servicios, Respuestas tipificadas usando API Resources y repositorios, componentes de React modulares y un custom hook para manejo de estado complejo.
- **Uso de features idiomáticos**:
  - *Backend*: Modelos Eloquent con relaciones complejas (Polimórficas / Muchos a Muchos), Middlewares de Autenticación (JWT), FormRequests para validación.
  - *Frontend*: React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`), Context API para estado global (Autenticación), y `IntersectionObserver` para scroll infinito de forma nativa.
- **Interacciones intuitivas, labels, foco**: UI/UX pulida utilizando Tailwind CSS con estados de `hover`, `focus`, animaciones suaves, indicadores de carga y manejo de errores visible al usuario.
- **Cobertura mínima de rutas / componentes clave**: Completamente cubierto (Login, Registro, Lista de Hilos, Creación de Mensajes Directos y Grupales, Lectura con Scroll Infinito).
- **Limpieza y consistencia**: Código refactorizado y mantenido limpio, previniendo loops y problemas de rendimiento.
- **Commits frecuentes, mensajes descriptivos**: El repositorio posee un historial continuo de git rastreando el progreso ("Historial de versiones limpio y constante").

---

## 🏗️ Estructura del Proyecto

El proyecto está dividido en dos partes principales (monorepo lógico):

- 🔗 **[Backend (Laravel API)](./backend/README.md)**: Contiene la lógica del servidor, base de datos Sqlite, rutas protegidas y endpoints. Revisa su README para detalles a fondo de la API.
- 🔗 **[Frontend (React + Vite)](./frontend/README.md)**: Contiene la aplicación de una sola página (SPA), componentes y estilos. Revisa su README para la arquitectura de la UI.

---

## 🚀 Tecnologías Utilizadas

- **Backend**: PHP 8.x, Laravel 11, SQLite, JWT Auth (Autenticación vía php-open-source-saver/jwt-auth).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React (Íconos).
- **Otros**: Git (para control de versiones con commits frecuentes y descriptivos).

---

## 🛠️ Instrucciones de Instalación y Ejecución

Para iniciar el entorno completo de forma correcta (debido al sistema en tiempo real con WebSockets, Colas "Queues" de trabajo y API HTTP), necesitarás mantener varias terminales abiertas ejecutando comandos concurrentemente.

### 1. Preparación y Migraciones (Backend)
1. Abre una terminal y navega al directorio Backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias y prepara tu base de datos:
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
3. Ejecuta las migraciones y seeders para tener la estructura de datos lista con usuarios de prueba:
   ```bash
   php artisan migrate:fresh --seed
   ```

### 2. Ejecutar Servidor, WebSockets y Queues (Backend)
Debido a que el chat propaga los mensajes nuevos usando eventos asíncronos en tiempo real mediante **Laravel Reverb**, debes abrir 3 pestañas adicionales apuntando a la carpeta `/backend` y ejecutar los siguientes procesos simultáneamente:

* **Terminal 1** (Servidor HTTP de la API):
  ```bash
  php artisan serve
  ```

* **Terminal 2** (Servidor de WebSockets):
  ```bash
  php artisan reverb:start
  ```

* **Terminal 3** (Procesador de Colas de Mensajes):
  ```bash
  php artisan queue:work
  ```
> *El backend quedará levantado escuchando en `http://127.0.0.1:8000` para HTTP y `8080` para conexiones TCP WebSocket.*

### 3. Levantar el Frontend
1. Abre una última pestaña en la terminal y navega a la carpeta del SPA de React:
   ```bash
   cd frontend
   ```
2. Instala las dependencias e inicia el servidor de Vite:
   ```bash
   npm install
   npm run dev
   ```
   > *El frontend correrá por defecto en `http://localhost:5173`*

*(Nota: Asegúrate de que las variables de entorno locales `.env` en frontend estén configuradas apuntando hacia las direcciones del entorno local API y puerto de Reverb)*

---

## 🗺️ Descripción de Endpoints Clave

El backend expone una capa API RESTful `/api/*` organizada de la siguiente manera:

* **Autenticación**:
  * `POST /login` - Iniciar sesión (Retorna token JWT).
  * `POST /register` - Crear nueva cuenta.
  * `GET /user` - Retorna los datos del usuario autenticado actual.
* **Mensajería**:
  * `GET /threads` - Lista las conversaciones (directas o grupos) en los que participa el usuario, con su último mensaje.
  * `POST /threads` - Permite crear un nuevo hilo de conversación (Grupo o Directo).
  * `GET /threads/{id}/messages` - Obtiene los mensajes de un hilo con soporte a paginación basada en cursor (`before_id` y `limit`) para Scroll Infinito.
  * `POST /threads/{id}/messages` - Envía un nuevo mensaje dentro de un hilo específico.
* **Usuarios**:
  * `GET /users/search` - Busca usuarios en el sistema (ideal para agregar contactos a nuevos chats).

*(Los detalles exactos de Payload y Responses se pueden encontrar documentados en el README del backend).*

---

## 🧠 Decisiones de Arquitectura

1. **Separación Claro de Servicios**: 
   Todo el proceso de autenticación en frontend está aislado en un Context API y Custom Hooks (`useAuth`), mientras que las llamadas API se centralizan en clientes HTTP usando Fetch dentro de `api/*` para no mezclar lógica de Request con componentes visuales.
2. **Paginación Basada en Cursor vs Offsets**: 
   Para los mensajes, en lugar de usar páginas estáticas (`page=1, page=2`), lo cual rompe la UI cuando llegan nuevos mensajes, se optó por una paginación "Cursor-based" (`before_id`), garantizando que la carga de mensajes antiguos a través del scroll siempre sea exacta sin elementos duplicados ni saltos.
3. **Escalabilidad de Tipos de Chat**: 
   La estructura de la base de datos `Thread` se hizo neutra ("is_group" flag + tabla pivot `thread_user`), esto permite manejar chats uno a uno o grupos gigantes sin necesidad de rehacer el esquema de la base de datos, además de preparar el terreno para enviar archivos u otro tipo de mensajes (`type="text"` implementado).

---

## 🚧 Retos y Soluciones

### 1. Refrescos Múltiples Incontrolables (Infinite Loop en Frontend)
* **Reto**: Al implementar la lectura de mensajes y el scroll infinito, un error clásico de React causaba que la dependencia cruzada en el hook disparara una tormenta de requests al backend, saturando la red (ERR_INSUFFICIENT_RESOURCES) e inhabilitando la PC en desarrollo.
* **Solución**: Se reescribió la arquitectura de estado del hook `useInfiniteMessages`. Se emplearon `useRef` para guardar el estado más reciente de la lista sin causar re-renders, así como un mecanismo semáforo (Locks / Identificadores de petición actual) para bloquear peticiones simultáneas, cancelando efectivamente fetches obsoletos si el usuario cambia el chat rápidamente garantizando máxima estabilidad.

### 2. Sincronización de Dependencias React
* **Reto**: Al estabilizar dependencias de React en el entorno hubo conflictos de versiones antiguas (`@types/react` vs react v19), rompiendo los "builds" de Integración Continua (CI).
* **Solución**: Resoluciones de overrides en `package.json` utilizando las features modernas para forzar compatibilidad, además de la estabilización del entorno completo con `npm ci` para resolver discrepancias en el versionamiento local/remoto de GitHub de forma limpia garantizando un repositorio predecible.

---

¡Explora el código fuente y el historial de commits para ver cómo se estructuraron estas soluciones de infraestructura en el código!
