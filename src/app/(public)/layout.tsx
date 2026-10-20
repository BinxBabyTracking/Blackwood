import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
