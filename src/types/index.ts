// Teacher Types
export interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Availability {
  date: string;
  slots: TimeSlot[];
}

export interface Teacher {
  _id: string;
  name: string;
  subject: string;
  profileImage: string;
  subjects: string[];
  classes: string[];
  pricePerHour: number;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  bio?: string;
  experienceYears?: number;
  availability?: Availability[];
}

// Booking Types
export interface Booking {
  _id: string;
  teacher: Teacher | string;
  student: string;
  date: string;
  timeSlot: TimeSlot;
  status: 'upcoming' | 'completed' | 'cancelled';
  amount: number;
  advancePaid: number;
  remainingAmount: number;
  mode: 'online' | 'offline';
  createdAt?: string;
}

// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  imageUrl?: string;
  streak: number;
  referralCode: string;
  referredBy?: string;
  coursesCompleted: number;
}

// Auth Types
export interface LoginResponse {
  token: string;
  user: User;
}
