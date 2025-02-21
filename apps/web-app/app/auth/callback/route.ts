import { createSupabaseServer } from "@/services/supabase/createSupabaseServer";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    if (!code) {
      throw new Error("No code provided");
    }

    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(
        `${origin}/?error=${encodeURIComponent(error.message)}`
      );
    }

    // Successful authentication
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent("Authentication failed")}`
    );
  }
}
