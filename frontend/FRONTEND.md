# Mi Inbox - Frontend (SPA)

Aplicación de mensajería moderna construida con **React 19**, enfocada en la velocidad, interactividad en tiempo real y una experiencia de usuario premium con **Tailwind CSS 4**.
<p align="center">
  <img src="https://github.com/user-attachments/assets/6dffa34d-e49e-4a0f-84c6-5cda099b17e5" alt="Resultado de pruebas adicional" width="900">
</p>


---

## 🏗️ Justificación de Librerías

- **`React 19`**: Aprovecha las últimas mejoras en rendimiento y gestión de estados concurrentes.
- **`Tailwind CSS 4`**: Motor de estilos ultra-rápido que permite una UI altamente personalizada y fluida.
- **`Laravel Echo & Pusher-js`**: Capa de abstracción para conectar con Reverb y sincronizar mensajes en tiempo real.
- **`React Hot Toast`**: Sistema de notificaciones no intrusivo y ligero.
- **`React Intersection Observer`**: Utilizado para implementar el **Scroll Infinito** de forma eficiente sin saturar la memoria.

---

## 🧠 Custom Hooks (Motores del Sistema)

- **`useAuth`**: Centraliza la autenticación, gestiona el perfil y escucha el evento `session.kicked` para cerrar la sesión si se inicia en otro dispositivo.
- **`useInfiniteMessages`**: El corazón del chat. Maneja la carga paginada de mensajes antiguos y la inserción de nuevos mediante WebSockets con lógica de "semáforos" para evitar bucles de red.
- **`useInfiniteThreads`**: Gestiona la lista de conversaciones y la búsqueda dinámica de hilos.
- **`useUsers`**: Permite buscar contactos en tiempo real para iniciar nuevos chats.

---

## 🛠️ Instalación y Ejecución

1. **Entrar al directorio**: `cd frontend`
2. **Instalar dependencias**: `npm install`
3. **Configurar Entorno**: 
   - `cp .env.example .env`
   - Asegúrate de que los valores de Reverb coincidan con los del backend (ver tabla abajo).

### 🔄 Sincronización de Entorno (Real-Time)

| Variable Frontend | Requisito Backend | Propósito |
| :--- | :--- | :--- |
| `VITE_REVERB_APP_KEY` | `REVERB_APP_KEY` | Identificador único de la app |
| `VITE_REVERB_HOST` | `REVERB_HOST` | Dirección del servidor de sockets |
| `VITE_REVERB_PORT` | `REVERB_PORT` | Puerto de escucha (Default: 8080) |

4. **Ejecutar**: `npm run dev`

---
© 2026 Mi Inbox Frontend - Interfaz de Usuario de Siguiente Generación.
