import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Your Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Profile editor will go here.
      </p>
    </div>
  );
}
