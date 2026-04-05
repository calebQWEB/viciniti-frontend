import { render, screen } from "@testing-library/react";
import ListingCard from "@/components/listings/ListingCard";
import { Listing } from "@/types/listing";

// Mock Next.js components
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

const mockListing: Listing = {
  id: "123",
  user_id: "456",
  title: "iPhone 13 Pro",
  description: "Brand new phone",
  price: 500000,
  category: "Electronics",
  images: [
    { url: "https://res.cloudinary.com/test.jpg", public_id: "test/123" },
  ],
  status: "active",
  location: "Lagos",
  created_at: "2024-01-01T00:00:00",
};

describe("ListingCard", () => {
  it("renders listing title", () => {
    render(<ListingCard listing={mockListing} />);
    expect(screen.getByText("iPhone 13 Pro")).toBeInTheDocument();
  });

  it("renders listing price", () => {
    render(<ListingCard listing={mockListing} />);
    expect(screen.getByText(/500,000/)).toBeInTheDocument();
  });

  it("renders listing category", () => {
    render(<ListingCard listing={mockListing} />);
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  it("renders listing location", () => {
    render(<ListingCard listing={mockListing} />);
    expect(screen.getByText("Lagos")).toBeInTheDocument();
  });

  it("renders listing image", () => {
    render(<ListingCard listing={mockListing} />);
    expect(screen.getByAltText("iPhone 13 Pro")).toBeInTheDocument();
  });

  it("shows SOLD badge when listing is sold", () => {
    render(<ListingCard listing={{ ...mockListing, status: "sold" }} />);
    expect(screen.getByText("SOLD")).toBeInTheDocument();
  });

  it("renders placeholder when no images", () => {
    render(<ListingCard listing={{ ...mockListing, images: [] }} />);
    expect(screen.queryByAltText("iPhone 13 Pro")).not.toBeInTheDocument();
  });

  it("links to correct item page", () => {
    render(<ListingCard listing={mockListing} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/item/123");
  });
});
