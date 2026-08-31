import { ConvexReactClient } from "convex/react";

// Read VITE_CONVEX_URL from environment
export const CONVEX_URL = (import.meta.env.VITE_CONVEX_URL as string | undefined)?.trim() || "";

export const isConvexConfigured = Boolean(CONVEX_URL && CONVEX_URL.startsWith("http"));

// Initialize ConvexReactClient if URL is configured
export const convexClient = isConvexConfigured ? new ConvexReactClient(CONVEX_URL) : null;
