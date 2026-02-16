import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="flex justify-center py-8">
      <UserProfile routing="path" path="/account" />
    </div>
  );
}
