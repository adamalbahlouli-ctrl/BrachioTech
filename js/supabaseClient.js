/**
 * BrachioTech — Supabase Central Configuration
 * 
 * Replace SUPABASE_PROJECT_URL and SUPABASE_ANON_KEY with your project credentials
 * from Supabase Dashboard -> Project Settings -> API.
 */

import { createClient } from '@supabase/supabase-js';

// ---- Supabase Configuration ----
// Replace these with your actual Supabase project URL and anon public key
const supabaseUrl = 'https://faofhzkqaonsxdnhapxk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhb2ZoemtxYW9uc3hkbmhhcHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDE5MDcsImV4cCI6MjEwNDAxNzkwN30.sJilxxwywdaHhXgvwASLNctklYcx4xNDBZcQScBC92k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
