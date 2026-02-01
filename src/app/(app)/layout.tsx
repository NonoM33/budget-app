import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20">
      <main className="mx-auto max-w-lg">{children}</main>
      <BottomNav />
    </div>
  );
}
