import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "0.0.0.0",
    "*.trycloudflare.com",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.cursor.sh",
  ],
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
