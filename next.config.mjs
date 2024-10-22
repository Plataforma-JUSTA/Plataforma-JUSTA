/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "",
  output: "export",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // FIXME: Require type check
  },
};

export default nextConfig;
