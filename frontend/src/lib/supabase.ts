import { createClient } from "@supabase/supabase-js";

const fallbackUrl = "https://gcwbrvdjnrovzlwbitwz.supabase.co";
const fallbackAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdjd2JydmRqbnJvdnpsd2JpdHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MjcyOTUsImV4cCI6MjEwMzQwMzI5NX0.0lJ5Na8ekgOiCmD7dGKfgW54ZWMi5pjtXf43niwD21w";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? fallbackUrl,
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? fallbackAnonKey,
);