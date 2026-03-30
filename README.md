# Mi Inbox - Plataforma de Mensajería Estabilizada

Mi Inbox es una solución corporativa de mensajería interna diseñada para alta disponibilidad y tiempo real. Este documento proporciona la guía definitiva para poner en marcha el sistema desde cero sin complicaciones.

---

## 🏗️ Decisiones de Arquitectura y Seguridad

- **DDD + CQRS**: Estructura robusta para separar la intención del usuario de la lógica de persistencia.
- **Multisesión Inteligente**: Seguimiento de **JTI** para permitir que un usuario "patee" (Kick) su propia sesión en otros dispositivos de forma inmediata.
- **Mensajería Instantánea**: Uso de **Laravel Reverb** con eventos `ShouldBroadcastNow` para eliminar latencias de cola en acciones críticas.

<p align="center">
  <img src="https://github.com/user-attachments/assets/f5bac80b-3017-4adf-b6a3-ebca2af2bf70" alt="image" width="800">
</p>

---

## 🚀 Guía de Instalación

### 1. Preparación del Backend
```bash
cd backend
composer install
cp .env.example .env

# COMANDOS IMPERATIVOS DE IDENTIDAD (Ejecutar en orden)
php artisan key:generate  # Genera la llave de encriptación de Laravel
php artisan jwt:secret    # Genera el secreto para firma de tokens JWT

# Base de datos
touch database/database.sqlite
php artisan migrate:fresh --seed
```

### 2. Configuración Maestra (.env)
Para que el tiempo real funcione, los valores de **Reverb** deben estar perfectamente sincronizados entre ambos extremos. Copia estos valores en tus archivos `.env`:

| Variable Backend | Variable Frontend (VITE) | Valor Recomendado |
| :--- | :--- | :--- |
| `REVERB_APP_KEY` | `VITE_REVERB_APP_KEY` | `3isavfisgallyp3ovbxn` |
| `REVERB_HOST` | `VITE_REVERB_HOST` | `localhost` |
| `REVERB_PORT` | `VITE_REVERB_PORT` | `8080` |
| `REVERB_SCHEME` | `VITE_REVERB_SCHEME` | `http` |

> [!IMPORTANT]
> Si cambias el puerto de Reverb en el backend, debes actualizarlo inmediatamente en el frontend para evitar errores de conexión (handshake).

### 3. Ejecución de Servicios (Mantener 4 terminales abiertas)
## Dentro de la carpeta backend
1. **API**: `php artisan serve`
2. **WebSockets (Reverb)**: `php artisan reverb:start`
3. **Procesador de Colas**: `php artisan queue:work`
4. **Dentro de la carpeta Frontend**: `npm install , npm run dev`

<details>
  <summary>📸 Haz clic para ver las terminales en ejecución</summary>
  
  #### Backend
  ![Backend](https://github.com/user-attachments/assets/2682a00a-2fe9-4827-b86e-83de849f3acb)
  
  #### Cliente Frontend
  ![Frontend](https://github.com/user-attachments/assets/b35c6887-789c-4992-bb74-ecfdd40fca98)
</details>
---

## ☑️ Verificación de Calidad (Tests)
Para asegurar que la lógica de mensajería y el control de sesiones son correctos:
```bash
cd backend
php artisan test
```
<p align="center"><img src="https://github.com/user-attachments/assets/948de741-fab1-4d6a-bcb0-2eb299c4e188" alt="Resultado de pruebas" width="700"></p>```
---

## 🗺️ Documentación Adicional
- 🔗 **[Backend Specs](./backend/BACKEND.md)**: Flujos DDD/CQRS, Controladores y Migraciones.
- 🔗 **[Frontend Specs](./frontend/FRONTEND.md)**: Hooks maestros (`useAuth`, `useInfiniteMessages`), UI con Tailwind 4.

---

## 🧠 Retos Superados
- **Loops de Red**: Estabilización del scroll infinito para evitar saturación de peticiones.
- **CORS & Auth**: Configuración avanzada para permitir sesiones cruzadas seguras.
- **Sincronización Transaccional**: Aseguramos que los eventos de tiempo real se disparen solo cuando la base de datos ha confirmado el guardado.

---
© 2026 Mi Inbox Project - Ingeniería de Software Nivel Senior.
