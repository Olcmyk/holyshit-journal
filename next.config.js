/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zbmssjekxlzjgvedoocs.supabase.co',
      },
    ],
  },
};

export default nextConfig;
