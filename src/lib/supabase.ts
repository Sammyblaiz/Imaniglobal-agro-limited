import { createClient } from "@supabase/supabase-js";

// AI Studio injects user secrets as environment variables.
// If the user hasn't added them in the Secrets menu, these will fall back to undefined.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://jajcgwmwepwtkielavey.supabase.co";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphamNnd213ZXB3dGtpZWxhdmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODY4MDEsImV4cCI6MjA5MTg2MjgwMX0.XdwdLB38zT85sjK2wRSjIJHS8EuxcLDwybYWorXdNiY";

// Create and export the Supabase client so it can be used anywhere in the React app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
