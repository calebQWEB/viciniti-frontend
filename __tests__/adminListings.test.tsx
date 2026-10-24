import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminListingsPage from "@/app/admin/listings/page";
import AdminListingPage from "@/app/admin/listings/[kind]/[id]/page";
import AdminCategoriesPage from "@/app/admin/categories/page";
import MyListingsPage from "@/app/dashboard/listings/page";
import { slugify } from "@/components/admin/CategoryDialog";
import api from "@/lib/api";

let currentParams = new URLSearchParams();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/admin/listings",
  useSearchParams: () => currentParams,
  useParams: () => ({ kind: "item", id: "listing-1" }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <span data-testid="image">{alt}</span>,
}));

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockPatch = api.patch as jest.Mock;
const mockDelete = api.delete as jest.Mock;

const seller = { id: "user-1", name: "Ada Okafor", email: "ada@example.com" };

const listing = (overrides: Record<string, unknown> = {}) => ({
  id: "listing-1",
  kind: "item",
  title: "Standing fan",
  price: 15000,
  status: "active",
  thumbnail: "https://res.cloudinary.com/x/fan.jpg",
  location: "Ikeja",
  category: { id: "cat-1", name: "Electronics", slug: "electronics" },
  seller,
  seller_suspended: false,
  created_at: "2026-10-20T10:00:00",
  removed_at: null,
  removal_reason: null,
  ...overrides,
});

const detail = (overrides: Record<string, unknown> = {}) => ({
  ...listing(),
  description: "Works well",
  images: ["https://res.cloudinary.com/x/fan.jpg", "https://res.cloudinary.com/x/fan2.jpg"],
  removed_by: null,
  orders_count: 2,
  ...overrides,
});

const category = (overrides: Record<string, unknown> = {}) => ({
  id: "cat-1", name: "Electronics", slug: "electronics", type: "item", icon: "monitor",
  sort_order: 0, is_active: true, usage_count: 3, ...overrides,
});

const CATEGORIES = [
  category(),
  category({ id: "cat-2", name: "Pets", slug: "pets", icon: null, sort_order: 1, usage_count: 0 }),
  category({ id: "cat-3", name: "Cleaning", slug: "cleaning", type: "service", icon: "spray-can", usage_count: 1 }),
];

const renderWithClient = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  currentParams = new URLSearchParams();
  (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace, push: jest.fn() });
  mockGet.mockImplementation((url: string) => {
    if (url === "/admin/listings") {
      return Promise.resolve({
        data: { items: [listing(), listing({ id: "listing-2", title: "Fake watch", removed_at: "2026-10-22T10:00:00", removal_reason: "Counterfeit" })], total: 2, page: 1, limit: 25, total_pages: 1 },
      });
    }
    if (url === "/admin/categories") return Promise.resolve({ data: CATEGORIES });
    if (url.startsWith("/admin/listings/")) return Promise.resolve({ data: detail() });
    return Promise.reject(new Error(`unexpected GET ${url}`));
  });
});

// ---------- Listings ----------

describe("AdminListingsPage", () => {
  it("lists items with their status and removal reason", async () => {
    renderWithClient(<AdminListingsPage />);
    const fan = (await screen.findByText("Standing fan")).closest("a")!;
    expect(fan).toHaveAttribute("href", "/admin/listings/item/listing-1");
    expect(within(fan).getByText("active")).toBeInTheDocument();
    const watch = screen.getByText("Fake watch").closest("a")!;
    expect(within(watch).getByText("Removed")).toBeInTheDocument();
    expect(within(watch).getByText("Removed: Counterfeit")).toBeInTheDocument();
  });

  it("sends the filters to the API and resets them when switching kind", async () => {
    currentParams = new URLSearchParams("status=removed&category=cat-1&seller=user-1&search=fan");
    renderWithClient(<AdminListingsPage />);
    await screen.findByText("Standing fan");
    expect(mockGet).toHaveBeenCalledWith("/admin/listings", {
      params: { kind: "item", page: 1, limit: 25, search: "fan", status: "removed", category_id: "cat-1", seller_id: "user-1" },
    });
    expect(screen.getByText("One seller only")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Services" }));
    expect(mockReplace).toHaveBeenCalledWith("/admin/listings?seller=user-1&search=fan&kind=service", { scroll: false });
  });
});

describe("AdminListingPage", () => {
  it("shows the photos, description and seller", async () => {
    renderWithClient(<AdminListingPage />);
    expect(await screen.findByText("Works well")).toBeInTheDocument();
    expect(screen.getAllByTestId("image")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Ada Okafor" })).toHaveAttribute("href", "/admin/users/user-1");
    expect(screen.getByRole("link", { name: /View public page/ })).toHaveAttribute("href", "/item/listing-1");
    expect(screen.getByText("2 orders so far")).toBeInTheDocument();
  });

  it("needs a reason, then removes it", async () => {
    mockPost.mockResolvedValue({
      data: detail({ removed_at: "2026-10-23T12:00:00", removal_reason: "Counterfeit", removed_by: { id: "a", name: "Admin", email: "a@x.com" } }),
    });
    renderWithClient(<AdminListingPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove" }));
    expect(within(dialog).getByText("Give a reason the seller will see.")).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText(/^reason/i), { target: { value: "Counterfeit" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove" }));
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/admin/listings/item/listing-1/remove", { reason: "Counterfeit", notify: true }),
    );
    const banner = await screen.findByRole("region", { name: "Removal" });
    expect(within(banner).getByText(/Counterfeit/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View public page/ })).not.toBeInTheDocument();
  });

  it("restores without emailing when the box is unticked", async () => {
    mockGet.mockResolvedValue({ data: detail({ removed_at: "2026-10-23T12:00:00", removal_reason: "Counterfeit" }) });
    mockPost.mockResolvedValue({ data: detail() });
    renderWithClient(<AdminListingPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Restore" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByLabelText(/email ada okafor/i));
    fireEvent.click(within(dialog).getByRole("button", { name: "Restore" }));
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/admin/listings/item/listing-1/restore", { notify: false }),
    );
  });
});

// ---------- Categories ----------

describe("AdminCategoriesPage", () => {
  it("lists each type in order, with usage and a delete button only when unused", async () => {
    renderWithClient(<AdminCategoriesPage />);
    await screen.findByText("Electronics");
    const items = screen.getByRole("region", { name: "Item categories" });
    expect(within(items).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      expect.stringContaining("Electronics"), expect.stringContaining("Pets"),
    ]);
    expect(within(items).getByRole("link", { name: "3 listings" })).toHaveAttribute("href", "/admin/listings?category=cat-1");
    expect(within(items).queryByRole("button", { name: "Delete Electronics" })).not.toBeInTheDocument();
    expect(within(items).getByRole("button", { name: "Delete Pets" })).toBeInTheDocument();
    const services = screen.getByRole("region", { name: "Service categories" });
    expect(within(services).getByRole("link", { name: "1 service" })).toHaveAttribute("href", "/admin/listings?kind=service&category=cat-3");
  });

  it("adds a category, previewing its web name", async () => {
    mockPost.mockResolvedValue({ data: category({ id: "cat-9", name: "Pet Supplies", slug: "pet-supplies" }) });
    renderWithClient(<AdminCategoriesPage />);
    await screen.findByText("Electronics");
    const items = screen.getByRole("region", { name: "Item categories" });
    fireEvent.click(within(items).getByRole("button", { name: "Add" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Name"), { target: { value: "Pet & Supplies!" } });
    expect(within(dialog).getByText("pet-supplies")).toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole("textbox", { name: /icon/i }), { target: { value: "Paw Print" } });
    expect(within(dialog).getByText(/lowercase words joined by dashes/)).toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole("textbox", { name: /icon/i }), { target: { value: "paw-print" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add category" }));

    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/admin/categories", { name: "Pet & Supplies!", icon: "paw-print", type: "item" }),
    );
  });

  it("retires, reorders and deletes", async () => {
    mockPatch.mockResolvedValue({ data: category({ is_active: false }) });
    mockPost.mockResolvedValue({ data: CATEGORIES });
    mockDelete.mockResolvedValue({});
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(true);
    renderWithClient(<AdminCategoriesPage />);
    await screen.findByText("Electronics");
    const items = screen.getByRole("region", { name: "Item categories" });

    fireEvent.click(within(items).getAllByRole("button", { name: "Retire" })[0]);
    await waitFor(() => expect(mockPatch).toHaveBeenCalledWith("/admin/categories/cat-1", { is_active: false }));

    fireEvent.click(within(items).getByRole("button", { name: "Move Electronics down" }));
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/admin/categories/reorder", { type: "item", ids: ["cat-2", "cat-1"] }),
    );
    expect(within(items).getByRole("button", { name: "Move Electronics up" })).toBeDisabled();

    fireEvent.click(within(items).getByRole("button", { name: "Delete Pets" }));
    await waitFor(() => expect(mockDelete).toHaveBeenCalledWith("/admin/categories/cat-2"));
    confirm.mockRestore();
  });

  it("slugifies like the API", () => {
    expect(slugify(" Phones & Tablets ")).toBe("phones-tablets");
    expect(slugify("Babies, Kids' Toys")).toBe("babies-kids-toys");
  });
});

// ---------- Seller dashboard ----------

describe("MyListingsPage", () => {
  it("marks removed listings and hides their edit button", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url === "/listings/me") {
        return Promise.resolve({
          data: {
            items: [
              { id: "l1", title: "Fan", price: 100, status: "active", images: [], created_at: "2026-10-01", removed_at: null },
              { id: "l2", title: "Watch", price: 100, status: "active", images: [], created_at: "2026-10-01", removed_at: "2026-10-22", removal_reason: "Counterfeit" },
            ],
            total: 2, page: 1, limit: 20, total_pages: 1,
          },
        });
      }
      return Promise.resolve({ data: { all: 2, active: 2, sold: 0 } });
    });
    renderWithClient(<MyListingsPage />);
    expect((await screen.findAllByText("Removed by Junction: Counterfeit")).length).toBeGreaterThan(0);
    const editLinks = screen.getAllByRole("link").filter((a) => a.getAttribute("href")?.endsWith("/edit"));
    expect(editLinks.map((a) => a.getAttribute("href"))).toEqual(["/dashboard/listings/l1/edit", "/dashboard/listings/l1/edit"]);
  });
});
