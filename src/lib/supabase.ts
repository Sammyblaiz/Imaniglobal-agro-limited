import { createClient } from "@supabase/supabase-js";

// AI Studio injects user secrets as environment variables.
// If the user hasn't added them in the Secrets menu, these will fall back to undefined.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://dczoxzxxnsfxwzjfuhzq.supabase.co";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjem94enh4bnNmeHd6amZ1aHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzA1MjcsImV4cCI6MjA5MjAwNjUyN30.Ikx7hLX26iHXQtr-E50dX1rpH171gOkfyLCZysHsVRM";

// Create and export the Supabase client so it can be used anywhere in the React app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
