import * as LucideIcons from "lucide-react";
import { Package, type LucideIcon } from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: "item" | "service";
  // Lucide icon name in kebab-case, e.g. "shopping-bag"
  icon: string | null;
}

export const browseHref = (category: CategoryItem) =>
  `/browse/${category.type === "item" ? "items" : "services"}?category=${category.slug}`;

// Renders the Lucide icon named in the category's `icon` field, falling back to a box
export default function CategoryIcon({ name, className }: { name: string | null; className?: string }) {
  const pascalCase = (name || "package")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[pascalCase] || Package;
  return <Icon className={className} />;
}
