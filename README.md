# BookMySession - Student Mobile App

## Overview
BookMySession is a mobile application for students to find and book sessions with teachers. The app features a clean, modern UI with blue (#2563EB) and white theme, built with React Native and Expo.

## Features

### Authentication
- OTP-based login/signup via WhatsApp
- JWT token authentication with secure storage
- Auto-logout on token expiry

### Home Screen
- Search teachers by subject/class with debounced input (300ms)
- Paginated teacher listing with infinite scroll
- Teacher cards showing profile image, name, subjects, rating, and price
- Pull-to-refresh functionality

### Teacher Profile
- Detailed teacher information (bio, experience, subjects, classes)
- Rating and reviews display
- Pricing information
- WhatsApp contact button
- Book Session CTA

### Booking Flow (3-4 steps)
1. **Select Date & Time**: Calendar view with available slots
2. **Select Mode**: Online or Offline session
3. **Payment**: Advance payment (Razorpay - test mode)
4. **Confirmation**: Booking success screen

### My Bookings
- Tabbed interface (Upcoming, Completed, Cancelled)
- Booking cards with teacher info, date, time, status
- Click to view detailed booking information
- Cancel booking option for upcoming sessions

### Profile
- View and edit personal information
- Logout functionality

### Additional Features
- WhatsApp deep linking for teacher contact
- Loading, error, and empty states throughout the app
- Bottom tab navigation (Home, Bookings, Profile)
- Splash screen and onboarding flow

## Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **State Management**: Zustand
- **HTTP Client**: Axios with JWT interceptors
- **Secure Storage**: Expo SecureStore
- **UI Components**: React Native core components
- **Icons**: Ionicons
- **Calendar**: react-native-calendars
- **TypeScript**: Full type safety

### Backend Integration
- **Base URL**: https://api.bookmysession.in
- **Authentication**: JWT Bearer token
- **Storage**: SecureStore (not localStorage)

## Project Structure

```
frontend/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation
│   │   ├── home.tsx         # Teacher listing
│   │   ├── bookings.tsx     # My bookings
│   │   └── profile.tsx      # User profile
│   ├── auth/                # Authentication screens
│   │   ├── login.tsx        # Phone input
│   │   └── verify-otp.tsx   # OTP verification
│   ├── teacher/[id].tsx     # Teacher detail
│   ├── booking/[id].tsx     # Booking detail
│   ├── book-session.tsx     # Booking flow
│   ├── payment.tsx          # Payment screen
│   ├── booking-confirmation.tsx
│   ├── onboarding.tsx       # Onboarding slides
│   ├── index.tsx            # Splash screen
│   └── _layout.tsx          # Root layout
├── src/
│   ├── config/
│   │   └── api.ts           # API configuration
│   ├── services/
│   │   ├── api.ts           # Axios client with interceptors
│   │   └── auth.ts          # Token management
│   ├── store/
│   │   └── authStore.ts     # Auth state management
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── utils/
│   │   └── helpers.ts       # Utility functions
│   └── theme/
│       └── colors.ts        # Color palette
└── app.json                 # Expo configuration
```

## API Endpoints

### Authentication
- `POST /auth/send-otp` - Send OTP to phone
- `POST /auth/verify-otp` - Verify OTP and get JWT token

### Teachers
- `GET /teachers` - List teachers (params: subject, class, page, limit)
- `GET /teachers/:id` - Get teacher details with availability

### Bookings
- `POST /bookings` - Create new booking
- `GET /bookings/my` - Get user's bookings (params: status)
- `GET /bookings/:id` - Get booking details
- `PATCH /bookings/cancel/:id` - Cancel booking

### User
- `GET /user/profile` - Get user profile
- `PATCH /user/profile` - Update user profile

## Configuration

All API configurations are centralized in `/src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://api.bookmysession.in',
  TIMEOUT: 30000,
  DEBOUNCE_DELAY: 300,
};
```

## Key Features Implementation

### JWT Authentication
- JWT tokens stored in Expo SecureStore (encrypted)
- Automatic token attachment to all API requests via Axios interceptor
- Auto-logout on 401 response
- User data cached locally

### Search with Debounce
- 300ms debounce on search input
- Prevents excessive API calls
- Real-time search results

### Pagination
- Infinite scroll implementation
- Page-based pagination (page + limit)
- Loading states for pagination

### State Management
- Zustand for global auth state
- Local component state for UI
- Persistent storage with SecureStore

### Error Handling
- Try-catch blocks on all API calls
- User-friendly error messages
- Loading and error states throughout

### Mobile UX
- Card-based UI design
- Touch-friendly buttons (minimum 44pt)
- Pull-to-refresh
- Bottom tab navigation
- Smooth transitions
- Loading indicators
- Empty state messages

## Running the App

### Development
```bash
cd frontend
yarn install
yarn start
```

### Testing
- Scan QR code with Expo Go app
- Or use web preview
- Or use iOS/Android simulator

## Payment Integration

### Razorpay (Test Mode)
- Currently in test/mock mode
- Shows proper payment UI flow
- Simulates payment success
- Ready for real Razorpay integration when keys are provided

### To Enable Real Payments:
1. Add Razorpay keys to `/src/config/api.ts`
2. Set `RAZORPAY_CONFIG.ENABLED = true`
3. Implement payment handler in payment screen

## WhatsApp Integration

- Deep linking using `whatsapp://send` protocol
- Pre-filled message with teacher details
- Fallback for devices without WhatsApp

## Color Scheme

- **Primary**: #2563EB (Blue)
- **Primary Dark**: #1E40AF
- **Primary Light**: #3B82F6
- **White**: #FFFFFF
- **Success**: #10B981 (Green)
- **Error**: #EF4444 (Red)
- **Warning**: #F59E0B (Orange)
- **Info**: #3B82F6 (Blue)
- **Gray Scale**: 50-900

## Notes

- Backend is already built and running at https://api.bookmysession.in
- All teacher data, availability, and bookings are managed by backend
- App is frontend-only, consumes REST APIs
- Designed for mobile-first experience
- Android-first with iOS support
- No backend modifications needed

## Future Enhancements

- Push notifications for booking updates
- In-app chat with teachers
- Session recording/notes
- Multiple payment methods
- Teacher favorites/bookmarks
- Referral system
- Review and rating system
