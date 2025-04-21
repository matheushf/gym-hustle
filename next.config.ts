// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  disable: process.env.NODE_ENV === "development",
  dest: "public",
  sw: "service-worker.gen.js",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
};

module.exports = withPWA(nextConfig);
