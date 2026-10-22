import Link from "next/link";
import CategoryIcon, { CategoryItem, browseHref } from "./CategoryIcon";

// One scrolling row of category chips, items first then services
export default function CategoryChips({ categories }: { categories: CategoryItem[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="pb-10 md:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xl md:text-2xl font-extrabold tracking-tight text-gray-900">
          Browse by category
        </h2>
        <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 scrollbar-hide">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={browseHref(category)}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-earth-200 bg-white py-1.5 pl-1.5 pr-4 text-[13px] font-semibold text-gray-800 hover:border-primary-300 transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
              </span>
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
