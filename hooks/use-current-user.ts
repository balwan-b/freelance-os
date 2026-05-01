"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCurrentUser() {
  const currentUser = useQuery(api.users.current, {});

  return {
    currentUser: currentUser ?? null,
    isLoading: currentUser === undefined,
  };
}
