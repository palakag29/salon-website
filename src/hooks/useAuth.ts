import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

export const useAuth = (): AuthState => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    const checkAdmin = async (user: User | null) => {
      if (!user) {
        setState({ user: null, session: null, isAdmin: false, loading: false });
        return;
      }

      // Try app_metadata first
      if (user.app_metadata?.role === "admin") {
        setState((s) => ({ ...s, user, isAdmin: true, loading: false }));
        return;
      }

      // Fallback to user_roles table
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdmin = roles?.some((r) => r.role === "admin") ?? false;
      setState((s) => ({ ...s, user, isAdmin, loading: false }));
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState((s) => ({ ...s, session, user: session?.user ?? null, loading: true }));
        // Defer role check to avoid Supabase client deadlock
        setTimeout(() => checkAdmin(session?.user ?? null), 0);
      }
    );

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((s) => ({ ...s, session, user: session?.user ?? null }));
      checkAdmin(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
};
