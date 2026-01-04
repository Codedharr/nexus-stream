# Nexus-Stream

High-Throughput Log Ingestion & Real-Time Analysis Engine

**NexusStream** es un sistema de backend diseñado para manejar la ingesta masiva de logs de servidores, procesarlos de manera asíncrona y permitir visualización en tiempo real. A diferencia de las soluciones monolíticas tradicionales, este proyecto implementa una **Arquitectura Desacoplada (Event-Driven)** para garantizar que la API de ingesta nunca se bloquee, incluso bajo picos de tráfico intenso.

## Arquitectura del Sistema

El sistema utiliza un patrón **Producer-Consumer** para separar la recepción de datos de su procesamiento pesado.

* A --> [Client Servers] -->|HTTP POST /ingest| B(Ingestion API - Fastify)
* B --> |Validation Zod| B
* B --> |Async Push| C[(Redis Queue)]
* C --> |Pull| D[Worker Service]
* D --> |Persist| E[(Time-Series DB)]
* D --> |Alert| F[Real-Time Dashboard]


### Tech Stack & Decisiones de Ingeniería

Estamos en 2026. El rendimiento y la seguridad de tipos son innegociables.
* **Runtime:** *Node.js* (ES Modules).
* **API Framework:** *Fastify v5*. Ya que Express es demasiado lento para ingesta de alto rendimiento. Fastify ofrece hasta 30k req/sec con menor overhead.
* **Lenguaje:** *TypeScript v5.9* (Strict Mode). La seguridad de tipos en tiempo de compilación previene el 90% de los errores en producción (undefined is not a function).
* **Validación:** *Zod v4*. La Validación en tiempo de ejecución (Runtime). Implementamos el patrón "Parse, don't validate" para garantizar que ningún dato sucio llegue a la capa de negocio.
* **Cola de Mensajes (Próximamente):** *Redis*. Para manejar contrapresión (Backpressure). Si la base de datos se ralentiza, la API sigue respondiendo rápido porque solo escribe en memoria (Redis).

## Instalación y Uso Local

Este proyecto requiere Node.js 22+ y Docker.

1. **Clonar el repositorio:** `git clone https://github.com/Codedharr/nexus-stream.git cd nexus-stream`
2. **Instalar dependencias:** `npm install`
3. **Iniciar en Modo Desarrollo:** Usé tsx para ejecución directa de TypeScript sin compilación intermedia en dev. `npm run dev`
4. *El servidor iniciará en* `http://localhost:3000`

## API Reference

1. **Ingesta de Logs** 

    Recibe un log, lo valida estrictamente y lo encola para procesamiento.
    * Endpoint: `POST /ingest`
    * Content-Type: `application/json`

    **Ejemplo Válido**

    ```
        {
        "timestamp": "2026-01-04T15:30:00Z", 
        "level": "error",
        "service": "payment-gateway",
        "message": "Connection timeout to bank API",
        "meta": {
                "retryCount": 3,
                "region": "us-east-1"
            }
        }
    ```
    
    **Respuesta de Error (Validación Zod)**

    Si envías datos incorrectos (ej. fecha mal formada o nivel inválido), el servidor protege la infraestructura y responde `400 Bad Request`:

    ```
        {
        "statusCode": 400,
        "error": "Bad Request",
        "message": "body/timestamp Invalid input: expected string, received undefined"
        }
    ```
## Roadmap de Desarrollo

Este proyecto está siendo construido iterativamente siguiendo principios de CI/CD y Clean Architecture. 

* Fase 1: API Core & Validation

    * Configuración de entorno profesional (TS, ESLint).
    * Implementación de Fastify Server.
    * Integración de Zod v4 para validación estricta de esquemas.

* Fase 2: Infraestructura & Colas (En Progreso)

    * Configuración de Docker Compose.
    * Implementación de Redis como Message Broker.

* Fase 3: Procesamiento Asíncrono

    * Creación de Workers para procesar logs en background.
    * Conexión a Base de Datos.

* Fase 4: Observabilidad

    * Dashboard en tiempo real con WebSockets.

## Autor 

Desarrollado con ❤️ y mucho café por Daniel Rendón. Futuro Ingeniero de Computación actualmente enfocado en Arquitectura Backend y Escalabilidad.