import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AdminOverviewPage from "@/app/admin/page";
import AdminOrdersPage from "@/app/admin/orders/page";
import AdminOrderPage from "@/app/admin/orders/[id]/page";
import api from "@/lib/api";
import { formatNairaCompact } from "@/lib/adminOrders";

let currentParams = new URLSearchParams();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/admin/orders",
  useSearchParams: () => currentParams,
  useParams: () => ({ id: "order-1" }),
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
  default: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;

const person = (name: string) => ({ id: name, name, email: `${name.toLowerCase()}@example.com` });

const order = (overrides: Record<string, unknown> = {}) => ({
  id: "order-1-aaaa-bbbb",
  created_at: "2026-10-20T10:00:00",
  status: "completed",
  amount: 20000,
  fee: 800,
  payout_amount: 19200,
  item_title: "Garden chairs",
  item_type: "listing",
  buyer: person("Bisi"),
  seller: person("Ada"),
  payout_due_at: "2026-10-23T09:00:00",
  payout_completed_at: null,
  payout_attempts: 2,
  payout_last_attempt_at: "2026-10-23T11:00:00",
  payout_last_error: "Please enable IP Whitelisting to access this service",
  payout_last_attempt_crashed: false,
  refunded_at: null,
  payment_reference: null,
  dispute_reason: null,
  dispute_filed_at: null,
  ...overrides,
});

const QUEUES = {
  failing_payouts: [order(), order({ id: "order-2-cccc", item_title: "Desk", payout_last_attempt_crashed: true, payout_last_error: "Crashed: ConnectionError" })],
  blocked_payouts: [],
  refunds: [order({ id: "order-3-dddd", status: "cancelled", item_title: "Bike", payment_reference: "JNC-LATE1" })],
  disputes: [],
  counts: { failing_payouts: 2, blocked_payouts: 0, refunds: 1, disputes: 0 },
};

const OVERVIEW = {
  users_total: 1284,
  users_new_7d: 12,
  listings_active: 40,
  services_active: 9,
  orders_by_status: { pending: 1, paid: 2, fulfilled: 1, completed: 7, cancelled: 11, disputed: 1, refunded: 1 },
  last_30d: { sales: 150000, fees: 4000, payouts_sent: 50000 },
  all_time: { sales: 8800000, fees: 60000, payouts_sent: 900000 },
  payouts_owed: 134400,
  attention: { failing_payouts: 7, blocked_payouts: 0, refunds: 1, disputes: 1, critical_logs: 124 },
  daily: Array.from({ length: 30 }, (_, i) => ({
    day: `2026-10-${String(i + 1).padStart(2, "0")}`, orders: i === 29 ? 2 : 0, value: i === 29 ? 40000 : 0,
  })),
};

const DETAIL = {
  ...order(),
  item_id: "listing-9",
  seller_bank: { bank_name: "Access Bank", account_name: "Ada Okafor", account_last4: "6789" },
  completion_photos: [],
  completion_notes: "Delivered to the gate",
  completed_at: "2026-10-19T10:00:00",
  buyer_accepted_at: "2026-10-19T12:00:00",
  refund_reference: null,
  refund_note: null,
  refunded_by: null,
  transactions: [{
    id: "t1", reference: "JNC-PAID1", type: "payment", status: "success", amount: 20000, fee: 800,
    created_at: "2026-10-18T10:00:00", chargeback_reason: null, chargeback_filed_at: null, chargeback_resolved_at: null,
  }],
  timeline: [
    { label: "Order placed", at: "2026-10-18T10:00:00", detail: null, tone: "done" },
    { label: "Payment received", at: "2026-10-18T10:05:00", detail: "JNC-PAID1", tone: "done" },
    { label: "Payout failed (2 attempts)", at: "2026-10-23T11:00:00", detail: "Please enable IP Whitelisting", tone: "problem" },
  ],
  logs: [{
    id: "log-7", created_at: "2026-10-23T11:00:00", level: "critical", category: "payout", event: "payout.failed",
    message: "Flutterwave rejected a seller payout", user: null, request_method: null, request_path: null,
    status_code: null, error_ref: null, alert_sent: false, resolved_at: null,
  }],
  can_retry_payout: true,
  can_mark_refunded: false,
};

const mockApi = () =>
  mockGet.mockImplementation((url: string) => {
    if (url === "/admin/overview") return Promise.resolve({ data: OVERVIEW });
    if (url === "/admin/orders/queues") return Promise.resolve({ data: QUEUES });
    if (url === "/admin/orders") return Promise.resolve({ data: { items: [order()], total: 1, page: 1, limit: 25, total_pages: 1 } });
    if (url.startsWith("/admin/orders/")) return Promise.resolve({ data: DETAIL });
    return Promise.reject(new Error(`unexpected GET ${url}`));
  });

const renderWithClient = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{ui}</QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  currentParams = new URLSearchParams();
  (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace, push: jest.fn() });
  mockApi();
});

// ---------- Overview ----------

describe("AdminOverviewPage", () => {
  it("lists only what needs attention, with links", async () => {
    renderWithClient(<AdminOverviewPage />);
    const attention = await screen.findByRole("region", { name: "Needs attention" });
    expect(within(attention).getByRole("link", { name: /7\s*Failing payouts/ })).toHaveAttribute("href", "/admin/orders?queue=failing_payouts");
    expect(within(attention).getByRole("link", { name: /124\s*Critical logs/ })).toHaveAttribute("href", "/admin/logs?level=critical");
    expect(within(attention).queryByText("Blocked payouts")).not.toBeInTheDocument();
  });

  it("shows the headline numbers and the chart's data table", async () => {
    renderWithClient(<AdminOverviewPage />);
    expect(await screen.findByText("1,284")).toBeInTheDocument();
    expect(screen.getByText("12 new this week")).toBeInTheDocument();
    expect(screen.getByText("₦134,400")).toBeInTheDocument();
    expect(screen.getByText(formatNairaCompact(8800000))).toBeInTheDocument();
    const table = screen.getByRole("table", { name: /order value per day/i });
    expect(within(table).getAllByRole("row")).toHaveLength(31);
  });
});

// ---------- Orders & money ----------

describe("AdminOrdersPage", () => {
  it("shows the failing payouts queue by default, with the error", async () => {
    renderWithClient(<AdminOrdersPage />);
    expect(await screen.findByText("Garden chairs")).toBeInTheDocument();
    expect(screen.getByText(/2 attempts: Please enable IP Whitelisting/)).toBeInTheDocument();
    expect(screen.getByText(/Last attempt crashed: check Flutterwave/)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Failing payouts/ })).toHaveAttribute("aria-selected", "true");
  });

  it("retries one payout and shows the outcome", async () => {
    mockPost.mockResolvedValue({ data: { order_id: "order-1-aaaa-bbbb", ok: false, outcome: "rejected", message: "Please enable IP Whitelisting" } });
    renderWithClient(<AdminOrdersPage />);
    const row = (await screen.findByText("Garden chairs")).closest("li")!;
    fireEvent.click(within(row).getByRole("button", { name: "Retry payout" }));
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith("/admin/orders/order-1-aaaa-bbbb/retry-payout"));
    expect(await within(row).findByText("Not sent: Please enable IP Whitelisting")).toBeInTheDocument();
  });

  it("asks before retrying a payout whose last attempt crashed", async () => {
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
    renderWithClient(<AdminOrdersPage />);
    const row = (await screen.findByText("Desk")).closest("li")!;
    fireEvent.click(within(row).getByRole("button", { name: "Retry payout" }));
    expect(confirm).toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it("retries all failing payouts and lists the results", async () => {
    mockPost.mockResolvedValue({
      data: {
        attempted: 2, sent: 1,
        results: [
          { order_id: "order-1-aaaa-bbbb", ok: true, outcome: "sent", message: "₦19,200 sent (PAYOUT-1)" },
          { order_id: "order-2-cccc", ok: false, outcome: "rejected", message: "Insufficient balance" },
        ],
      },
    });
    renderWithClient(<AdminOrdersPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Retry all 2" }));
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith("/admin/orders/retry-payouts"));
    const results = await screen.findByRole("region", { name: "Retry results" });
    expect(within(results).getByText("1 of 2 payouts sent")).toBeInTheDocument();
    expect(within(results).getByText(/#ORDER-2-: not sent, Insufficient balance/)).toBeInTheDocument();
  });

  it("switches queue through the URL", async () => {
    renderWithClient(<AdminOrdersPage />);
    fireEvent.click(await screen.findByRole("tab", { name: /Refunds owed/ }));
    expect(mockReplace).toHaveBeenCalledWith("/admin/orders?queue=refunds", { scroll: false });
  });

  it("records a manual refund", async () => {
    currentParams = new URLSearchParams("queue=refunds");
    mockPost.mockResolvedValue({ data: { ...DETAIL, status: "refunded" } });
    renderWithClient(<AdminOrdersPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Mark refunded" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/transfer reference/i), { target: { value: " BANK-123 " } });
    fireEvent.change(within(dialog).getByLabelText(/^note/i), { target: { value: "From the business account" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Mark refunded" }));

    await waitFor(() =>
      expect(mockPost).toHaveBeenCalledWith("/admin/orders/order-3-dddd/mark-refunded", {
        reference: "BANK-123", note: "From the business account",
      }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("searches all orders", async () => {
    currentParams = new URLSearchParams("queue=all&search=bisi&status=completed");
    renderWithClient(<AdminOrdersPage />);
    expect(await screen.findByText("Garden chairs")).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith("/admin/orders", {
      params: { page: 1, limit: 25, search: "bisi", status: "completed" },
    });
  });
});

// ---------- Order detail ----------

describe("AdminOrderPage", () => {
  it("shows the timeline, bank, transactions and logs", async () => {
    renderWithClient(<AdminOrderPage />);
    expect(await screen.findByText("Payout failed (2 attempts)")).toBeInTheDocument();
    expect(screen.getByText(/Ada Okafor · \*\*\*\*6789/)).toBeInTheDocument();
    expect(screen.getAllByText("JNC-PAID1").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /payout.failed/ })).toHaveAttribute("href", "/admin/logs?status=all&entry=log-7");
    expect(screen.getByRole("link", { name: /Garden chairs/ })).toHaveAttribute("href", "/item/listing-9");
    expect(screen.queryByRole("button", { name: "Mark refunded" })).not.toBeInTheDocument();
  });

  it("retries the payout from the order page", async () => {
    mockPost.mockResolvedValue({ data: { order_id: "order-1-aaaa-bbbb", ok: true, outcome: "sent", message: "₦19,200 sent (PAYOUT-1)" } });
    renderWithClient(<AdminOrderPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Retry payout" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Payout sent: ₦19,200 sent (PAYOUT-1)");
  });
});
