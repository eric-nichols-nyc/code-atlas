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

export function AuthSetup() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl items-center px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Authentication setup</CardTitle>
          <CardDescription>
            Sign-in will be available once Clerk is connected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Add your Clerk keys using the project README, then restart the app.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
