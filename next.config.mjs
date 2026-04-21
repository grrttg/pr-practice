/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/": ["./prisma/dev.db"],
      "/admin": ["./prisma/dev.db"],
      "/appointments": ["./prisma/dev.db"],
      "/clients": ["./prisma/dev.db"],
      "/clients/[id]": ["./prisma/dev.db"],
      "/memberships": ["./prisma/dev.db"],
      "/api/appointments": ["./prisma/dev.db"],
      "/api/clients": ["./prisma/dev.db"],
      "/api/intake": ["./prisma/dev.db"],
      "/api/sales": ["./prisma/dev.db"],
    },
  },
};

export default nextConfig;
