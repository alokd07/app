# LearnCraft UI/UX Redesign Specification

## Overview
Complete redesign to match the LearnCraft education platform aesthetic with teal/green theme.

## Color Scheme Change
```
OLD (Navy/Gold):
- Primary: #E8A838 (Gold)
- Secondary: #0D1B2A (Navy)

NEW (Teal/Green):
- Primary: #5A9B8E (Teal)
- Secondary: #FFFFFF (White)
- Background: #F8F9FA (Light gray)
```

## Screen Redesigns Needed

### 1. Onboarding Screen ✅ (Current design matches)
- Full-screen teacher image
- White card at bottom
- "Bringing Quality Learning to the Digital Generation"
- Skip/Next buttons
- Keep current implementation

### 2. Splash Screen (Needs Update)
CURRENT: Navy gradient with gold
NEW: Simpler teal theme or keep current (luxury feel)

### 3. Login Screen (Needs Major Update)
CURRENT: Navy gradient hero with card
NEW: 
- Large hero image with teacher (like onboarding)
- Shield icon at center
- "Welcome to LearnCraft" heading
- Multiple social login options:
  - Sign in with Apple
  - Sign in with Facebook
  - Sign in with Email  
  - Sign in with Google
- "Login with my account" link
- Clean white background

### 4. Home Screen (Needs Complete Rebuild)
CURRENT: Search bar + teacher grid
NEW:
- Profile header: Avatar + "Good morning 👋 [Name]"
- Daily Streak section: Yoga emojis for 7 days
- "Get reward" button (teal)
- Learning Progress card:
  - Total progress metrics
  - "Introduction to basic vocabulary"
  - Time spent (4h 10m)
  - Exams (35 Exam)
  - Learning time / Completed exam stats
  - Certificates & Courses count
  - Progress badges
- Interesting Promo section: Discount banners
- Bottom navigation: Home, Course, Group, More

### 5. Course Listing/Search (New Screen)
- Search bar at top
- Filter chips: All, Linguist, Sociology, Geography
- "Recommendation Course" heading
- Course cards in list:
  - Course image
  - "Linguist" badge (teal pill)
  - Course title
  - Duration (5 hour 20 min)
  - Modules (25 Modules)  
  - Instructor name
  - Price badge

### 6. Teacher Profile → Course Detail
CURRENT: Teacher-focused
NEW: Course-focused
- Large hero image with instructor
- Level badge (Linguist)
- Course title: "Crack the Korean Alphabet: Learn Hangeul the Easy Way"
- Rating + Students count (1,532 students)
- Course description
- Teacher card: Photo + name + verified badge
- Tabs: Modules, Discussion, Assignment
- Course Preview section
- "See more" link

### 7. Bookings → Your Course/Lessons
CURRENT: Booking list
NEW: Course content view
- Video player at top
- Course title: "Learning Hangeul Letters"
- Description
- "Assignment this chapter" section:
  - Task card with thumbnail
  - "Write and Read Basic Hangeul Letters"  
  - Duration + Modules count
- "Next Chapter" section:
  - Locked icon
  - "Reading and Writing Syllables"

### 8. Profile → Group Chat (New)
- Group name header: "Korean for Beginners"
- Chat interface:
  - Date separator: "Today, 12 me 2024"
  - Message bubbles (teal for teacher, white for students)
  - Text input at bottom
  - Keyboard integration

### 9. New: Group Info Screen
- "Korean for Beginners" title
- Teacher section:
  - Avatar + name (Patricia Sanders ✓)
  - "Korean language teacher"
- Description text
- "Team Member (25)" section
  - Avatar circles of members
- "Task Progress" section
  - Checkmarks for completed tasks
  - "Learn the Korean Alphabet (Hangul)"
  - "Reading and Writing Basic Syllables"

## Component Updates Needed

### Bottom Navigation (New)
```javascript
- Home (house icon)
- Course (book icon)
- Group (people icon)
- More (dots icon)
```

### Course Card Component
```
- Image (landscape, rounded)
- Badge: "Linguist" (teal background)
- Title (2 lines max)
- Duration icon + text
- Modules icon + text
- Price badge
```

### Progress Card Component
```
- Time period tabs (1W, 1M, 3M)
- Emoji indicators
- Metric rows with icons
- Progress badges at bottom
```

### Daily Streak Component
```
- 7 day grid (Mon-Sun)
- Emoji for each day (🧘 or empty)
- "Get reward" button (teal)
```

## Typography Updates
- Use Manrope throughout
- Headings: Bold (700)
- Body: Regular (400)
- Labels: SemiBold (600)

## UI Patterns

### Cards
- White background
- Subtle shadow
- 12-16px border radius
- 16px padding

### Buttons
- Primary: Teal background, white text
- Secondary: White background, teal border
- Rounded: 8-12px
- Height: 44-48px

### Badges/Pills
- Small rounded rectangles
- Light teal background
- Teal text
- Padding: 6px 12px

### Input Fields
- Light gray background (#F8F9FA)
- 1px border (#DEE2E6)
- Rounded 8px
- Height: 48px

## Navigation Flow Update
```
Splash → Onboarding → Login/Signup → Home
                                      ├─ Course List → Course Detail
                                      ├─ Your Course → Lesson View
                                      ├─ Group → Group Chat → Group Info
                                      └─ Profile
```

## Implementation Priority

### Phase 1: Core Screens (High Priority)
1. Update theme colors ✅
2. Redesign Login screen
3. Rebuild Home screen
4. Create Course List screen
5. Update bottom navigation

### Phase 2: Course Features
6. Course Detail screen
7. Lesson View screen
8. Assignment interface

### Phase 3: Social Features
9. Group Chat screen
10. Group Info screen

### Phase 4: Polish
11. Update remaining screens
12. Animations & transitions
13. Loading states
14. Empty states

## Key Design Principles
- Clean, minimal interface
- Card-based layouts
- Generous white space
- Teal as primary action color
- Focus on course content
- Social learning features
- Progress tracking prominent

## Files to Modify
- `/app/frontend/src/theme/colors.ts` ✅
- `/app/frontend/app/auth/login.tsx`
- `/app/frontend/app/(tabs)/home.tsx`
- `/app/frontend/app/(tabs)/bookings.tsx` → rename to courses
- `/app/frontend/app/(tabs)/profile.tsx`
- `/app/frontend/app/(tabs)/_layout.tsx` (update nav)
- Create new: `/app/frontend/app/course/[id].tsx`
- Create new: `/app/frontend/app/group/[id].tsx`

## Assets Needed
- Teacher/course images (use Unsplash)
- Icons (use Ionicons)
- Badge graphics (create with styled components)

## Testing Checklist
- [ ] Color scheme consistent
- [ ] All screens use new design
- [ ] Navigation flows work
- [ ] Course cards display properly
- [ ] Progress tracking accurate
- [ ] Chat interface functional
- [ ] Responsive on different screen sizes
- [ ] Animations smooth
- [ ] Loading states present
- [ ] Error handling works

---

**Status**: Colors updated ✅  
**Next**: Implement Login screen redesign
