import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    AUTH_GITHUB_ID: z.string().min(1),
    AUTH_GITHUB_SECRET: z.string().min(1),
    ADMIN_EMAILS: z.string().min(1),
    STORAGE_R2_ACCOUNT_ID: z.string().min(1),
    STORAGE_R2_ACCESS_KEY_ID: z.string().min(1),
    STORAGE_R2_SECRET_ACCESS_KEY: z.string().min(1),
    STORAGE_R2_BUCKET_NAME: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    // URL pública do bucket R2 (não é segredo — é a base das <img src>
    // exibidas a qualquer visitante). Precisa estar aqui, não em `server`,
    // porque componentes client (galeria pública) leem via getPublicUrl()
    // — ver src/lib/storage/public-url.ts e docs/architecture/known-issues.md.
    NEXT_PUBLIC_STORAGE_R2_PUBLIC_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    STORAGE_R2_ACCOUNT_ID: process.env.STORAGE_R2_ACCOUNT_ID,
    STORAGE_R2_ACCESS_KEY_ID: process.env.STORAGE_R2_ACCESS_KEY_ID,
    STORAGE_R2_SECRET_ACCESS_KEY: process.env.STORAGE_R2_SECRET_ACCESS_KEY,
    STORAGE_R2_BUCKET_NAME: process.env.STORAGE_R2_BUCKET_NAME,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_STORAGE_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_STORAGE_R2_PUBLIC_URL,
  },
});
