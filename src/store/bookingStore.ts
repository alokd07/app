import { create } from "zustand";

export interface SessionItem {
  id: string; // e.g. "BMS-84920"
  bookingId: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherSubject: string;
  learnerId: string; // "child-1" or "self"
  learnerName: string;
  learnerAvatar: string;
  subject: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "05:00 PM - 06:00 PM"
  durationMinutes: number; // 60
  format: "online" | "in-person";
  status: "upcoming" | "pending" | "completed" | "cancelled" | "in_progress";
  meetingUrl?: string;
  addressLabel?: string;
  addressFull?: string;
  amountPaid: number;
  platformFee: number;
  teacherPhone?: string;
  cancellationPolicy: string;
  notes?: string;
  rating?: number;
  reviewComment?: string;
}

export interface BookingWizardState {
  teacherId: string | null;
  learnerId: string;
  subject: string;
  date: string | null;
  timeSlot: string | null;
  durationMinutes: number;
  format: "online" | "in-person";
  addressId: string | null;
  customAddress?: {
    houseNo: string;
    street: string;
    area: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  promoCode: string;
  discountAmount: number;
}

interface BookingStoreState {
  sessions: SessionItem[];
  assignedTeachersBySubject: { [subject: string]: string }; // e.g. { "Mathematics": "tch-1" }
  replacementSubjectContext: string | null; // Set when replacing teacher for a subject
  wizard: BookingWizardState;

  // Actions
  setWizardData: (data: Partial<BookingWizardState>) => void;
  resetWizard: () => void;
  createBooking: () => SessionItem;
  cancelSession: (sessionId: string, reason: string) => { success: boolean; refundAmount: number };
  rescheduleSession: (sessionId: string, newDate: string, newTimeSlot: string) => boolean;
  replaceTeacherForSubject: (subject: string) => { switchFee: number };
  addSessionReview: (sessionId: string, rating: number, comment: string) => void;
  getSessionsForLearner: (learnerId?: string) => SessionItem[];
  getUpcomingSession: (learnerId?: string) => SessionItem | undefined;
}

const INITIAL_WIZARD: BookingWizardState = {
  teacherId: null,
  learnerId: "child-1",
  subject: "Mathematics",
  date: "2026-09-21",
  timeSlot: "05:00 PM - 06:00 PM",
  durationMinutes: 60,
  format: "online",
  addressId: "addr-1",
  promoCode: "",
  discountAmount: 0,
};

const MOCK_SESSIONS: SessionItem[] = [
  {
    id: "BMS-92810",
    bookingId: "BMS-92810",
    teacherId: "tch-1",
    teacherName: "Priya Sharma",
    teacherAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
    teacherSubject: "Mathematics",
    learnerId: "child-1",
    learnerName: "Aarav Sharma",
    learnerAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
    subject: "Mathematics",
    date: "2026-09-21",
    timeSlot: "05:00 PM - 06:00 PM",
    durationMinutes: 60,
    format: "online",
    status: "upcoming",
    meetingUrl: "https://meet.bookmysession.in/room/bms-math-92810",
    amountPaid: 750,
    platformFee: 50,
    cancellationPolicy: "Free cancellation up to 24h before start.",
  },
  {
    id: "BMS-81729",
    bookingId: "BMS-81729",
    teacherId: "tch-2",
    teacherName: "Dr. Rajesh Verma",
    teacherAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80",
    teacherSubject: "Physics",
    learnerId: "child-1",
    learnerName: "Aarav Sharma",
    learnerAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
    subject: "Physics",
    date: "2026-09-22",
    timeSlot: "04:00 PM - 05:00 PM",
    durationMinutes: 60,
    format: "in-person",
    status: "upcoming",
    addressLabel: "Home",
    addressFull: "B-42, Vasant Marg, Block B, Vasant Vihar, New Delhi - 110057",
    amountPaid: 1100,
    platformFee: 50,
    cancellationPolicy: "Free cancellation up to 24h before start.",
  },
  {
    id: "BMS-71620",
    bookingId: "BMS-71620",
    teacherId: "tch-3",
    teacherName: "Ananya Sen",
    teacherAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
    teacherSubject: "English Literature",
    learnerId: "child-2",
    learnerName: "Ananya Sharma",
    learnerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
    subject: "English Literature",
    date: "2026-09-18",
    timeSlot: "04:00 PM - 05:00 PM",
    durationMinutes: 60,
    format: "online",
    status: "completed",
    amountPaid: 650,
    platformFee: 50,
    cancellationPolicy: "Completed",
    notes: "Ananya did fantastic in poetry analysis today! Homework given for chapter 4.",
    rating: 5,
    reviewComment: "Very patient teacher. Ananya enjoyed the lesson immensely!",
  },
];

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  sessions: MOCK_SESSIONS,
  assignedTeachersBySubject: {
    Mathematics: "tch-1",
    Physics: "tch-2",
  },
  replacementSubjectContext: null,
  wizard: INITIAL_WIZARD,

  setWizardData: (data) =>
    set((state) => ({
      wizard: { ...state.wizard, ...data },
    })),

  resetWizard: () => set({ wizard: INITIAL_WIZARD, replacementSubjectContext: null }),

  createBooking: () => {
    const { wizard, sessions, assignedTeachersBySubject } = get();
    const newSessionId = `BMS-${Math.floor(10000 + Math.random() * 90000)}`;

    const newSession: SessionItem = {
      id: newSessionId,
      bookingId: newSessionId,
      teacherId: wizard.teacherId || "tch-1",
      teacherName: "Priya Sharma",
      teacherAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
      teacherSubject: wizard.subject,
      learnerId: wizard.learnerId,
      learnerName: wizard.learnerId === "child-2" ? "Ananya Sharma" : "Aarav Sharma",
      learnerAvatar:
        wizard.learnerId === "child-2"
          ? "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80"
          : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80",
      subject: wizard.subject,
      date: wizard.date || "2026-09-22",
      timeSlot: wizard.timeSlot || "10:00 AM - 11:00 AM",
      durationMinutes: wizard.durationMinutes,
      format: wizard.format,
      status: "upcoming",
      meetingUrl: wizard.format === "online" ? `https://meet.bookmysession.in/room/${newSessionId.toLowerCase()}` : undefined,
      addressLabel: wizard.format === "in-person" ? "Home Address" : undefined,
      addressFull: wizard.format === "in-person" ? "B-42, Vasant Marg, Vasant Vihar, New Delhi" : undefined,
      amountPaid: 750,
      platformFee: 50,
      cancellationPolicy: "Free cancellation up to 24h before start.",
    };

    set({
      sessions: [newSession, ...sessions],
      assignedTeachersBySubject: {
        ...assignedTeachersBySubject,
        [wizard.subject]: wizard.teacherId || "tch-1",
      },
      replacementSubjectContext: null,
      wizard: INITIAL_WIZARD,
    });

    return newSession;
  },

  cancelSession: (sessionId, reason) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) return { success: false, refundAmount: 0 };

    const refund = session.amountPaid; // full refund mock

    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, status: "cancelled" } : s
      ),
    }));

    return { success: true, refundAmount: refund };
  },

  rescheduleSession: (sessionId, newDate, newTimeSlot) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, date: newDate, timeSlot: newTimeSlot } : s
      ),
    }));
    return true;
  },

  replaceTeacherForSubject: (subject) => {
    const currentAssignments = { ...get().assignedTeachersBySubject };
    delete currentAssignments[subject];

    set({
      assignedTeachersBySubject: currentAssignments,
      replacementSubjectContext: subject,
    });

    return { switchFee: 0 }; // Free replacement within policy
  },

  addSessionReview: (sessionId, rating, comment) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, rating, reviewComment: comment } : s
      ),
    }));
  },

  getSessionsForLearner: (learnerId) => {
    const { sessions } = get();
    if (!learnerId || learnerId === "all") return sessions;
    return sessions.filter((s) => s.learnerId === learnerId);
  },

  getUpcomingSession: (learnerId) => {
    const list = get().getSessionsForLearner(learnerId);
    return list.find((s) => s.status === "upcoming" || s.status === "in_progress");
  },
}));
