/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],

  compiler: {
    styledComponents: true,
  }
};

module.exports = nextConfig;
