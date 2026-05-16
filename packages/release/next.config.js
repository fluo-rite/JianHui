const basePath = process.env.NEXT_PUBLIC_RELEASE_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
};

module.exports = nextConfig
