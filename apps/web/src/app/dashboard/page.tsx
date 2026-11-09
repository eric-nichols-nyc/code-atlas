import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { AuthSetup } from "@/components/auth-setup";
import { isAuthConfigured } from "@/lib/auth";

export default async function DashboardPage() {
  if (!isAuthConfigured()) return <AuthSetup />;
  await auth.protect();
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex justify-end">
        <UserButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>You are signed in.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Build your first authenticated feature here.</p>
        </CardContent>
      </Card>
    </main>
  );
}
