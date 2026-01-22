import * as z from "zod";

export const logSchema = z.object({
    timestamp: z.iso.datetime(),
    level: z.enum(['info', 'warn', 'error', 'fatal']), 
    service: z.string().min(1),
    message: z.string(),
    meta: z.record(z.string(), z.any()).optional(),
})

export const querySchema = z.object({
    level: z.enum(['info', 'warn', 'error', 'fatal']).optional(),
    service: z.string().min(1).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});

export type LogEntry = z.infer<typeof logSchema>
export type Query = z.infer<typeof querySchema>