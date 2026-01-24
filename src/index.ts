import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from './lib/prisma.js';
import { logSchema, querySchema } from './schemas/log.schema.js'; 
import './lib/redis.js'; 
import { redis } from './lib/redis.js';
import { z } from 'zod';
import authPlugin from './plugins/auth.js';

const server = Fastify({logger: true})

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

const app = server.withTypeProvider<ZodTypeProvider>()
await app.register(authPlugin);

app.post('/ingest', { 
  schema: {
    body: z.array(logSchema) 
  }
}, async (request, reply) => {

    const logs = request.body;

    const pipeline = redis.pipeline();

    logs.forEach(log => {
        pipeline.lpush('logs_queue', JSON.stringify(log));
    });

    await pipeline.exec();

    console.log(`Lote recibido: ${logs.length} logs procesados.`);

    return reply.status(202).send({ 
        status: 'accepted', 
        count: logs.length 
    });
})


app.get('/logs', {
    schema: {
        querystring: querySchema 
    }
}, async (request, reply) => {

    const { page, limit, level, service } = request.query;
    console.log(level, service)

    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (level) whereClause.level = level;
    if (service) whereClause.service = service;

    try {
        const [logs, total] = await Promise.all([
            prisma.log.findMany({
                take: limit, 
                skip: skip,
                where: whereClause,
                orderBy: { timestamp: 'desc' }
            }),
            prisma.log.count({ where: whereClause })
        ]);

        return reply.status(200).send({
            status: 'ok',
            data: logs,
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Error interno' });
    }
});

const start = async () => {
  try {
    // Escuchamos en el puerto 3000
    // host: '0.0.0.0' es importante para que funcione dentro de Docker
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();