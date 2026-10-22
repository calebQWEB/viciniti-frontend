import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        // Old notifications and emails link here; the sales list lives on the purchases page
        source: "/dashboard/sales",
        destination: "/dashboard/purchases?tab=sales",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
