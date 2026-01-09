import { redis } from './lib/redis.js';
import type { LogEntry } from './schemas/log.schema.js';

async function main() { 
    console.log('👷 WORKER INICIADO: Esperando logs en la cola...')
    while(true) {
        try {

            const result = await redis.brpop('logs_queue', 0);

            if (result) {
                const [key, logData] = result; 

                const log: LogEntry = JSON.parse(logData);
            
                console.log(`🔄 Procesando log del servicio: ${log.service}`);
                console.log(`📝 Mensaje: ${log.message}`);

                console.log('✅ Guardado (Simulado)');
                console.log('-----------------------------------');

            } else {
                console.log('No hay mensajes en la cola');
            }

        }catch(error) { 
            console.error('❌ Error procesando log:', error);
        }
    }
}

main();
