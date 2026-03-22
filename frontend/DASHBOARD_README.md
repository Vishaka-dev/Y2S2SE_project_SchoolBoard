# Dashboard Implementation Guide

## 🎉 New Features

A complete production-grade dashboard has been implemented with:

✅ **Dynamic User Data** - No more hardcoded "John Doe"  
✅ **3-Column Responsive Layout** - Professional LinkedIn-inspired design  
✅ **Role-Based Widgets** - Different content for Students, Teachers, and Institutes  
✅ **Full Navigation System** - Home, Profile, Connections, Messages, Notifications  
✅ **Authentication Context** - Global user state management  
✅ **Real-time Profile Integration** - Data pulled from `/api/account/me`

---

## 📁 New File Structure

```
frontend/src/
├── context/
│   └── AuthContext.jsx           # Global authentication and user state
├── components/
│   ├── layout/
│   │   └── DashboardLayout.jsx   # Main 3-column layout wrapper
│   ├── sidebar/
│   │   ├── Sidebar.jsx           # Left navigation with mini profile
│   │   └── RightSidebar.jsx      # Stats, suggestions, events
│   ├── navbar/
│   │   └── TopNavbar.jsx         # Top bar with search and profile dropdown
│   └── widgets/
│       └── RoleBasedWidget.jsx   # Dynamic widgets per role
├── pages/
│   ├── Home.jsx                  # Feed with posts and create post
│   ├── Profile.jsx               # Dynamic user profile page
│   ├── Connections.jsx           # Connections management
│   ├── Messages.jsx              # Messaging interface
│   └── Notifications.jsx         # Notifications center
├── services/
│   └── accountService.js         # Already has getAccountDetails()
└── App.jsx                       # Updated with new routes
```

---

## 🔥 Key Components

### **1. AuthContext** (`context/AuthContext.jsx`)

Global state management for user data:

```jsx
const {
  user,
  loading,
  error,
  refreshUser,
  logout,
  getUserInitials,
  getRoleDisplay,
} = useAuth();
```

**Features:**

- Auto-fetches `/api/account/me` on mount
- Stores user data globally
- Provides helper functions (getUserInitials, getRoleDisplay)
- Handles 401 errors and redirects to login
- Loading and error states

### **2. DashboardLayout** (`components/layout/DashboardLayout.jsx`)

Main layout wrapper with 3-column responsive design:

```
+----------------+--------------------+------------------+
|                |                    |                  |
|  Left Sidebar  |   Center Content   |  Right Sidebar   |
|   (260px)      |   (Flex-grow)      |   (320px)        |
|                |                    |                  |
+----------------+--------------------+------------------+
```

**Features:**

- Sticky top navbar
- Fixed sidebars with scrollable content
- Responsive (collapses on mobile/tablet)
- Loading spinner while fetching user
- Error state handling

### **3. Sidebar** (`components/sidebar/Sidebar.jsx`)

Left navigation with:

- Logo at top
- Navigation links (Home, Profile, Connections, Messages, Notifications, Settings)
- Active route highlighting
- Mini profile summary at bottom (dynamic user data)
- Mobile hamburger menu

### **4. TopNavbar** (`components/navbar/TopNavbar.jsx`)

Top navigation bar with:

- Search bar
- Notification bell (with unread indicator)
- Message icon
- Profile dropdown with:
  - Dynamic user name and email
  - View Profile
  - Account Settings
  - Sign Out
- **No hardcoded data!**

### **5. RightSidebar** (`components/sidebar/RightSidebar.jsx`)

Right sidebar featuring:

- Quick stats (connections, posts, profile views)
- Suggested connections
- Upcoming events
- Footer links

### **6. RoleBasedWidget** (`components/widgets/RoleBasedWidget.jsx`)

Dynamic widgets based on user role:

**STUDENT:**

- Active courses
- Achievements
- Upcoming exams
- Average score
- Recommended teachers

**TEACHER:**

- Active courses
- Total students
- Classes this week
- Pending assignments
- Student requests

**INSTITUTE:**

- Total staff
- Student count
- Programs offered
- Enrollment growth
- Recent announcements

### **7. Home Page** (`pages/Home.jsx`)

Main feed with:

- Role-based widget at top
- Create post card (with user's profile picture)
- Feed posts with engagement buttons
- Clean card design

### **8. Profile Page** (`pages/Profile.jsx`)

Dynamic profile page with:

- Cover banner
- Profile picture (or initials if no picture)
- Name and role badges
- Education level (for students)
- About section
- Education/Skills/Activity sections
- Connections grid
- Quick actions
- Edit Profile button

---

## 🎨 Design System

### Colors

- **Primary Blue:** `bg-blue-600` / `text-blue-600`
- **Gradient:** `from-blue-600 to-indigo-600`
- **Background:** `bg-gray-50`
- **Cards:** `bg-white`

### Spacing & Borders

- **Border Radius:** `rounded-xl` (12px)
- **Shadow:** `shadow-sm`, `shadow-lg`
- **Padding:** `p-6` (24px) for cards

### Typography

- **Headings:** `font-bold text-gray-900`
- **Body:** `text-gray-700`
- **Secondary:** `text-gray-600`
- **Muted:** `text-gray-500`

### Role Badges

```jsx
STUDENT: bg-blue-100 text-blue-700
TEACHER: bg-purple-100 text-purple-700
INSTITUTE: bg-green-100 text-green-700
```

---

## 🔌 API Integration

The dashboard connects to your backend via:

### **GET /api/account/me**

Returns authenticated user:

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "STUDENT",
  "fullName": "Jane Smith",
  "profilePicture": "https://...",
  "bio": "...",
  "educationLevel": "UNDERGRADUATE",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Integration:**

- Called automatically when dashboard loads
- Stored in AuthContext
- Used throughout all components
- Retry on failure

---

## 📱 Responsive Behavior

### Desktop (>1280px)

✅ 3-column layout  
✅ Left sidebar visible  
✅ Right sidebar visible

### Tablet (768px - 1280px)

✅ 2-column layout  
✅ Left sidebar visible  
❌ Right sidebar hidden

### Mobile (<768px)

✅ 1-column layout  
✅ Hamburger menu for sidebar  
❌ Right sidebar hidden  
✅ Sticky top navbar

---

## 🚀 How to Use

### 1. Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Login

Navigate to `http://localhost:5173/login` and sign in.

### 4. View Dashboard

You'll be automatically redirected to `/dashboard` where you'll see:

- Your dynamic profile data
- Role-based widgets
- Feed with posts
- All navigation links working

---

## 🔧 Extending the Dashboard

### Add a New Page

1. **Create the page component:**

```jsx
// src/pages/NewPage.jsx
const NewPage = () => {
  const { user } = useAuth();
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h1>New Page for {user.fullName}</h1>
    </div>
  );
};
export default NewPage;
```

2. **Add route in App.jsx:**

```jsx
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<NewPage />} />
</Route>
```

3. **Add navigation link in Sidebar.jsx:**

```jsx
const navItems = [
  // ... existing items
  { name: "New Page", icon: Star, path: "/new-page" },
];
```

### Fetch Additional User Data

```jsx
// In any component
const { user, refreshUser } = useAuth();

const updateProfile = async () => {
  await accountService.updateProfile(data);
  await refreshUser(); // Refresh user data
};
```

### Add API Endpoints

```javascript
// src/services/accountService.js
export const getConnections = async () => {
  const response = await apiClient.get("/account/connections");
  return response.data;
};
```

---

## ✅ Testing Checklist

- [ ] User data loads correctly (no "John Doe")
- [ ] Role badge displays correctly (STUDENT/TEACHER/INSTITUTE)
- [ ] Profile picture or initials appear
- [ ] Navigation links work
- [ ] Profile dropdown shows correct user email
- [ ] Role-based widget shows appropriate content
- [ ] Logout works and redirects to login
- [ ] 401 errors redirect to login
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading spinner appears while fetching user
- [ ] Error state displays if API fails

---

## 🐛 Troubleshooting

### "User data not loading"

- Check if backend is running on correct port
- Verify JWT token exists in localStorage
- Check browser console for CORS errors
- Ensure `/api/account/me` endpoint returns data

### "Blank profile picture"

- Profile picture is optional
- Initials are automatically generated as fallback
- To add profile picture, update via Edit Profile

### "Role badge not showing"

- Ensure backend returns `role` field
- Valid roles: `STUDENT`, `TEACHER`, `INSTITUTE`
- Check case sensitivity

### "401 Unauthorized"

- Token may have expired
- You'll be automatically redirected to login
- Re-authenticate to get a new token

---

## 🎯 Next Steps

Future enhancements you can add:

1. **Real Posts API** - Connect feed to backend posts endpoint
2. **Connections API** - Fetch actual connections data
3. **Messaging Backend** - WebSocket for real-time chat
4. **Notifications API** - Real notification system
5. **Search Functionality** - Implement global search
6. **Profile Picture Upload** - Add image upload feature
7. **Dark Mode** - Theme toggle
8. **Internationalization** - Multi-language support

---

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify backend API is responding correctly
3. Ensure all dependencies are installed (`npm install`)
4. Check that routes in App.jsx match your navigation

---

**Built with ❤️ using React, Tailwind CSS, and modern best practices**
