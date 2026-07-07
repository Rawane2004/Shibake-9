const SUPABASE_URL = "https://geqaulhohhrupwnltgrl.supabase.co";

const SUPABASE_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcWF1bGhvaGhydXB3bmx0Z3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDY5MTcsImV4cCI6MjA5MzY4MjkxN30.z15zVwYk9WqJqJWb4JcErfqA6qqx3I-00LzxJIyqbck";


const supabase= window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);