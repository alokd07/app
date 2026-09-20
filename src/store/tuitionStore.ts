import { create } from "zustand";

export type DemoStatus =
  | "DEMO_REQUESTED"
  | "DEMO_CONFIRMED"
  | "DEMO_COMPLETED"
  | "ASSIGNED"
  | "NOT_INTERESTED"
  | "DECIDE_LATER"
  | "CANCELLED";

export type TuitionStatus =
  | "PENDING_ASSIGNMENT"
  | "ACTIVE"
  | "PAUSED"
  | "CANCELLATION_REQUESTED"
  | "CANCELLED";

export interface DemoRequest {
  id: string; // e.g. "DEMO-801"
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  childId: string;
  childName: string;
  subject: string;
  preferredDate: string; // "2026-09-22"
  preferredTime: string; // "05:00 PM – 06:00 PM"
  location: string;
  noteForTeacher?: string;
  status: DemoStatus;
  requestedAt: string;
  demoFee: number;
}

export interface ActiveTuition {
  id: string; // e.g. "TUT-101"
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherPhone: string;
  childId: string;
  childName: string;
  subject: string;
  daysSchedule: string[]; // ["Monday", "Wednesday", "Friday"]
  timeSlot: string; // "5:00 PM – 6:00 PM"
  location: string;
  monthlyFee: number; // e.g. 6000
  hourlyRate: number; // 500
  classesPerWeek: number; // 3
  status: TuitionStatus;
  startDate: string; // "2026-09-01"
  nextClassDate: string; // "Today, 5:00 PM"
}

export interface MonthlyInvoice {
  id: string; // e.g. "BOOKMYSESSION-SEP-2026-001"
  tuitionId: string;
  childName: string;
  teacherName: string;
  subject: string;
  billingPeriod: string; // "September 1 – September 30, 2026"
  totalClassesScheduled: number; // 12
  completedClasses: number; // 10
  amount: number; // 6000
  dueDate: string; // "2026-10-05"
  status: "PAID" | "DUE" | "OVERDUE";
  paidOnDate?: string;
}

export interface AttendanceRecord {
  date: string; // "2026-09-07"
  dayName: string; // "Mon"
  status: "Completed" | "Cancelled" | "Teacher Absent" | "Student Absent";
  notes?: string;
}

export interface WeeklyTestScore {
  id: string;
  tuitionId: string;
  testName: string;
  subject: string;
  conductedDate: string; // e.g. "Sep 12, 2026"
  score: number;          // e.g. 85
  maxScore: number;       // e.g. 100
  percentile?: number;    // e.g. 78
  teacherRemark: string;
  topicsAssessed: string[];
  trend: "up" | "down" | "same"; // vs previous test
}

interface TuitionStoreState {
  demoRequests: DemoRequest[];
  activeTuitions: ActiveTuition[];
  invoices: MonthlyInvoice[];
  attendance: { [tuitionId: string]: AttendanceRecord[] };
  testScores: { [tuitionId: string]: WeeklyTestScore[] };

  // Actions
  getTestScoresForTuition: (tuitionId: string) => WeeklyTestScore[];
  dismissTeacher: (tuitionId: string) => void;
  createDemoRequest: (req: Omit<DemoRequest, "id" | "status" | "requestedAt">) => DemoRequest;
  updateDemoStatus: (demoId: string, status: DemoStatus) => void;
  assignTeacherFromDemo: (
    demoId: string,
    scheduleDays: string[],
    timeSlot: string,
    monthlyFee: number
  ) => ActiveTuition;
  payMonthlyBill: (invoiceId: string) => void;
  requestTuitionCancellation: (tuitionId: string, reason: string) => void;
  getActiveTuitionForChild: (childId: string) => ActiveTuition | undefined;
  getDemoRequestForChild: (childId: string) => DemoRequest | undefined;
  getLatestInvoiceForChild: (childId: string) => MonthlyInvoice | undefined;
}

const MOCK_DEMOS: DemoRequest[] = [
  {
    id: "DEMO-801",
    teacherId: "tch-1",
    teacherName: "Rahul Sharma",
    teacherAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80",
    childId: "child-1",
    childName: "Aarav Sharma",
    subject: "Mathematics",
    preferredDate: "2026-09-22",
    preferredTime: "05:00 PM – 06:00 PM",
    location: "B-42, Vasant Vihar, New Delhi",
    noteForTeacher: "Please focus on Class 8 Algebra and school syllabus.",
    status: "DEMO_COMPLETED", // Presenting post-demo state for Aarav
    requestedAt: "2026-09-18",
    demoFee: 0,
  },
];

const MOCK_TUITIONS: ActiveTuition[] = [
  {
    id: "TUT-101",
    teacherId: "tch-1",
    teacherName: "Rahul Sharma",
    teacherAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80",
    teacherPhone: "+91 98112 34567",
    childId: "child-1",
    childName: "Aarav Sharma",
    subject: "Mathematics",
    daysSchedule: ["Monday", "Wednesday", "Friday"],
    timeSlot: "5:00 PM – 6:00 PM",
    location: "B-42, Vasant Marg, Vasant Vihar, New Delhi",
    monthlyFee: 6000,
    hourlyRate: 500,
    classesPerWeek: 3,
    status: "ACTIVE",
    startDate: "2026-09-01",
    nextClassDate: "Today, 5:00 PM",
  },
];

const MOCK_INVOICES: MonthlyInvoice[] = [
  {
    id: "BOOKMYSESSION-SEP-2026-001",
    tuitionId: "TUT-101",
    childName: "Aarav Sharma",
    teacherName: "Rahul Sharma",
    subject: "Mathematics",
    billingPeriod: "September 1 – September 30, 2026",
    totalClassesScheduled: 12,
    completedClasses: 10,
    amount: 6000,
    dueDate: "2026-10-05",
    status: "DUE",
  },
];

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { date: "2026-09-02", dayName: "Wed", status: "Completed", notes: "Covered Linear Equations Ex 2.1" },
  { date: "2026-09-04", dayName: "Fri", status: "Completed", notes: "Algebra practice test conducted" },
  { date: "2026-09-07", dayName: "Mon", status: "Completed" },
  { date: "2026-09-09", dayName: "Wed", status: "Teacher Absent", notes: "Rescheduled to Saturday" },
  { date: "2026-09-11", dayName: "Fri", status: "Completed" },
  { date: "2026-09-14", dayName: "Mon", status: "Completed" },
  { date: "2026-09-16", dayName: "Wed", status: "Completed" },
  { date: "2026-09-18", dayName: "Fri", status: "Completed" },
];

const MOCK_TEST_SCORES: { [tuitionId: string]: WeeklyTestScore[] } = {
  "TUT-101": [
    {
      id: "test-1",
      tuitionId: "TUT-101",
      testName: "Linear Equations — Chapter 2 Test",
      subject: "Mathematics",
      conductedDate: "Sep 4, 2026",
      score: 72,
      maxScore: 100,
      percentile: 65,
      teacherRemark: "Good attempt. Work more on word problems and step-by-step working.",
      topicsAssessed: ["Linear Equations", "Word Problems", "Graphs"],
      trend: "same",
    },
    {
      id: "test-2",
      tuitionId: "TUT-101",
      testName: "Algebra Fundamentals — Unit 1",
      subject: "Mathematics",
      conductedDate: "Sep 11, 2026",
      score: 81,
      maxScore: 100,
      percentile: 74,
      teacherRemark: "Great improvement! Algebra concepts are much clearer now. Focus on signs when transposing.",
      topicsAssessed: ["Variables", "Expressions", "Simple Equations"],
      trend: "up",
    },
    {
      id: "test-3",
      tuitionId: "TUT-101",
      testName: "Geometry — Lines & Angles",
      subject: "Mathematics",
      conductedDate: "Sep 18, 2026",
      score: 88,
      maxScore: 100,
      percentile: 82,
      teacherRemark: "Excellent work! Proof-based questions were handled very well. Keep it up!",
      topicsAssessed: ["Parallel Lines", "Transversal", "Angle Proofs", "Triangle Properties"],
      trend: "up",
    },
  ],
};

export const useTuitionStore = create<TuitionStoreState>((set, get) => ({
  demoRequests: MOCK_DEMOS,
  activeTuitions: MOCK_TUITIONS,
  invoices: MOCK_INVOICES,
  attendance: { "TUT-101": MOCK_ATTENDANCE },
  testScores: MOCK_TEST_SCORES,

  getTestScoresForTuition: (tuitionId) => {
    return get().testScores[tuitionId] || [];
  },
  dismissTeacher: (tuitionId) => {
    set((state) => ({
      activeTuitions: state.activeTuitions.map((t) =>
        t.id === tuitionId ? { ...t, status: "CANCELLED" } : t
      ),
    }));
  },

  createDemoRequest: (reqData) => {
    const newDemo: DemoRequest = {
      ...reqData,
      id: `DEMO-${Math.floor(100 + Math.random() * 900)}`,
      status: "DEMO_REQUESTED",
      requestedAt: new Date().toISOString().split("T")[0],
    };
    set((state) => ({
      demoRequests: [newDemo, ...state.demoRequests],
    }));
    return newDemo;
  },

  updateDemoStatus: (demoId, status) => {
    set((state) => ({
      demoRequests: state.demoRequests.map((d) =>
        d.id === demoId ? { ...d, status } : d
      ),
    }));
  },

  assignTeacherFromDemo: (demoId, scheduleDays, timeSlot, monthlyFee) => {
    const demo = get().demoRequests.find((d) => d.id === demoId);
    const tuitionId = `TUT-${Math.floor(100 + Math.random() * 900)}`;

    const newTuition: ActiveTuition = {
      id: tuitionId,
      teacherId: demo?.teacherId || "tch-1",
      teacherName: demo?.teacherName || "Rahul Sharma",
      teacherAvatar: demo?.teacherAvatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80",
      teacherPhone: "+91 98112 34567",
      childId: demo?.childId || "child-1",
      childName: demo?.childName || "Aarav Sharma",
      subject: demo?.subject || "Mathematics",
      daysSchedule: scheduleDays,
      timeSlot,
      location: demo?.location || "Home",
      monthlyFee,
      hourlyRate: 500,
      classesPerWeek: scheduleDays.length,
      status: "ACTIVE",
      startDate: new Date().toISOString().split("T")[0],
      nextClassDate: "Tomorrow, 5:00 PM",
    };

    set((state) => ({
      activeTuitions: [newTuition, ...state.activeTuitions],
      demoRequests: state.demoRequests.map((d) =>
        d.id === demoId ? { ...d, status: "ASSIGNED" } : d
      ),
    }));

    return newTuition;
  },

  payMonthlyBill: (invoiceId) => {
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: "PAID", paidOnDate: new Date().toLocaleDateString() }
          : inv
      ),
    }));
  },

  requestTuitionCancellation: (tuitionId, reason) => {
    set((state) => ({
      activeTuitions: state.activeTuitions.map((t) =>
        t.id === tuitionId ? { ...t, status: "CANCELLATION_REQUESTED" } : t
      ),
    }));
  },

  getActiveTuitionForChild: (childId) => {
    return get().activeTuitions.find(
      (t) => t.childId === childId && (t.status === "ACTIVE" || t.status === "CANCELLATION_REQUESTED")
    );
  },

  getDemoRequestForChild: (childId) => {
    return get().demoRequests.find((d) => d.childId === childId);
  },

  getLatestInvoiceForChild: (childId) => {
    const tuition = get().getActiveTuitionForChild(childId);
    if (!tuition) return undefined;
    return get().invoices.find((i) => i.tuitionId === tuition.id);
  },
}));
