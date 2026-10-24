import api from "@/lib/api";
import type { AdminCategory, AdminListingDetail, ListingKind, PaginatedAdminListings } from "@/types/admin";

export const LISTINGS_PAGE_SIZE = 25;

// What sellers and buyers call each kind
export const KIND_LABELS: Record<ListingKind, { one: string; many: string }> = {
  item: { one: "listing", many: "Items" },
  service: { one: "service", many: "Services" },
};

// The seller's own statuses, plus "removed" (an admin action that sits on top of them)
export const STATUS_FILTERS: Record<ListingKind, { value: string; label: string }[]> = {
  item: [
    { value: "", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "sold", label: "Sold" },
    { value: "removed", label: "Removed" },
  ],
  service: [
    { value: "", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "removed", label: "Removed" },
  ],
};

// The public page for a listing or service (it 404s while removed)
export const publicHref = (kind: ListingKind, id: string) => `/${kind === "item" ? "item" : "service"}/${id}`;

export const fetchAdminListings = async (params: {
  kind: ListingKind;
  page: number;
  search?: string;
  status?: string;
  categoryId?: string;
  sellerId?: string;
}): Promise<PaginatedAdminListings> =>
  (
    await api.get("/admin/listings", {
      params: {
        kind: params.kind,
        page: params.page,
        limit: LISTINGS_PAGE_SIZE,
        search: params.search || undefined,
        status: params.status || undefined,
        category_id: params.categoryId || undefined,
        seller_id: params.sellerId || undefined,
      },
    })
  ).data;

export const fetchAdminListing = async (kind: ListingKind, id: string): Promise<AdminListingDetail> =>
  (await api.get(`/admin/listings/${kind}/${id}`)).data;

export const removeListing = async (
  kind: ListingKind,
  id: string,
  body: { reason: string; notify: boolean },
): Promise<AdminListingDetail> =>
  (await api.post(`/admin/listings/${kind}/${id}/remove`, { reason: body.reason.trim(), notify: body.notify })).data;

export const restoreListing = async (kind: ListingKind, id: string, body: { notify: boolean }): Promise<AdminListingDetail> =>
  (await api.post(`/admin/listings/${kind}/${id}/restore`, body)).data;

// ---------- Categories ----------

export const fetchAdminCategories = async (): Promise<AdminCategory[]> => (await api.get("/admin/categories")).data;

export const createCategory = async (body: { name: string; type: ListingKind; icon: string | null }): Promise<AdminCategory> =>
  (await api.post("/admin/categories", body)).data;

export const updateCategory = async (
  id: string,
  changes: Partial<Pick<AdminCategory, "name" | "icon" | "is_active">>,
): Promise<AdminCategory> => (await api.patch(`/admin/categories/${id}`, changes)).data;

export const reorderCategories = async (type: ListingKind, ids: string[]): Promise<AdminCategory[]> =>
  (await api.post("/admin/categories/reorder", { type, ids })).data;

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/admin/categories/${id}`);
};

// Same rule as the API: Lucide icon names are kebab-case, e.g. "shopping-bag"
export const ICON_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
