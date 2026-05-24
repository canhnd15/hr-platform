import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

async function signupAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();

  const err = (msg: string) =>
    redirect(`/signup?error=${encodeURIComponent(msg)}`);

  if (!email || !password) err("Email and password are required");
  if (password.length < 8) err("Password must be at least 8 characters");
  if (!SLUG_RE.test(slug))
    err(
      "Slug must be 1-32 chars, lowercase letters/digits/hyphens, not starting or ending with a hyphen"
    );

  const supabase = createSupabaseServerClient();

  // Pre-check the slug so we can give a clean error.
  const { data: existing } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) err(`The slug "${slug}" is already taken`);

  const { data: signup, error: signupErr } = await supabase.auth.signUp({
    email,
    password,
  });
  if (signupErr) err(signupErr.message);
  if (!signup?.user) err("Signup failed — no user returned");

  // If Supabase is set to require email confirmation, the user is not yet
  // signed in. Sign in explicitly so the next insert is authenticated.
  if (!signup.session) {
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginErr) {
      redirect(
        `/login?info=${encodeURIComponent(
          "Account created. Please verify your email, then sign in to finish setup."
        )}`
      );
    }
  }

  const { data: tenant, error: tenantErr } = await supabase
    .from("tenants")
    .insert({
      slug,
      owner_user_id: signup.user!.id,
      status: "active",
      plan: "free",
    })
    .select("id")
    .single();
  if (tenantErr || !tenant) err(`Could not create tenant: ${tenantErr?.message ?? "unknown"}`);

  // bootstrap_tenant_rows trigger populated defaults — seed the profile with
  // the user's name and email so it doesn't show empty.
  await supabase
    .from("tenant_profile")
    .update({ full_name: fullName, email })
    .eq("tenant_id", tenant!.id);

  redirect("/admin");
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-canvas">
      <form
        action={signupAction}
        className="w-full max-w-sm bg-white rounded-2xl shadow-modal p-8 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-dark-1">Create your site</h1>
          <p className="text-sm text-gray-1">
            Get your own recruiting site at{" "}
            <code className="bg-gray-5 px-1 py-0.5 rounded">/u/&lt;slug&gt;</code>
          </p>
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
          <span className="font-medium text-dark-1">Full name</span>
          <input
            type="text"
            name="full_name"
            required
            className="border border-gray-3 rounded-md h-11 px-3 focus:border-primary focus:outline-none"
            placeholder="Jane Doe"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-dark-1">Site slug</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-2 text-sm">/u/</span>
            <input
              type="text"
              name="slug"
              required
              pattern="[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?"
              className="flex-1 border border-gray-3 rounded-md h-11 px-3 focus:border-primary focus:outline-none"
              placeholder="jane"
            />
          </div>
        </label>

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
            minLength={8}
            autoComplete="new-password"
            className="border border-gray-3 rounded-md h-11 px-3 focus:border-primary focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="bg-primary text-white rounded-full h-11 font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors"
        >
          Create account
        </button>

        <p className="text-sm text-gray-1 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
