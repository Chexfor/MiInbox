# Mi Inbox - Backend (API)

Esta es la capa de lógica, persistencia y tiempo real de la plataforma **Mi Inbox**, construida sobre **Laravel 11** siguiendo principios de **Domain-Driven Design (DDD)** y **CQRS (Command-Query Responsibility Segregation)**.

---

## 🏗️ Justificación de Módulos Elegidos

- **`Laravel Reverb`**: Seleccionado para manejar WebSockets de alta velocidad de forma nativa dentro del ecosistema Laravel.
- **`PHPOpenSourceSaver\JWTAuth`**: Implementa la autenticación segura y sin estado (stateless) necesaria para una API, permitiendo el control de **Multisesión** mediante el identificador JTI.
- **`Laravel Queues`**: Utilizado para procesar el envío de mensajes y notificaciones de forma asíncrona, mejorando el tiempo de respuesta de la API.

> [!WARNING]
> **Nota de Seguridad**: Aunque la librería `L5-Swagger` está instalada, su configuración y exposición pública han sido omitidas deliberadamente para evitar **fugas de información** sobre la estructura interna de los endpoints y modelos de la base de datos.

---

## 🏛️ Arquitectura Técnica (DDD + CQRS)

El código se organiza en capas para facilitar su mantenimiento:

- **Dominio (`app/Domain`)**: Contiene las entidades (`User`, `Thread`, `Message`) y las reglas de negocio puras.
- **Aplicación (`app/Application`)**: Orquestación de lógica mediante **Handlers** que ejecutan **Commands** (acciones) y **Queries** (consultas).
- **Infraestructura (`app/Infrastructure`)**: Implementaciones técnicas (Repositorios, integración con Reverb).

---

## 🛠️ Guía de Ejecución Técnica

1. **Entrar al directorio**: `cd backend`
2. **Instalar dependencias**: `composer install`
3. **Configurar Entorno**: 
   - `cp .env.example .env`
   
   > [!IMPORTANT]
   > **COMANDOS MANDATORIOS DE IDENTIDAD**:
   > Estos comandos deben ejecutarse para que la aplicación sea segura y los tokens funcionen:
   > 1. `php artisan key:generate` (Encriptación de Laravel)
   > 2. `php artisan jwt:secret` (Firma de tokens JWT)

4. **Base de Datos**: 
   - `touch database/database.sqlite`
   - `php artisan migrate:fresh --seed`

5. **Sincronización de Tiempo Real (Reverb)**:
   Asegúrate de que las llaves en el `.env` del backend coincidan con las del frontend. Valores recomendados para desarrollo local:
   - `REVERB_APP_KEY=3isavfisgallyp3ovbxn`
   - `REVERB_HOST=localhost`
   - `REVERB_PORT=8080`

6. **Servicios (3 Terminales abiertas en /backend)**:
   - **HTTP**: `php artisan serve`
   - **WebSockets**: `php artisan reverb:start`
   - **Colas**: `php artisan queue:work`

---

## ☑️ Pruebas (Tests)
Para validar el sistema completo y asegurar la calidad del código: `php artisan test`
<p align="center"><img src="https://github.com/user-attachments/assets/948de741-fab1-4d6a-bcb0-2eb299c4e188" alt="Resultado de pruebas" width="700"></p>```
---
© 2026 Mi Inbox Backend - Ingeniería de Software de Alta Calidad.
