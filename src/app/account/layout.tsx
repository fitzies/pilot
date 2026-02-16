import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back
          </Link>
        </div>
        <nav className="flex gap-4 border-b pb-2">
          <Link
            href="/account"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Account
          </Link>
          <Link
            href="/account/billing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Billing
          </Link>
          <Link
            href="/account/settings"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Settings
          </Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
