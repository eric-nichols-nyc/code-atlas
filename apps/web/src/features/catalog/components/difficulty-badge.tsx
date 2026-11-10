import { Badge } from "@workspace/ui/components/badge";

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const variant =
    difficulty === "Easy"
      ? "easy"
      : difficulty === "Medium"
        ? "medium"
        : difficulty === "Hard"
          ? "hard"
          : "secondary";
  return <Badge variant={variant}>{difficulty}</Badge>;
}
