import type { AdminUserItem } from "@/types/admin";

export default function UserBadges({ user }: { user: Pick<AdminUserItem, "is_admin" | "is_suspended" | "listings_count" | "services_count"> }) {
  return (
    <>
      {user.is_suspended && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10.5px] font-semibold text-red-700">Suspended</span>
      )}
      {user.is_admin && (
        <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10.5px] font-semibold text-white">Admin</span>
      )}
      {user.listings_count + user.services_count > 0 && (
        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10.5px] font-semibold text-primary-700">Seller</span>
      )}
    </>
  );
}
