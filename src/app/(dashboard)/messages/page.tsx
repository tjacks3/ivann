import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Messages</h1>
      <p className="mt-2 text-muted-foreground">
        Real-time messaging will go here.
      </p>
    </div>
  );
}
