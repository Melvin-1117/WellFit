const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://zzbnaiwslpbndkwmmqlu.supabase.co";

const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6Ym5haXdzbHBibmRrd21tcWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODg4NzEsImV4cCI6MjEwMTg2NDg3MX0.k3JtbogJs9mscuIdLOD5HJ3yyJ2TOz-5Yvs8RTC8sUk";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;