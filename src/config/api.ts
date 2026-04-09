// Centralized API configuration
export const API_CONFIG = {
  // BASE_URL: "https://api.bookmysession.in",
  BASE_URL: "http://192.168.31.9:8001",
  ENDPOINTS: {
    // Auth
    SEND_OTP: "/auth/whatsapp/send-otp",
    VERIFY_OTP: "/auth/whatsapp/verify-otp",
    RESEND_OTP: "/auth/whatsapp/resend-otp",
    CREATE_ACCOUNT: "/student/create-account",
    UPDATE_STUDENT_PROFILE: "/student/updateStudentProfile",
    PINCODE_LOOKUP: (code: string) => `/student/pincode/${code}`,

    // Teachers
    TEACHERS: "/teacher/nearby-teachers",
    TEACHER_DETAIL: (id: string) => `/teachers/${id}`,

    // Bookings
    BOOKINGS: "/appointments/create",
    MY_BOOKINGS: "/appointments/myAppointments",
    BOOKING_DETAIL: (id: string) => `/appointments/${id}`,
    CANCEL_BOOKING: (id: string) => `/appointments/cancel/${id}`,

    // User
    USER_PROFILE: "/user/profile",

    // Payments
    RAZORPAY_CREATE_ORDER: "/payments/razorpay/create-order",
    RAZORPAY_VERIFY_PAYMENT: "/payments/razorpay/verify",
  },
  TIMEOUT: 30000,
  DEBOUNCE_DELAY: 300,
};

export const RAZORPAY_CONFIG = {
  KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
  ENABLED:
    process.env.EXPO_PUBLIC_RAZORPAY_ENABLED === "true" &&
    !!process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
};
