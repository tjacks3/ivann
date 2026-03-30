import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Registration form will go here.
      </p>
    </div>
  );
}
