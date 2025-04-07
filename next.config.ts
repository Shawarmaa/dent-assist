const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Add this to ignore TypeScript build errors
  },
};

module.exports = nextConfig;