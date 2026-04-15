import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    // Supabase API — NetworkFirst so fresh data is preferred, falls back to cache
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-api",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 }, // 1 hour
        networkTimeoutSeconds: 8,
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Next.js pages — NetworkFirst
    {
      urlPattern: /^https?:\/\/.*\/_next\/data\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "next-data",
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
        networkTimeoutSeconds: 8,
      },
    },
    // Static assets (JS/CSS/fonts) — StaleWhileRevalidate
    {
      urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
      },
    },
    // Images — CacheFirst
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Google Fonts — StaleWhileRevalidate
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    // Everything else — NetworkFirst with fallback
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "crm-general",
        expiration: { maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 },
        networkTimeoutSeconds: 10,
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
});

const nextConfig: NextConfig = {};

export default withPWA(nextConfig);
