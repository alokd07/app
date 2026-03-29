// Centralized API configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.bookmysession.in',
  ENDPOINTS: {
    // Auth
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    
    // Teachers
    TEACHERS: '/teachers',
    TEACHER_DETAIL: (id: string) => `/teachers/${id}`,
    
    // Bookings
    BOOKINGS: '/bookings',
    MY_BOOKINGS: '/bookings/my',
    BOOKING_DETAIL: (id: string) => `/bookings/${id}`,
    CANCEL_BOOKING: (id: string) => `/bookings/cancel/${id}`,
    
    // User
    USER_PROFILE: '/user/profile',
  },
  TIMEOUT: 30000,
  DEBOUNCE_DELAY: 300,
};

export const RAZORPAY_CONFIG = {
  // Test mode - will be configured later
  KEY_ID: 'rzp_test_placeholder',
  ENABLED: false, // Set to true when real keys are provided
};
