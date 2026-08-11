import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import { API_URL } from "../utils/apiConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (currentUser, session) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    const isMetaAdmin =
      currentUser.user_metadata?.is_admin === true ||
      currentUser.app_metadata?.is_admin === true ||
      currentUser.email === "admin@wellfit.com";

    if (isMetaAdmin) {
      setIsAdmin(true);
      return;
    }

    try {
      const token = session?.access_token;
      if (token) {
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && data.isAdmin) {
          setIsAdmin(true);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not verify admin status with backend:", e);
    }

    setIsAdmin(false);
  };

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await checkAdminRole(currentUser, session);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await checkAdminRole(currentUser, session);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      return;
    }

    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}