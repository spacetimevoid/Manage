// =============================================================================
// Personal Study Vault - Supabase Client Configuration
// =============================================================================
// HƯỚNG DẪN: Dán Supabase Project URL và Anon Key vào dòng 8 & dòng 9 bên dưới:
// Lấy tại: Supabase Dashboard -> Project Settings -> API.
// =============================================================================

const SUPABASE_URL = ''; // <-- Dòng 8: Dán Supabase Project URL vào đây
const SUPABASE_ANON_KEY = ''; // <-- Dòng 9: Dán Supabase Anon Key vào đây

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
