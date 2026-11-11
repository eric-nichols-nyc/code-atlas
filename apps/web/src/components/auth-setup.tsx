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
    <main className="mx-auto flex max-w-xl flex-1 items-center px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Authentication setup</CardTitle>
          <CardDescription>
            Sign-in will be available once Neon Auth is connected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Configure Neon Auth using the project README, then restart the app.
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
