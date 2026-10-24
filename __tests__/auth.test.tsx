import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/login/page";
import { login } from "@/lib/auth";
import api from "@/lib/api";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: () => mockSearchParams,
}));

let mockSearchParams = new URLSearchParams();

// Mock Next.js Link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// The map panel fetches listings; it isn't what these tests are about
jest.mock("@/components/auth/NeighbourhoodPanel", () => ({
  __esModule: true,
  default: () => null,
}));

// Mock auth store
jest.mock("@/store/authStore", () => ({
  useAuthStore: () => ({
    setUser: jest.fn(),
    setIsAuthenticated: jest.fn(),
  }),
}));

// Mock api
jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Only the network call is mocked; redirect and error helpers run for real
jest.mock("@/lib/auth", () => ({
  ...jest.requireActual("@/lib/auth"),
  login: jest.fn(),
}));

const mockLogin = login as jest.Mock;
const mockGet = api.get as jest.Mock;

const fillAndSubmit = (email: string, password: string) => {
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
};

describe("LoginPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders the login form", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders the forgot password link", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("switches to sign-up from the tab, with Sign in marked as current", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("aria-current", "page");
  });

  it("updates the email and password fields", () => {
    render(<LoginPage />);
    const email = screen.getByLabelText("Email address");
    const password = screen.getByLabelText("Password");
    fireEvent.change(email, { target: { value: "test@example.com" } });
    fireEvent.change(password, { target: { value: "password123" } });
    expect(email).toHaveValue("test@example.com");
    expect(password).toHaveValue("password123");
  });

  it("shows and hides the password", () => {
    render(<LoginPage />);
    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
  });

  it("explains a suspension when sent here from a suspended session", () => {
    mockSearchParams = new URLSearchParams("notice=suspended");
    render(<LoginPage />);
    expect(screen.getByText(/This account has been suspended/)).toBeInTheDocument();
    mockSearchParams = new URLSearchParams();
  });

  it("shows the suspension reason when a suspended user signs in", async () => {
    mockLogin.mockRejectedValueOnce({
      response: { status: 403, data: { detail: "This account has been suspended. Reason: Fake listings." } },
    });
    render(<LoginPage />);
    fillAndSubmit("ada@example.com", "right-password");
    expect(await screen.findByText(/Reason: Fake listings/)).toBeInTheDocument();
  });

  it("shows the API's error message on failed login", async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { detail: "Invalid email or password" } },
    });

    render(<LoginPage />);
    fillAndSubmit("wrong@example.com", "wrongpass");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("sends users who haven't finished onboarding to /welcome", async () => {
    mockLogin.mockResolvedValueOnce({ access_token: "t", token_type: "bearer" });
    mockGet.mockResolvedValueOnce({ data: { id: "1", name: "Ada", onboarded_at: null } });

    render(<LoginPage />);
    fillAndSubmit("ada@example.com", "password123");

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/welcome"));
  });

  it("sends onboarded users to the dashboard", async () => {
    mockLogin.mockResolvedValueOnce({ access_token: "t", token_type: "bearer" });
    mockGet.mockResolvedValueOnce({
      data: { id: "1", name: "Ada", onboarded_at: "2026-10-01T00:00:00" },
    });

    render(<LoginPage />);
    fillAndSubmit("ada@example.com", "password123");

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });
});
