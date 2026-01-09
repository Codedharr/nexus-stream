// Importamos fastify 
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { logSchema } from './schemas/log.schema.js'; // Ojo a la extensión .js (cosas de ESM)
import './lib/redis.js'; // Importamos para activar la conexión (efecto secundario)
import { redis } from './lib/redis.js';


//1. Inicializamos la instancia de Fastify
const server = Fastify({logger: true})

// Cambiamos la validación interna de Fastify por ZOD
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

const app = server.withTypeProvider<ZodTypeProvider>()

//2. Definimos una ruta para conocer el estado del servidor
app.post('/ingest', { schema: { body: logSchema}
}, async (request, reply) => {
    const log = request.body;

    // Insertamos en redis en una cola de logs
    const logString = JSON.stringify(log);
    await redis.lpush('logs_queue', logString); 

    console.log('✅ Log recibido y validado:', log);
    console.log(`Servicio: ${log.service} | Nivel: ${log.level}`);
    
  return reply.status(202).send({ status: 'accepted' });
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