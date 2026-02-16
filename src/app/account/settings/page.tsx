import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
    ?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Display name</p>
          <p className="text-base">
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.fullName ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-base">{email ?? "—"}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          <Link href="/account" className="underline hover:text-foreground">
            Edit profile
          </Link>{" "}
          to change these details.
        </p>
      </div>
    </div>
  );
}
