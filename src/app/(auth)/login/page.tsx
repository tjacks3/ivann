import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Sign in to ivann</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Auth form will go here.
      </p>
    </div>
  );
}
