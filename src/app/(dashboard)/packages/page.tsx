import type { Metadata } from "next";

export const metadata: Metadata = { title: "Packages" };

export default function PackagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Your Packages</h1>
      <p className="mt-2 text-muted-foreground">
        Package management will go here.
      </p>
    </div>
  );
}
