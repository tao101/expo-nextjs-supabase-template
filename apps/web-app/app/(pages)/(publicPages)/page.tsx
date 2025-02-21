"use client";
import { supabaseClient } from "@/services/supabase/createSupabaseClient";
import { generateRandomId } from "@shared/utils/generateRandomId";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      console.log("fetching user");
      const {
        data: { user },
        error,
      } = await supabaseClient.auth.getUser();
      console.log("user", user);
      if (error) {
        console.error("error", error);
      }
      setUser(user);
    } catch (error) {
      console.error("error", error);
    }
  };

  const signInWithGoogle = async () => {
    console.log("signing in with google");
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        //skipBrowserRedirect: true,
      },
    });
    if (error) {
      console.error("error signing in with google", error);
    }
  };

  const handleSignOut = async () => {
    console.log("signing out");
    await supabaseClient.auth.signOut();
    fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <div className="flex-1 bg-red-300">
      <p>{generateRandomId()}</p>
      <p>user : {user?.email}</p>

      {user && (
        <div className="flex gap-2 py-10 flex-col w-[300px]">
          <Link
            className="bg-blue-500 text-center text-white p-2 rounded-md"
            href="/dashboard"
            prefetch={true}
          >
            Dashboard
          </Link>
          <button
            className="bg-blue-500 text-white p-2 rounded-md"
            onClick={handleSignOut}
          >
            sign out
          </button>
        </div>
      )}
      {!user && (
        <div className="flex gap-2 py-10 flex-col w-[300px]">
          <button
            className="bg-blue-500 text-center text-white p-2 rounded-md"
            onClick={signInWithGoogle}
          >
            google login
          </button>
          <Link
            className="bg-blue-500 text-center text-white p-2 rounded-md"
            href="/signin"
            prefetch={true}
          >
            sign in page
          </Link>
          <Link
            className="bg-blue-500 text-center text-white p-2 rounded-md"
            href="/signup"
            prefetch={true}
          >
            sign up page
          </Link>
        </div>
      )}
    </div>
  );
}
