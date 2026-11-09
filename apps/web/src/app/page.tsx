import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Link from "next/link";
import { ComponentPreview } from "@/components/component-preview";
import { isAuthConfigured } from "@/lib/auth";

export default async function HomePage() {
  const configured = isAuthConfigured();
  const userId = configured ? (await auth()).userId : null;
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <Badge variant="secondary">Code Atlas / Web</Badge>
        {userId && <UserButton />}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Your workspace is ready</CardTitle>
          <CardDescription>
            A small starting point for your next feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Shared components, a separate API, and an admin app are ready to
            grow with you.
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <ComponentPreview />
          <Button variant="outline" asChild>
            <Link href="/dashboard" prefetch={false}>
              Open dashboard
            </Link>
          </Button>
          {configured && !userId && (
            <Button variant="ghost" asChild>
              <Link href="/sign-in" prefetch={false}>
                Sign in
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
