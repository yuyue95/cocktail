import BottomNav from "@/components/layout/BottomNav";

// Shell for the main tabbed experience: a centered column with room at the
// bottom for the fixed navigation bar.
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
