"use client";

import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCurrentUser() {
  const { isAuthenticated } = useConvexAuth();
  // Skip the query entirely for unauthenticated users (landing, sign-in, sign-up pages)
  const currentUser = useQuery(api.users.current, isAuthenticated ? {} : "skip");

  return {
    currentUser: currentUser ?? null,
    // Only show loading when we're authenticated but still waiting for the profile
    isLoading: isAuthenticated && currentUser === undefined,
  };
}
