"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

const JUST_SIGNED_IN_COOKIE = "auth_just_signed_in";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const getSessionUser = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error("Error getting session user:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const getFreshUser = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);
    } catch (error) {
      console.error("Error getting fresh user:", error);
    } finally {
      if (typeof document !== "undefined") {
        document.cookie = `${JUST_SIGNED_IN_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
      }
      setLoading(false);
    }
  }, [supabase]);

  const refreshUser = useCallback(
    async (strategy: "fresh" | "session" = "session") => {
      setLoading(true);
      if (strategy === "fresh") {
        await getFreshUser();
        return;
      }
      await getSessionUser();
    },
    [getFreshUser, getSessionUser]
  );

  useEffect(() => {
    let isActive = true;

    if (!supabase) {
      if (isActive) {
        setLoading(false);
      }
      return;
    }

    const justSignedIn = typeof document !== "undefined" &&
      document.cookie.includes(`${JUST_SIGNED_IN_COOKIE}=1`);

    if (justSignedIn) {
      getFreshUser();
    } else {
      // Read the local session first to avoid a visible auth-state flash in the header.
      getSessionUser();
    }

    // Listen for changes on auth state (login, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [getFreshUser, getSessionUser, supabase]);

  return { user, loading, refreshUser };
}
