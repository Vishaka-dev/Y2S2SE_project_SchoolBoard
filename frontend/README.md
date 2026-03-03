# SchoolBoard Frontend

React frontend application for the SchoolBoard platform with JWT authentication and Google OAuth2 integration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application will start at `http://localhost:5173` (or another available port).

## 🔧 Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/              # API client configuration
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # Business logic services
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── docs/                # Detailed documentation
│   ├── FRONTEND_README.md
│   ├── SETUP_COMPLETE.md
│   └── TESTING_GUIDE.md
└── package.json
```

## ✨ Features

- **JWT Authentication** - Email/password login with token management
- **Google OAuth2** - One-click social login
- **Protected Routes** - Route guards for authenticated pages
- **Responsive Design** - Mobile-friendly UI with Tailwind CSS
- **Error Handling** - User-friendly error messages

## 📚 Documentation

- **[Complete Setup Guide](docs/SETUP_COMPLETE.md)** - Detailed setup instructions
- **[Testing Guide](docs/TESTING_GUIDE.md)** - How to test authentication
- **[Technical Documentation](docs/FRONTEND_README.md)** - Full technical details

## 🔑 Authentication

### Email/Password Login
1. Enter credentials on login page
2. Click "Sign in to Account"
3. Redirect to dashboard on success

### Google OAuth2
1. Click "Google" button
2. Complete Google authentication
3. Automatic login and redirect

## 🛠️ Tech Stack

- React 19.2
- Vite 7.3
- React Router DOM
- Axios
- Tailwind CSS

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔗 Backend Integration

This frontend requires the SchoolBoard backend running on `http://localhost:8080`.

See [backend README](../backend/README.md) for backend setup instructions.

## 📄 License

Part of the Y2S2 SchoolBoard project.
