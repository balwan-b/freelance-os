"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";

export function AuthBootstrap() {
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { currentUser } = useCurrentUser();
  const attempted = useRef(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || attempted.current || currentUser) {
      return;
    }

    attempted.current = true;
    ensureCurrentUser({}).catch(() => {
      attempted.current = false;
    });
  }, [currentUser, ensureCurrentUser, isAuthenticated, isLoading]);

  return null;
}
