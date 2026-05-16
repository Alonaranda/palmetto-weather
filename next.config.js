/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx"],
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "openweathermap.org" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
