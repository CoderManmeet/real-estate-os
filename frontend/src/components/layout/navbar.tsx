import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white/80 px-6 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="text-sm text-neutral-500 dark:text-neutral-400">
        Welcome back
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </header>
  );
}