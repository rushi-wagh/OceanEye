import { create } from "zustand";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "@/api/auth.api";
import { showToast } from "@/components/ui/showToast";

const getUserFromPayload = (payload) => {
  if (!payload) {
    return null;
  }

  if (payload.data?.user) {
    return payload.data.user;
  }

  if (payload.user) {
    return payload.user;
  }

  if (payload.data?.data?.user) {
    return payload.data.data.user;
  }

  return null;
};

let initializationPromise = null;

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
      error: null,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),

  initializeAuth: async () => {
    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      set({ isLoading: true, error: null });

      try {
        const response = await getCurrentUser();
        const nextUser = getUserFromPayload(response);

        set({
          user: nextUser,
          isAuthenticated: Boolean(nextUser),
          isLoading: false,
          error: null,
        });

        return nextUser;
      } catch (error) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error?.message || "Unable to restore the current session.",
        });

        return null;
      }
    })().finally(() => {
      initializationPromise = null;
    });

    return initializationPromise;
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await loginUser(credentials);
      const nextUser = getUserFromPayload(response);

      set({
        user: nextUser,
        isAuthenticated: Boolean(nextUser),
        isLoading: false,
        error: null,
      });

      showToast.success("Welcome back to OceanEye");
      return nextUser;
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error?.message || "Login failed.",
      });

      showToast.error(error?.message || "Login failed");
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await registerUser(payload);
      const nextUser = getUserFromPayload(response);

      set({
        user: nextUser,
        isAuthenticated: Boolean(nextUser),
        isLoading: false,
        error: null,
      });

      showToast.success("OceanEye account created");
      return nextUser;
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error?.message || "Registration failed.",
      });

      showToast.error(error?.message || "Registration failed");
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await logoutUser();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      showToast.success("Logged out successfully");
      return true;
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error?.message || "Logout failed.",
      });

      showToast.error(error?.message || "Logout failed");
      throw error;
    }
  },
}));

export { useAuthStore };
