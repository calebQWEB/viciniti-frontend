import { render, screen } from "@testing-library/react";
import ServiceCard from "@/components/services/ServiceCard";
import { Service } from "@/types/service";

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

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

const mockService: Service = {
  id: "789",
  user_id: "456",
  title: "Home Cleaning",
  description: "Professional cleaning",
  price: 25000,
  category: "Cleaning",
  images: [
    { url: "https://res.cloudinary.com/test.jpg", public_id: "test/789" },
  ],
  status: "active",
  location: "Ikeja",
  created_at: "2024-01-01T00:00:00",
};

describe("ServiceCard", () => {
  it("renders service title", () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText("Home Cleaning")).toBeInTheDocument();
  });

  it("renders service price", () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText(/25,000/)).toBeInTheDocument();
  });

  it("renders service category", () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText("Cleaning")).toBeInTheDocument();
  });

  it("renders service location", () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByText("Ikeja")).toBeInTheDocument();
  });

  it("shows INACTIVE badge when service is inactive", () => {
    render(<ServiceCard service={{ ...mockService, status: "inactive" }} />);
    expect(screen.getByText("INACTIVE")).toBeInTheDocument();
  });

  it("links to correct service page", () => {
    render(<ServiceCard service={mockService} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/service/789");
  });
});
