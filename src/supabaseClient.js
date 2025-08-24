import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ahepxjwnbtvezpgpponj.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZXB4anduYnR2ZXpwZ3Bwb25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MjMyNjksImV4cCI6MjA3MTQ5OTI2OX0.1BFDClEwuPFY_VvMsU4y0YxOrF4Z-UJxYJXexyKJlIM"
export const supabase = createClient(supabaseUrl, supabaseKey)
