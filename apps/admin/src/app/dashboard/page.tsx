import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { notFound } from "next/navigation";
import { isAdmin, isAuthConfigured } from "@/lib/auth";

export default async function AdminDashboard() {
  if (!isAuthConfigured())
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Admin setup</CardTitle>
            <CardDescription>
              Connect Clerk to enable the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Add Clerk keys and approved user IDs using the project README,
              then restart this app.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  const { userId } = await auth.protect();
  if (!isAdmin(userId)) notFound();
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex justify-end">
        <UserButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Admin dashboard</CardTitle>
          <CardDescription>Administrator access verified.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Add your internal tools here.</p>
        </CardContent>
      </Card>
    </main>
  );
}
