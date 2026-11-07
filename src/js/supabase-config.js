// =============================================================================
// Personal Study Vault - Supabase Client Configuration
// =============================================================================
// HƯỚNG DẪN: Dán Supabase Project URL và Anon Key vào dòng 8 & dòng 9 bên dưới:
// Lấy tại: Supabase Dashboard -> Project Settings -> API.
// =============================================================================

// Clean URL (bỏ /rest/v1/ nếu người dùng vô tình dán thừa)
const rawUrl = 'https://zjgldhqggxnsnvxbdgcv.supabase.co';
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZ2xkaHFnZ3huc252eGJkZ2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMjUyNDgsImV4cCI6MjEwOTYwMTI0OH0.ricjQE5t9Kq1nMc43Pbvw4XsqqgPkwb-br1lJ5w5In8';

// Khởi tạo Supabase client toàn cục qua CDN (@supabase/supabase-js)
let supabaseClient = null;

if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}

// Export ra window để toàn bộ ứng dụng sử dụng thống nhất
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.supabaseClient = supabaseClient;
var supabase = supabaseClient;
