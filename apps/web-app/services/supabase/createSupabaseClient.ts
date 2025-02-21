import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../../../../shared/supabaseTypes";
const createSupabaseClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export const supabaseClient = createSupabaseClient();
