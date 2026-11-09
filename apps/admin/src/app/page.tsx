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

export default function AdminHome() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div>
        <Badge variant="secondary">Workspace / Admin</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Admin workspace</CardTitle>
          <CardDescription>
            A separate home for your internal tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Dashboard access is limited to explicitly approved administrators.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/dashboard" prefetch={false}>
              Open admin dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
