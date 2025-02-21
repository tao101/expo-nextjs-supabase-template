import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_NATIVE_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_NATIVE_SUPABASE_ANON_KEY!;

import { Database } from "../../../../shared/supabaseTypes";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
