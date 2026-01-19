import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379/0";
// Creamos la instacia del cliente.
export const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

redis.on('connect', () => {
  console.log('Conectado a Redis correctamente');
});

redis.on('error', (err) => {
  console.error('Error en conexión Redis:', err);
});