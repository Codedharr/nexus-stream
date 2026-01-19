import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'

const connectionString = `${process.env.DATABASE_URL}`

const globalForPrisma = global as unknown as { prisma: PrismaClient };


const adapter = new PrismaPg({ connectionString })
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

export { prisma }