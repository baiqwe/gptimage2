"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

const JUST_SIGNED_IN_COOKIE = "auth_just_signed_in";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

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
  }, [supabase]);

  async function getSessionUser() {
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
  }

  async function getFreshUser() {
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
  }

  return { user, loading };
}
