import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-canvas text-dark-1 flex flex-col">
      <header className="w-full px-8 py-5 flex items-center justify-between">
        <div className="font-bold text-lg">HR Sites</div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-1 hover:text-dark-1">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-full shadow-btn-primary hover:bg-primary-hover transition-colors"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl text-center flex flex-col items-center gap-6">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
            Your own recruiting site —
            <br />
            <span className="text-primary">live in minutes.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-1 max-w-2xl">
            A personal site for HR pros and recruiters: post jobs, collect
            applications, share your story. Pick a theme, drop in your jobs,
            send the link.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Link
              href="/signup"
              className="bg-primary text-white px-6 py-3 rounded-full font-semibold shadow-btn-primary hover:bg-primary-hover transition-colors"
            >
              Create your site
            </Link>
            <Link
              href="/u/demo"
              className="border border-gray-3 text-dark-1 px-6 py-3 rounded-full font-semibold hover:bg-gray-5 transition-colors"
            >
              View live demo
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full px-8 py-6 text-sm text-gray-2 text-center">
        Built as a multi-tenant template — each HR gets their own site at{" "}
        <code className="bg-gray-5 px-1.5 py-0.5 rounded">/u/&lt;slug&gt;</code>.
      </footer>
    </main>
  );
}
