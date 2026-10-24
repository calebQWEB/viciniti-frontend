import api from "@/lib/api";
import type { AdminUserDetail, PaginatedAdminUsers, UserFilter } from "@/types/admin";

export const USERS_PAGE_SIZE = 25;

export const USER_FILTERS: { value: UserFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "suspended", label: "Suspended" },
  { value: "admins", label: "Admins" },
  { value: "new", label: "New this week" },
];

export const fetchAdminUsers = async (params: {
  page: number;
  search?: string;
  filter: UserFilter;
}): Promise<PaginatedAdminUsers> =>
  (
    await api.get("/admin/users", {
      params: {
        page: params.page,
        limit: USERS_PAGE_SIZE,
        search: params.search || undefined,
        filter: params.filter === "all" ? undefined : params.filter,
      },
    })
  ).data;

export const fetchAdminUser = async (id: string): Promise<AdminUserDetail> =>
  (await api.get(`/admin/users/${id}`)).data;

export const suspendUser = async (
  id: string,
  body: { reason: string; note: string; notify: boolean },
): Promise<AdminUserDetail> =>
  (
    await api.post(`/admin/users/${id}/suspend`, {
      reason: body.reason.trim(),
      note: body.note.trim() || null,
      notify: body.notify,
    })
  ).data;

export const unsuspendUser = async (
  id: string,
  body: { note: string; notify: boolean },
): Promise<AdminUserDetail> =>
  (await api.post(`/admin/users/${id}/unsuspend`, { note: body.note.trim() || null, notify: body.notify })).data;
