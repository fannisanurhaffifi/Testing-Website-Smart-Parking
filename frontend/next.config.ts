import type { NextConfig } from "next";
import path from "path";


const nextConfig: NextConfig = {
  // @ts-ignore - turbopack is a valid property in Next.js 15+
  turbopack: {
    root: path.resolve(__dirname),
  },
};




export default nextConfig;

