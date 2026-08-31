import React from "react";
import { ConvexProvider } from "convex/react";
import { convexClient, isConvexConfigured } from "../lib/convex";

export const ConvexProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isConvexConfigured && convexClient) {
    return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
  }
  return <>{children}</>;
};
