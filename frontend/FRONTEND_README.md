# EduConnect Frontend

Production-grade React frontend for the SchoolBoard application with JWT authentication and Google OAuth2 integration.

## 🚀 Tech Stack

- **React 19.2** - UI library
- **Vite 7.3** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (ES6+)** - Programming language

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── apiClient.js          # Axios instance with interceptors
│   ├── components/
│   │   └── ProtectedRoute.jsx    # Route guard component
│   ├── pages/
│   │   ├── Login.jsx             # Login page with email/password and OAuth2
│   │   ├── Dashboard.jsx         # Protected dashboard page
│   │   └── OAuth2Redirect.jsx    # OAuth2 callback handler
│   ├── services/
│   │   └── authService.js        # Authentication service layer
│   ├── App.jsx                   # Main app component with routing
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Global styles with Tailwind directives
├── .env                          # Environment variables (not committed)
├── .env.example                  # Environment variables template
├── tailwind.config.js            # Tailwind CSS configuration
└── vite.config.js                # Vite configuration
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 20.17+ and npm
- Running backend server on `http://localhost:8080`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   # Copy the example file
   copy .env.example .env
   
   # Update .env with your backend URL (default is http://localhost:8080)
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:3000` (or the port shown in terminal)

## 🔑 Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 🎯 Features

### Authentication
- **Email/Password Login** - Traditional JWT authentication
- **Google OAuth2 Login** - One-click social authentication
- **Token Management** - JWT tokens stored securely in localStorage
- **Protected Routes** - Route guards for authenticated pages
- **Auto Logout** - Automatic logout on 401 responses

### UI/UX
- **Responsive Design** - Works on desktop and mobile
- **Loading States** - Visual feedback during API calls
- **Error Handling** - User-friendly error messages
- **Modern Design** - Clean, professional interface with Tailwind CSS
- **Accessibility** - Proper labels and ARIA attributes

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Security Features

1. **Token Storage**: JWT tokens stored in localStorage
2. **Request Interceptors**: Automatic token attachment to requests
3. **Response Interceptors**: Auto-logout on authentication failures
4. **Protected Routes**: Route guards prevent unauthorized access
5. **Environment Variables**: Sensitive data not hardcoded

## 🌐 API Integration

The frontend communicates with the backend through the following endpoints:

- `POST /api/auth/login` - Email/password authentication
- `POST /api/auth/register` - User registration
- `GET /oauth2/authorization/google` - Initiate Google OAuth2 flow
- `GET /oauth2/redirect?token=...` - OAuth2 callback (handled by backend)

### API Client Configuration

The `apiClient.js` file provides:
- Automatic JWT token attachment
- Base URL configuration
- Request/Response interceptors
- Error handling

Example usage:
```javascript
import apiClient from '../api/apiClient';

// Make authenticated request
const response = await apiClient.get('/api/protected-endpoint');
```

## 🎨 Styling

This project uses Tailwind CSS for styling. Key features:

- **Utility-first approach** - No separate CSS files needed
- **Responsive design** - Mobile-first breakpoints
- **Custom configuration** - Extend in `tailwind.config.js`
- **Production optimization** - Unused CSS purged in build

## 📱 Pages & Routes

| Route | Component | Description | Protected |
|-------|-----------|-------------|-----------|
| `/login` | Login | Authentication page | No |
| `/dashboard` | Dashboard | Main application page | Yes |
| `/oauth2/redirect` | OAuth2Redirect | OAuth2 callback handler | No |
| `/` | - | Redirects to login | No |

## 🧪 Testing Authentication

### Test Email/Password Login

1. Start the backend server
2. Start the frontend: `npm run dev`
3. Navigate to `http://localhost:3000`
4. Enter your credentials:
   - Email: `test@example.com`
   - Password: `password123`
5. Click "Sign in to Account"

### Test Google OAuth2 Login

1. Ensure Google OAuth2 is configured in the backend
2. Click "Google" button on login page
3. Complete Google authentication flow
4. You'll be redirected back with a JWT token

## 🐛 Troubleshooting

### API Connection Issues
- Verify backend is running on `http://localhost:8080`
- Check `.env` has correct `VITE_API_BASE_URL`
- Check browser console for CORS errors

### OAuth2 Not Working
- Verify Google Client ID in backend configuration
- Ensure redirect URI is registered in Google Console
- Check backend OAuth2 configuration

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
- Check Node.js version: `node --version` (should be 20+)

## 🔄 Development Workflow

1. **Start Development Server**: `npm run dev`
2. **Make Changes**: Edit files in `src/`
3. **Hot Reload**: Changes automatically reflect in browser
4. **Build for Production**: `npm run build`
5. **Test Production Build**: `npm run preview`

## 📦 Production Build

To create a production build:

```bash
npm run build
```

This creates optimized files in the `dist/` directory:
- Minified JavaScript
- Optimized CSS (Tailwind purged)
- Static assets

Deploy the `dist/` folder to your hosting provider.

## 🤝 Integration with Backend

The frontend expects the backend to:

1. **Accept credentials** at `POST /api/auth/login`
2. **Return JWT token** in response: `{ "token": "..." }`
3. **Handle OAuth2** at `/oauth2/authorization/google`
4. **Redirect with token** to `/oauth2/redirect?token=...`
5. **Accept Bearer tokens** in `Authorization` header

## 📄 License

This project is part of the Y2S2 SchoolBoard application.

## 👥 Support

For issues or questions, contact the development team.
