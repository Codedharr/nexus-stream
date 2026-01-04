import * as z from "zod";

export const logSchema = z.object({
    timestamp: z.iso.datetime(),
    level: z.enum(['info', 'warn', 'error', 'fatal']), 
    service: z.string().min(1),
    message: z.string(),
    meta: z.record(z.string(), z.any()).optional(),
})

export type LogEntry = z.infer<typeof logSchema>