import { create } from "zustand";
import { User } from "../types";
import { getUserData } from "../services/auth";

const normalizeUser = (storedUser: any): User | null => {
  const base =
    storedUser?.student ??
    storedUser?.data?.student ??
    storedUser?.data ??
    storedUser ??
    null;

  if (!base) {
    return null;
  }

  return {
    _id: base._id || "",
    firstName: base.firstName || "",
    lastName: base.lastName || "",
    email: base.email || "",
    phone: base.phone || base.phoneNumber || "",
    imageUrl: base.imageUrl || "",
    streak: Number(base.streak || 0),
    referralCode: base.referralCode || "",
    referredBy: base.referredBy,
    coursesCompleted: Number(base.coursesCompleted || 0),
  };
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  hydrateUser: () => Promise<void>;
  setAuthenticated: (status: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user: normalizeUser(user) }),
  hydrateUser: async () => {
    if (get().user) {
      return;
    }

    const storedUser = await getUserData();
    const normalized = normalizeUser(storedUser);
    if (normalized) {
      set({ user: normalized });
    }
  },
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
