import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminLayout from "@/app/admin/layout";
import AdminLogsPage from "@/app/admin/logs/page";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import {
  DEFAULT_LOG_FILTERS,
  filtersFromParams,
  filtersToQuery,
  parseApiDate,
} from "@/lib/adminLogs";

let currentParams = new URLSearchParams();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/admin/logs",
  useSearchParams: () => currentParams,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("@/hooks/useAuth", () => ({ useAuth: jest.fn() }));

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

const entry = (overrides: Record<string, unknown> = {}) => ({
  id: "log-1",
  created_at: "2026-10-23T11:21:45",
  level: "critical",
  category: "payout",
  event: "payout.failed",
  message: "Flutterwave rejected a seller payout",
  user: { id: "u1", name: "Ada Okafor", email: "ada@example.com" },
  request_method: null,
  request_path: null,
  status_code: null,
  error_ref: null,
  alert_sent: false,
  resolved_at: null,
  ...overrides,
});

const SUMMARY = {
  open: { info: 0, warning: 52, error: 24, critical: 114 },
  last_24h: { info: 6, warning: 4, error: 3, critical: 18 },
  last_7d: { info: 6, warning: 52, error: 24, critical: 114 },
  top_problems: [{ event: "payout.failed", level: "critical", count: 114, last_seen: "2026-10-23T11:21:45" }],
};

const page = (items: ReturnType<typeof entry>[]) => ({
  items, total: items.length, page: 1, limit: 25, total_pages: 1,
});

const mockApi = (items = [entry(), entry({ id: "log-2", user: { id: "u2", name: "Bisi Adeyemi", email: "b@example.com" } })]) => {
  mockGet.mockImplementation((url: string, config?: { params?: Record<string, unknown> }) => {
    if (url === "/admin/logs/summary") return Promise.resolve({ data: SUMMARY });
    if (url === "/admin/logs" && config?.params?.limit === 1) return Promise.resolve({ data: { ...page([]), total: 114 } });
    if (url === "/admin/logs") return Promise.resolve({ data: page(items) });
    if (url.startsWith("/admin/logs/")) {
      return Promise.resolve({
        data: { ...entry(), details: { flutterwave_message: "Please enable IP Whitelisting" }, traceback: null, resolver: null, resolution_note: null },
      });
    }
    return Promise.reject(new Error(`unexpected GET ${url}`));
  });
};

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AdminLogsPage />
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  currentParams = new URLSearchParams();
  (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace, push: jest.fn() });
});

// ---------- URL filters ----------

describe("log filters in the URL", () => {
  it("round-trips and leaves defaults out", () => {
    const filters = { ...DEFAULT_LOG_FILTERS, levels: ["critical" as const, "error" as const], event: "payout.failed", page: 2 };
    const query = filtersToQuery(filters, "log-9");
    expect(query).toBe("level=critical%2Cerror&event=payout.failed&page=2&entry=log-9");
    expect(filtersFromParams(new URLSearchParams(query))).toEqual(filters);
    expect(filtersToQuery(DEFAULT_LOG_FILTERS)).toBe("");
  });

  it("ignores junk values", () => {
    const filters = filtersFromParams(new URLSearchParams("status=weird&level=loud,info&page=-3"));
    expect(filters.status).toBe("open");
    expect(filters.levels).toEqual(["info"]);
    expect(filters.page).toBe(1);
  });

  it("reads API times as UTC", () => {
    expect(parseApiDate("2026-10-23T11:21:45").toISOString()).toBe("2026-10-23T11:21:45.000Z");
    expect(parseApiDate("2026-10-23T11:21:45+01:00").toISOString()).toBe("2026-10-23T10:21:45.000Z");
  });
});

// ---------- Access ----------

const renderLayout = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AdminLayout><p>secret</p></AdminLayout>
    </QueryClientProvider>,
  );

describe("AdminLayout", () => {
  it("sends non-admins to their dashboard", async () => {
    mockUseAuth.mockReturnValue({ user: { name: "Tunde", is_admin: false }, isAuthenticated: true, isLoading: false });
    renderLayout();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/dashboard"));
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("sends logged-out visitors to login", async () => {
    mockUseAuth.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false });
    renderLayout();
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login"));
  });

  it("shows the page to admins", () => {
    mockUseAuth.mockReturnValue({ user: { name: "Admin", is_admin: true }, isAuthenticated: true, isLoading: false });
    renderLayout();
    expect(screen.getByText("secret")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

// ---------- Logs page ----------

describe("AdminLogsPage", () => {
  it("loads open entries and the summary", async () => {
    mockApi();
    renderPage();
    expect(await screen.findAllByText("Ada Okafor")).not.toHaveLength(0);
    expect(mockGet).toHaveBeenCalledWith("/admin/logs", expect.objectContaining({
      params: expect.objectContaining({ status: "open", page: 1, limit: 25 }),
    }));
    expect(screen.getByRole("button", { name: /critical · open/i })).toHaveTextContent("114");
  });

  it("filters by level from a summary tile", async () => {
    mockApi();
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: /critical · open/i }));
    expect(mockReplace).toHaveBeenCalledWith("/admin/logs?level=critical", { scroll: false });
  });

  it("sends the level filter as repeated params", async () => {
    currentParams = new URLSearchParams("level=critical,error&status=all");
    mockApi();
    renderPage();
    await screen.findAllByText("Ada Okafor");
    const [, config] = mockGet.mock.calls.find(([url, c]) => url === "/admin/logs" && c.params.limit === 25)!;
    expect(config.params).toMatchObject({ status: "all", level: ["critical", "error"] });
    expect(config.paramsSerializer).toEqual({ indexes: null });
  });

  it("resolves ticked rows with a note", async () => {
    mockApi();
    mockPost.mockResolvedValue({ data: { resolved: 2 } });
    renderPage();
    const table = (await screen.findByRole("table"));
    within(table).getAllByRole("checkbox", { name: /select payout.failed/i }).forEach((box) => fireEvent.click(box));

    fireEvent.click(screen.getByRole("button", { name: /resolve selected/i }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/resolution note/i), { target: { value: "IP whitelisted" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Resolve" }));

    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/admin/logs/resolve-bulk", { ids: ["log-1", "log-2"], note: "IP whitelisted" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("resolves every open entry for a repeated problem", async () => {
    mockApi();
    mockPost.mockResolvedValue({ data: { resolved: 114 } });
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Resolve all" }));
    const dialog = screen.getByRole("dialog");
    expect(await within(dialog).findByText(/All 114 open/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Resolve" }));
    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/admin/logs/resolve-bulk", { event: "payout.failed", note: null }),
    );
  });

  it("opens an entry and resolves it from the detail panel", async () => {
    currentParams = new URLSearchParams("entry=log-1");
    mockApi();
    mockPost.mockResolvedValue({ data: { ...entry({ resolved_at: "2026-10-23T12:00:00" }), details: null, traceback: null, resolver: { id: "a", name: "Admin", email: "a@x.com" }, resolution_note: "Done" } });
    renderPage();

    const panel = await screen.findByRole("complementary", { name: /log entry detail/i });
    expect(await within(panel).findByText("Please enable IP Whitelisting")).toBeInTheDocument();
    fireEvent.change(within(panel).getByLabelText(/resolution note/i), { target: { value: "Done" } });
    fireEvent.click(within(panel).getByRole("button", { name: /mark resolved/i }));

    await waitFor(() => expect(mockPost).toHaveBeenCalledWith("/admin/logs/log-1/resolve", { note: "Done" }));
    expect(await within(panel).findByRole("button", { name: "Reopen" })).toBeInTheDocument();
  });

  it("opens an entry by putting it in the URL", async () => {
    mockApi();
    renderPage();
    const table = await screen.findByRole("table");
    fireEvent.click(within(table).getAllByRole("button", { name: "payout.failed" })[0]);
    expect(mockReplace).toHaveBeenCalledWith("/admin/logs?entry=log-1", { scroll: false });
  });
});
