import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/login/page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
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

// Mock auth lib
jest.mock("@/lib/auth", () => ({
  login: jest.fn(),
}));

describe("LoginPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    render(<LoginPage />);
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sign up for free")).toBeInTheDocument();
  });

  it("updates email input on change", () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@viciniti.com" } });
    expect(emailInput).toHaveValue("test@viciniti.com");
  });

  it("updates password input on change", () => {
    render(<LoginPage />);
    const passwordInput = screen.getByPlaceholderText("••••••••");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput).toHaveValue("password123");
  });

  it("shows error message on failed login", async () => {
    const { login } = require("@/lib/auth");
    login.mockRejectedValueOnce({
      response: { data: { detail: "Invalid email or password" } },
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "wrong@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });
});
