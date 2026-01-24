import fp from 'fastify-plugin'; 
import { FastifyPluginAsync } from 'fastify';
import crypto from 'node:crypto'; 

const authPlugin: FastifyPluginAsync = async (fastify) => {

  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error('FATAL: API_KEY no está definida en las variables de entorno.');
  }

  fastify.addHook('onRequest', async (request, reply) => {
    
    const apiKeyHeader = request.headers['x-api-key'];

    if (!apiKeyHeader) {
      return reply.code(401).send({ 
        error: 'Unauthorized', 
        message: 'Falta la cabecera x-api-key' 
      });
    }

    if (typeof apiKeyHeader !== 'string') {
      return reply.code(401).send({ error: 'Unauthorized', message: 'API Key inválida' });
    }

    const bufferKey = Buffer.from(API_KEY);
    const bufferHeader = Buffer.from(apiKeyHeader);

    if (bufferKey.length !== bufferHeader.length || 
        !crypto.timingSafeEqual(bufferKey, bufferHeader)) {

      return reply.code(401).send({ error: 'Unauthorized', message: 'Credenciales incorrectas' });
    }

  });
};

export default fp(authPlugin);