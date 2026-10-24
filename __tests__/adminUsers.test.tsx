import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminUsersPage from "@/app/admin/users/page";
import AdminUserPage from "@/app/admin/users/[id]/page";
import api from "@/lib/api";

let currentParams = new URLSearchParams();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/admin/users",
  useSearchParams: () => currentParams,
  useParams: () => ({ id: "user-1" }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;

const userItem = (overrides: Record<string, unknown> = {}) => ({
  id: "user-1",
  name: "Ada Okafor",
  email: "ada@example.com",
  avatar: null,
  location: "Ikeja",
  intent: "sell",
  created_at: "2026-10-01T10:00:00",
  is_admin: false,
  is_suspended: false,
  suspended_at: null,
  listings_count: 3,
  services_count: 0,
  orders_count: 5,
  ...overrides,
});

const detail = (overrides: Record<string, unknown> = {}) => ({
  ...userItem(),
  onboarded_at: "2026-10-01T10:05:00",
  suspension_reason: null,
  suspension_note: null,
  suspended_by: null,
  bank: { bank_name: "Access Bank", account_name: "Ada Okafor", account_last4: "6789" },
  listings_by_status: { active: 2, sold: 1 },
  services_by_status: { active: 0, inactive: 0 },
  as_buyer: { count: 1, value: 5000 },
  as_seller: { count: 4, value: 80000 },
  disputes: 1,
  rating_average: 4.5,
  rating_count: 2,
  recent_orders: [],
  logs: [],
  ...overrides,
});

const renderWithClient = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  currentParams = new URLSearchParams();
  (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace, push: jest.fn() });
});

// ---------- List ----------

describe("AdminUsersPage", () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({
      data: {
        items: [userItem(), userItem({ id: "user-2", name: "Bisi", email: "bisi@example.com", is_suspended: true, listings_count: 0 })],
        total: 2, page: 1, limit: 25, total_pages: 1,
      },
    });
  });

  it("lists users with their badges, linking to each", async () => {
    renderWithClient(<AdminUsersPage />);
    const ada = (await screen.findByText("Ada Okafor")).closest("a")!;
    expect(ada).toHaveAttribute("href", "/admin/users/user-1");
    expect(within(ada).getByText("Seller")).toBeInTheDocument();
    const bisi = screen.getByText("Bisi").closest("a")!;
    expect(within(bisi).getByText("Suspended")).toBeInTheDocument();
  });

  it("filters through the URL and sends the filter to the API", async () => {
    currentParams = new URLSearchParams("filter=suspended&search=bisi");
    renderWithClient(<AdminUsersPage />);
    await screen.findByText("Bisi");
    expect(mockGet).toHaveBeenCalledWith("/admin/users", {
      params: { page: 1, limit: 25, search: "bisi", filter: "suspended" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Admins" }));
    expect(mockReplace).toHaveBeenCalledWith("/admin/users?filter=admins&search=bisi", { scroll: false });
  });
});

// ---------- Detail ----------

describe("AdminUserPage", () => {
  it("shows the user's activity and payout account", async () => {
    mockGet.mockResolvedValue({ data: detail() });
    renderWithClient(<AdminUserPage />);
    expect(await screen.findByText("₦80,000")).toBeInTheDocument();
    expect(screen.getByText("4.5 / 5")).toBeInTheDocument();
    expect(screen.getByText("2 active · 1 sold")).toBeInTheDocument();
    expect(screen.getByText(/Ada Okafor · \*\*\*\*6789/)).toBeInTheDocument();
  });

  it("needs a reason before suspending, then suspends", async () => {
    mockGet.mockResolvedValue({ data: detail() });
    mockPost.mockResolvedValue({
      data: detail({
        is_suspended: true, suspended_at: "2026-10-23T12:00:00", suspension_reason: "Fake listings",
        suspended_by: { id: "a", name: "Admin", email: "a@x.com" },
      }),
    });
    renderWithClient(<AdminUserPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Suspend" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Suspend" }));
    expect(within(dialog).getByText("Give a reason the user will see.")).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText(/^reason/i), { target: { value: "Fake listings" } });
    fireEvent.click(within(dialog).getByLabelText(/email ada okafor/i));
    fireEvent.click(within(dialog).getByRole("button", { name: "Suspend" }));

    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/admin/users/user-1/suspend", { reason: "Fake listings", note: null, notify: false }),
    );
    const banner = await screen.findByRole("region", { name: "Suspension" });
    expect(within(banner).getByText(/Fake listings/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lift suspension" })).toBeInTheDocument();
  });

  it("lifts a suspension", async () => {
    mockGet.mockResolvedValue({ data: detail({ is_suspended: true, suspension_reason: "Fake listings" }) });
    mockPost.mockResolvedValue({ data: detail() });
    renderWithClient(<AdminUserPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Lift suspension" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/internal note/i), { target: { value: "Appeal accepted" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Lift suspension" }));
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/admin/users/user-1/unsuspend", { note: "Appeal accepted", notify: true }),
    );
    expect(await screen.findByRole("button", { name: "Suspend" })).toBeInTheDocument();
  });

  it("offers no suspend button for admins", async () => {
    mockGet.mockResolvedValue({ data: detail({ is_admin: true }) });
    renderWithClient(<AdminUserPage />);
    await screen.findByText("₦80,000");
    expect(screen.queryByRole("button", { name: "Suspend" })).not.toBeInTheDocument();
  });
});
