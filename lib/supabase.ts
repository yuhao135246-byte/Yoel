import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    cache: "no-store"
  });

export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        global: {
          fetch: noStoreFetch
        }
      })
    : null;
export const supabaseAdmin =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        global: {
          fetch: noStoreFetch
        },
        auth: {
          persistSession: false
        }
      })
    : null;
