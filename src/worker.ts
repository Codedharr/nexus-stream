import { redis } from './lib/redis.js';
import { prisma } from './lib/prisma.js'; 
import type { LogEntry } from './schemas/log.schema.js';

async function main() { 
    console.log('WORKER INICIADO: Conectado a Redis y Postgres...');

    while(true) {
        try {
            // "Bloqueamos" el hilo hasta que llegue un mensaje (0 significa espera infinita)
            const result = await redis.brpop('logs_queue', 0);

            if (result) {
                const [key, logData] = result; 
                
                // Parseamos el JSON que viene de Redis
                const log: LogEntry = JSON.parse(logData);
            
                console.log(`Procesando log: ${log.service} [${log.level}]`);

                // 2. INSERCIÓN REAL EN BASE DE DATOS
                // Usamos 'await' porque escribir en disco toma tiempo
                const savedLog = await prisma.log.create({
                    data: {
                        service: log.service,
                        level:   log.level,
                        message: log.message,
                        // Si 'meta' viene undefined, pasamos un objeto vacío o null
                        // Prisma se encarga de convertirlo a JSONB automáticamente
                        meta:    log.meta || {}, 
                        
                        // NOTA: No enviamos 'timestamp' ni 'id'.
                        // PostgreSQL los genera automáticamente gracias a @default(now()) y @autoincrement()
                    }
                });

                console.log(`Guardado en DB con ID: ${savedLog.id}`);
                console.log('-----------------------------------');

            } 

        } catch(error) { 
            console.error('Error crítico procesando log:', error);
            // IMPORTANTE: En un sistema real, aquí podrías enviar el log fallido
            // a una "Dead Letter Queue" para no perderlo.
        }
    }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });