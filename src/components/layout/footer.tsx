import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <p>&copy; {new Date().getFullYear()} ivann. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-primary">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-primary">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
