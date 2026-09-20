import { create } from "zustand";

export interface Child {
  id: string;
  name: string;
  avatar: string;
  dob?: string;
  grade: string; // e.g., "Class 8"
  school: string;
  age?: number;
  subjects: string[];
  learningGoals: string;
  preferredFormat?: "online" | "in-person" | "both";
}

export interface Address {
  id: string;
  label: string;
  houseNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "upi" | "card" | "netbanking";
  label: string;
  details: string;
  icon: string;
  isDefault: boolean;
}

export interface ParentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
}

interface UserState {
  user: ParentUser;
  children: Child[];
  activeChildId: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  favoriteTeacherIds: string[];

  // Actions
  setActiveChildId: (id: string) => void;
  addChild: (child: Omit<Child, "id">) => void;
  updateChild: (id: string, child: Partial<Child>) => void;
  removeChild: (id: string) => void;
  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  toggleFavoriteTeacher: (teacherId: string) => void;
  updateParentProfile: (data: Partial<ParentUser>) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: {
    id: "parent-101",
    name: "Alok Sharma",
    email: "alok.sharma@example.com",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    location: "Vasant Vihar, New Delhi",
  },
  children: [
    {
      id: "child-1",
      name: "Aarav Sharma",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
      dob: "2013-05-14",
      grade: "Class 8",
      school: "Delhi Public School, R.K. Puram",
      age: 13,
      subjects: ["Mathematics", "Science", "English"],
      learningGoals: "Improve school performance, build strong math foundation for Class 9.",
      preferredFormat: "in-person",
    },
    {
      id: "child-2",
      name: "Ananya Sharma",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
      dob: "2016-11-20",
      grade: "Class 5",
      school: "Modern School, Vasant Vihar",
      age: 10,
      subjects: ["Science", "English", "French"],
      learningGoals: "Improve English grammar and build confidence in science concepts.",
      preferredFormat: "in-person",
    },
  ],
  activeChildId: "child-1",

  addresses: [
    {
      id: "addr-1",
      label: "Home",
      houseNo: "B-42",
      street: "Vasant Marg, Block B",
      area: "Vasant Vihar",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110057",
      landmark: "Near Priya Cinema Complex",
      isDefault: true,
    },
  ],

  paymentMethods: [
    {
      id: "pm-1",
      type: "upi",
      label: "Google Pay UPI",
      details: "alok.sharma@okicici",
      icon: "qr-code-outline",
      isDefault: true,
    },
    {
      id: "pm-2",
      type: "card",
      label: "HDFC Platinum Credit Card",
      details: "•••• •••• •••• 4829",
      icon: "card-outline",
      isDefault: false,
    },
  ],

  favoriteTeacherIds: ["tch-1", "tch-2"],

  setActiveChildId: (id) => set({ activeChildId: id }),

  addChild: (childData) => {
    const newChild: Child = {
      ...childData,
      id: `child-${Date.now()}`,
    };
    set((state) => ({
      children: [...state.children, newChild],
      activeChildId: newChild.id,
    }));
  },

  updateChild: (id, partialData) => {
    set((state) => ({
      children: state.children.map((c) =>
        c.id === id ? { ...c, ...partialData } : c
      ),
    }));
  },

  removeChild: (id) => {
    set((state) => {
      const remaining = state.children.filter((c) => c.id !== id);
      const nextActive =
        state.activeChildId === id ? remaining[0]?.id || "" : state.activeChildId;
      return { children: remaining, activeChildId: nextActive };
    });
  },

  addAddress: (addrData) => {
    const newAddr: Address = {
      ...addrData,
      id: `addr-${Date.now()}`,
    };
    set((state) => ({ addresses: [...state.addresses, newAddr] }));
  },

  removeAddress: (id) => {
    set((state) => ({
      addresses: state.addresses.filter((a) => a.id !== id),
    }));
  },

  setDefaultAddress: (id) => {
    set((state) => ({
      addresses: state.addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    }));
  },

  toggleFavoriteTeacher: (teacherId) => {
    set((state) => {
      const exists = state.favoriteTeacherIds.includes(teacherId);
      return {
        favoriteTeacherIds: exists
          ? state.favoriteTeacherIds.filter((id) => id !== teacherId)
          : [...state.favoriteTeacherIds, teacherId],
      };
    });
  },

  updateParentProfile: (data) => {
    set((state) => ({ user: { ...state.user, ...data } }));
  },
}));
