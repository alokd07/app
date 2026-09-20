import { create } from "zustand";

export interface TeacherReview {
  id: string;
  parentName: string;
  authorName?: string;
  authorRole?: string;
  childGrade: string;
  rating: number;
  date: string;
  comment: string;
  tags?: string[];
}

export interface NearbyTeacher {
  id: string;
  name: string;
  profileImage: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  experienceYears: number;
  distanceKm: number;
  hourlyRate: number;
  pricePerHour?: number; // Compatibility alias
  demoFee: number;
  estimatedMonthlyFee: number;
  subjects: string[];
  classesTaught: string[];
  teachingArea: string;
  location?: string; // Compatibility alias
  languages: string[];
  qualifications: string[];
  bio: string;
  teachingStyle: string;
  availabilityDays: string[];
  availableSlots: string[];
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: TeacherReview[];
}

export type DetailedTeacher = NearbyTeacher; // Type alias

interface TeacherFilterState {
  searchQuery: string;
  subject: string;
  grade: string;
  maxDistanceKm: number;
  maxMonthlyPrice: number;
  minRating: number;
  minExperience: number;
  verifiedOnly: boolean;
  sortBy: "recommended" | "nearest" | "rating" | "experience" | "price";
}

interface TeacherStoreState {
  teachers: NearbyTeacher[];
  filters: TeacherFilterState;

  // Actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<TeacherFilterState>) => void;
  resetFilters: () => void;
  getFilteredTeachers: () => NearbyTeacher[];
  getTeacherById: (id: string) => NearbyTeacher | undefined;
}

const DEFAULT_FILTERS: TeacherFilterState = {
  searchQuery: "",
  subject: "all",
  grade: "all",
  maxDistanceKm: 15,
  maxMonthlyPrice: 15000,
  minRating: 0,
  minExperience: 0,
  verifiedOnly: false,
  sortBy: "recommended",
};

const MOCK_TEACHERS: NearbyTeacher[] = [
  {
    id: "tch-1",
    name: "Rahul Sharma",
    profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80",
    verified: true,
    rating: 4.8,
    totalReviews: 42,
    experienceYears: 5,
    distanceKm: 2.1,
    hourlyRate: 500,
    pricePerHour: 500,
    demoFee: 0,
    estimatedMonthlyFee: 6000,
    subjects: ["Mathematics", "Science"],
    classesTaught: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
    teachingArea: "Vasant Vihar, West End, Shanti Niketan",
    location: "Vasant Vihar, New Delhi",
    languages: ["English", "Hindi"],
    qualifications: ["M.Sc. Mathematics, Delhi University", "B.Ed."],
    bio: "Passionate secondary math & science tutor with 5+ years of home tuition experience. Specializes in building core mathematical logic and boosting board exam confidence.",
    teachingStyle: "Step-by-step visual explanations, daily practice sheets, and concept-building through real-life examples.",
    availabilityDays: ["Monday", "Wednesday", "Friday"],
    availableSlots: ["04:00 PM – 05:00 PM", "05:00 PM – 06:00 PM", "06:00 PM – 07:00 PM"],
    ratingDistribution: { 5: 36, 4: 4, 3: 2, 2: 0, 1: 0 },
    reviews: [
      {
        id: "rev-1",
        parentName: "Sanjay Malhotra",
        authorName: "Sanjay Malhotra",
        authorRole: "Parent",
        childGrade: "Class 8 Parent",
        rating: 5,
        date: "2 weeks ago",
        comment: "Rahul Sir is punctual, patient, and very thorough with algebra concepts. My son Aarav improved from 65% to 90%!",
        tags: ["Punctual", "Patient", "Clear Explanations"],
      },
      {
        id: "rev-2",
        parentName: "Kavita Roy",
        authorName: "Kavita Roy",
        authorRole: "Parent",
        childGrade: "Class 9 Parent",
        rating: 5,
        date: "1 month ago",
        comment: "Excellent home tutor. He visits our home on time every Monday and Wednesday without fail.",
        tags: ["Professional", "Knowledgeable"],
      },
    ],
  },
  {
    id: "tch-2",
    name: "Dr. Priya Verma",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
    verified: true,
    rating: 4.95,
    totalReviews: 86,
    experienceYears: 10,
    distanceKm: 3.4,
    hourlyRate: 750,
    pricePerHour: 750,
    demoFee: 0,
    estimatedMonthlyFee: 9000,
    subjects: ["Physics", "Chemistry"],
    classesTaught: ["Class 8", "Class 9", "Class 10", "Class 11"],
    teachingArea: "Vasant Kunj, Munirka, RK Puram",
    location: "Vasant Kunj, New Delhi",
    languages: ["English", "Hindi"],
    qualifications: ["Ph.D. Physics, JNU", "B.Sc. St. Stephen's"],
    bio: "Ex-school faculty with 10 years experience in conducting home tuition for CBSE science & foundation physics.",
    teachingStyle: "Structured numerical problem solving, weekly tests, and comprehensive doubt resolution.",
    availabilityDays: ["Tuesday", "Thursday", "Saturday"],
    availableSlots: ["05:00 PM – 06:00 PM", "06:00 PM – 07:00 PM"],
    ratingDistribution: { 5: 80, 4: 5, 3: 1, 2: 0, 1: 0 },
    reviews: [],
  },
];

export const useTeacherStore = create<TeacherStoreState>((set, get) => ({
  teachers: MOCK_TEACHERS,
  filters: DEFAULT_FILTERS,

  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  getFilteredTeachers: () => {
    const { teachers, filters } = get();
    let result = [...teachers];

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subjects.some((s) => s.toLowerCase().includes(q)) ||
          t.classesTaught.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (filters.subject !== "all") {
      result = result.filter((t) =>
        t.subjects.some((s) => s.toLowerCase() === filters.subject.toLowerCase())
      );
    }

    if (filters.grade !== "all") {
      result = result.filter((t) =>
        t.classesTaught.some((c) => c.toLowerCase() === filters.grade.toLowerCase())
      );
    }

    result = result.filter((t) => t.distanceKm <= filters.maxDistanceKm);

    if (filters.verifiedOnly) {
      result = result.filter((t) => t.verified);
    }

    switch (filters.sortBy) {
      case "nearest":
        result.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "experience":
        result.sort((a, b) => b.experienceYears - a.experienceYears);
        break;
      case "price":
        result.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case "recommended":
      default:
        result.sort((a, b) => b.rating * b.totalReviews - a.rating * a.totalReviews);
        break;
    }

    return result;
  },

  getTeacherById: (id) => get().teachers.find((t) => t.id === id),
}));
