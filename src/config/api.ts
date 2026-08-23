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
    TEACHER_DETAIL: (id: string) => `/teacher/${id}`,
    TEACHER_REVIEWS: (id: string) => `/teacher/${id}/reviews`,
    AI_RECOMMENDATIONS: "/teacher/ai-recommendations",

    // Bookings
    BOOKINGS: "/appointments/create",
    MY_BOOKINGS: "/appointments/myAppointments",
    BOOKING_DETAIL: (id: string) => `/appointments/${id}`,
    CANCEL_BOOKING: (id: string) => `/appointments/cancel/${id}`,

    // User
    USER_PROFILE: "/user/profile",
    LEARNING_PROGRESS: "/student/learning-progress",
    STUDENT_SETTINGS: "/student/settings",
    SUPPORT_TICKET: "/student/support-ticket",

    // Notifications
    NOTIFICATIONS: "/notifications",
    NOTIFICATIONS_MARK_READ: (id: string) => `/notifications/${id}/read`,
    NOTIFICATIONS_READ_ALL: "/notifications/read-all",

    // Payments
    RAZORPAY_CREATE_ORDER: "/payments/razorpay/create-order",
    RAZORPAY_VERIFY_PAYMENT: "/payments/razorpay/verify",
    PAYMENT_HISTORY: "/payments/history",

    // Demo
    DEMO_REQUEST: "/demo/request",
    MY_DEMOS: "/demo/my",
    DEMO_QUOTA: "/demo/quota",
    DEMO_BY_ID: (id: string) => `/demo/${id}`,
    DEMO_ACCEPT: (id: string) => `/demo/${id}/accept`,
    DEMO_REJECT: (id: string) => `/demo/${id}/reject`,
    DEMO_CANCEL: (id: string) => `/demo/${id}/cancel`,
    DEMO_COMPLETE: (id: string) => `/demo/${id}/complete`,
    DEMO_DECISION: (id: string) => `/demo/${id}/decision`,
    DEMO_CONFIRM_PAYMENT: (id: string) => `/demo/${id}/confirm-payment`,

    // Ratings
    SUBMIT_RATING: "/ratings/submit",
    TEACHER_RATINGS: (id: string) => `/ratings/teacher/${id}`,
  },
  TIMEOUT: 30000,
  DEBOUNCE_DELAY: 300,
};

export const RAZORPAY_CONFIG = {
  // KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_sRnePp5pMW12z2",
  KEY_ID: "rzp_test_TTE50AhLP9FwVL",
  ENABLED: true,
};
