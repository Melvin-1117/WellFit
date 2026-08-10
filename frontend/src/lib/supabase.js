import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://zzbnaiwslpbndkwmmqlu.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Ym5haXdzbHBibmRrd21tcWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODg4NzEsImV4cCI6MjEwMTg2NDg3MX0.k3JtbogJs9mscuIdLOD5HJ3yyJ2TOz-5Yvs8RTC8sUk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };