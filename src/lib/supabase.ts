import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Supabase row types (matches DB schema) ──

export interface SupabaseCategory {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface SupabaseTodo {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  completed: boolean;
  order_index: number;
  completed_at: string | null;
  created_at: string;
}

export interface SupabaseRecord {
  id: string;
  user_id: string;
  category_id: string;
  todo_id: string;
  content: string;
  collapsed: boolean;
  created_at: string;
}
