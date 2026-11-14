import { algorithmsPracticeCatalog } from "@/content/algorithms/practice/catalog";
import { javascriptPracticeCatalog } from "@/content/javascript/practice/catalog";

export const publishedPractice = [
  ...javascriptPracticeCatalog,
  ...algorithmsPracticeCatalog,
].filter((entry) => entry.status === "published");
