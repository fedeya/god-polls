import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default("development"),

  CLIENT_ID: z.string().optional(),
  CLIENT_SECRET: z.string().optional(),

  SIGNING_SECRET: z.string(),
  BOT_ID: z.string().optional(),
  TOKEN: z.string().optional(),
  APP_TOKEN: z.string(),

  DATABASE_URL: z.string(),
})

export const env = envSchema.parse(process.env);
