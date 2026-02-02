import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];

if (supabaseUrl) {
  try {
    const { hostname, protocol } = new URL(supabaseUrl);
    const normalizedProtocol =
      protocol === "https:" ? "https" : protocol === "http:" ? "http" : null;
    if (normalizedProtocol) {
      remotePatterns.push({
        protocol: normalizedProtocol,
        hostname,
        pathname: "/storage/v1/object/public/**",
      });
    }
  } catch {
    // Ignore invalid SUPABASE URL at build time.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
