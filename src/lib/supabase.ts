import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://pvnbkejjhrwilehsvvkr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bmJrZWpqaHJ3aWxlaHN2dmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTE1OTMsImV4cCI6MjA2NDU4NzU5M30.P_mz5TBcZtfnQ6AMeGGT-pBs3l-DSOOc20-pzbpUpY4';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);