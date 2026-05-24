import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email and password are required")}`);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(next);
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-canvas">
      <form
        action={loginAction}
        className="w-full max-w-sm bg-white rounded-2xl shadow-modal p-8 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-dark-1">Sign in</h1>
          <p className="text-sm text-gray-1">Welcome back.</p>
        </div>

        {searchParams.error && (
          <p
            role="alert"
            className="text-sm text-[#d70000] bg-[#fce9e9] rounded-md px-3 py-2"
          >
            {searchParams.error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark-1">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="border border-gray-3 rounded-md h-11 px-3 focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark-1">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="border border-gray-3 rounded-md h-11 px-3 focus:border-primary focus:outline-none"
          />
        </label>

        <input type="hidden" name="next" value={searchParams.next ?? "/admin"} />

        <button
          type="submit"
          className="bg-primary text-white rounded-full h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors"
        >
          Sign in
        </button>

        <p className="text-sm text-gray-1 text-center">
          New here?{" "}
          <Link href="/signup" className="text-primary font-semibold">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
