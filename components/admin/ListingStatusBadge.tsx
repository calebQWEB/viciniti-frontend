import type { AdminListingItem } from "@/types/admin";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary-50 text-primary-700",
  sold: "bg-gray-100 text-gray-600",
  inactive: "bg-gray-100 text-gray-600",
};

// The seller's status, or "Removed" when an admin took it down; plus a note when the seller is suspended
export default function ListingStatusBadge({ item }: { item: Pick<AdminListingItem, "status" | "removed_at" | "seller_suspended"> }) {
  return (
    <>
      {item.removed_at ? (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10.5px] font-semibold text-red-700">Removed</span>
      ) : (
        <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold capitalize ${STATUS_STYLES[item.status] ?? STATUS_STYLES.inactive}`}>
          {item.status}
        </span>
      )}
      {item.seller_suspended && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-semibold text-amber-800">Seller suspended</span>
      )}
    </>
  );
}
