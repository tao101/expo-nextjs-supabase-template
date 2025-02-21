import { createSupabaseServer } from "@/services/supabase/createSupabaseServer";
import Link from "next/link";
import { redirect } from "next/navigation";

// Server action for signing out
async function signOut() {
  "use server";

  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Protected Page</h1>
      <p>
        User: {user?.email} with role: {user?.user_metadata?.user_role}
      </p>
      <Link
        className="bg-blue-500 text-center text-white p-2 rounded-md"
        href="/"
        prefetch={true}
      >
        Home Page
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </form>
      <div className="w-full max-w-7xl">
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}
