import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 dark:bg-neutral-950">
      <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white">
        Real Estate OS
      </h1>
      <Link
        href="/dashboard"
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}