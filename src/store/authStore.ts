import { create } from "zustand";
import { User } from "../types";
import { getUserData } from "../services/auth";

const toNumber = (value: any, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

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
    streak: toNumber(base.streak, 0),
    freezeCount: toNumber(base.freezeCount, 0),
    lastActiveDate: base.lastActiveDate,
    referralCode: base.referralCode || "",
    referredBy: base.referredBy,
    coursesCompleted: toNumber(base.coursesCompleted, 0),
  };
};

const isSameUser = (a: User | null, b: User | null) => {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return (
    a._id === b._id &&
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.email === b.email &&
    a.phone === b.phone &&
    a.imageUrl === b.imageUrl &&
    a.streak === b.streak &&
    a.freezeCount === b.freezeCount &&
    a.lastActiveDate === b.lastActiveDate &&
    a.referralCode === b.referralCode &&
    a.referredBy === b.referredBy &&
    a.coursesCompleted === b.coursesCompleted
  );
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
  setUser: (user) =>
    set((state) => {
      const normalized = normalizeUser(user);
      if (isSameUser(state.user, normalized)) {
        return state;
      }
      return { user: normalized };
    }),
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
