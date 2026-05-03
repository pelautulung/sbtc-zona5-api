// lib/supabase.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !service) { console.error('Missing Supabase env vars'); process.exit(1); }
const supabase = createClient(url, anon, { auth: { persistSession: false } });
const supabaseAdmin = createClient(url, service, { auth: { persistSession: false } });
module.exports = { supabase, supabaseAdmin };
