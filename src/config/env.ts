import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const optionalNonEmptyString = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const optionalEmail = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .pipe(z.string().email().optional());

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),

  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),

  FIREBASE_PROJECT_ID: optionalNonEmptyString,
  FIREBASE_CLIENT_EMAIL: optionalEmail,
  FIREBASE_PRIVATE_KEY: optionalNonEmptyString,

  APP_NAME: z.string().min(1).default("AidCircle"),

  DEFAULT_ALERT_RADIUS_KM: z.coerce.number().positive().default(5),

  SOS_AUTO_EXPIRE_MINUTES: z.coerce.number().int().positive().default(120),

  CORS_ALLOWED_ORIGINS: z.string().trim().optional().default(""),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return `${path}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${formattedErrors}`);
}

function parseAllowedOrigins(value: string): string[] {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,

  supabase: {
    url: parsedEnv.data.SUPABASE_URL,
    serviceRoleKey: parsedEnv.data.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: parsedEnv.data.SUPABASE_ANON_KEY,
  },

  firebase: {
    projectId: parsedEnv.data.FIREBASE_PROJECT_ID,
    clientEmail: parsedEnv.data.FIREBASE_CLIENT_EMAIL,
    privateKey: parsedEnv.data.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },

  app: {
    name: parsedEnv.data.APP_NAME,
    defaultAlertRadiusKm: parsedEnv.data.DEFAULT_ALERT_RADIUS_KM,
    sosAutoExpireMinutes: parsedEnv.data.SOS_AUTO_EXPIRE_MINUTES,
  },

  cors: {
    allowedOrigins: parseAllowedOrigins(parsedEnv.data.CORS_ALLOWED_ORIGINS),
  },
} as const;

export type AppEnv = typeof env;