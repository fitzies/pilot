import {
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { DashboardContent } from "@/components/dashboard-content";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
  return (
    <>
      <ClerkLoading>
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="size-8" />
        </div>
      </ClerkLoading>
      <SignedOut>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to Pilot
            </h1>
            <p className="text-muted-foreground">
              Your Agent&apos;s Command Centre. Sign in to get started.
            </p>
          </div>
          <div className="flex gap-3">
            <SignInButton mode="modal">
              <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                Create account
              </button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
    </>
  );
}
