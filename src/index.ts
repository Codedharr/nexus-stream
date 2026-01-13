// Importamos fastify 
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { logSchema } from './schemas/log.schema.js'; // Ojo a la extensión .js (cosas de ESM)
import './lib/redis.js'; // Importamos para activar la conexión (efecto secundario)
import { redis } from './lib/redis.js';
import { z } from 'zod';


//1. Inicializamos la instancia de Fastify
const server = Fastify({logger: true})

// Cambiamos la validación interna de Fastify por ZOD
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

const app = server.withTypeProvider<ZodTypeProvider>()

//2. Definimos una ruta para conocer el estado del servidor
// 2. Definimos la ruta de ingestión
app.post('/ingest', { 
  schema: { 
    // CAMBIO CLAVE: Envolvemos tu logSchema en z.array()
    // Esto valida que el body sea: [ {service:...}, {service:...} ]
    body: z.array(logSchema) 
  }
}, async (request, reply) => {
    // Como usamos z.array, Typescript sabe que 'logs' es una lista
    const logs = request.body;

    const pipeline = redis.pipeline();

    // Iteramos y metemos al tubo (sin await aquí)
    logs.forEach(log => {
        // Enriquecemos con fecha si quieres, o lo mandamos directo
        pipeline.lpush('logs_queue', JSON.stringify(log));
    });

    await pipeline.exec();

    console.log(`✅ Lote recibido: ${logs.length} logs procesados.`);
    
    // Respondemos rápido
    return reply.status(202).send({ 
        status: 'accepted', 
        count: logs.length 
    });
})

// 3. Función de arranque
const start = async () => {
  try {
    // Escuchamos en el puerto 3000
    // host: '0.0.0.0' es vital para que funcione dentro de Docker después
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Server running on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();