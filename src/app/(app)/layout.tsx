import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header variant="app" />
      <main className="flex-1 pb-24 md:pb-24">
        {children}
      </main>
      <MobileNav />
    </>
  );
}
