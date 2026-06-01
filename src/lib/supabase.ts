import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "../config/env.js";

const supabaseClientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "X-Application-Name": env.app.name,
    },
  },
};

export const supabaseAdmin: SupabaseClient = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey,
  supabaseClientOptions,
);

export const supabaseAnon: SupabaseClient = createClient(
  env.supabase.url,
  env.supabase.anonKey,
  supabaseClientOptions,
);