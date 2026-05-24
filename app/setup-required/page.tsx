export default function SetupRequiredPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-canvas">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-modal p-8 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-dark-1">Supabase not configured</h1>
        <p className="text-sm text-dark-1 leading-relaxed">
          The admin area needs a Supabase connection. To unlock it:
        </p>
        <ol className="text-sm text-dark-1 leading-7 list-decimal pl-5">
          <li>
            Create a project at{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold"
            >
              supabase.com
            </a>
            .
          </li>
          <li>
            Copy <code className="bg-gray-5 px-1 rounded">.env.local.example</code>{" "}
            to <code className="bg-gray-5 px-1 rounded">.env.local</code> and fill
            the three values.
          </li>
          <li>
            Apply{" "}
            <code className="bg-gray-5 px-1 rounded">
              supabase/migrations/0001_init.sql
            </code>{" "}
            in the Supabase SQL editor.
          </li>
          <li>Restart <code className="bg-gray-5 px-1 rounded">npm run dev</code>.</li>
        </ol>
        <p className="text-sm text-gray-1">
          The public demo at <a href="/u/demo" className="text-primary font-semibold">/u/demo</a> keeps
          working without Supabase.
        </p>
      </div>
    </main>
  );
}
