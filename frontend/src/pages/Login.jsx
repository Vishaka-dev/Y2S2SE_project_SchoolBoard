import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import logo from '../../logos/logo.webp';
import loginImage from '../../photos/login.jpg';

const Login = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      authService.setToken(response.token);

      // Refresh user data in AuthContext
      await refreshUser();

      // Navigate to feed
      navigate('/feed');
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col lg:flex-row bg-white">
      {/* Left Side - Motto and Pic */}
      <div className="hidden lg:flex lg:w-[55%] h-full flex-col justify-center items-center p-8 xl:p-12 bg-blue-50/50 border-r border-gray-100 animate-fadeIn relative">
        {/* Floating Back to Home */}
        <div className="absolute top-8 left-10">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition group">
            <svg className="w-5 h-5 mr-1.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="max-w-2xl w-full flex flex-col items-center">
          <div className="flex items-center space-x-3 mb-6 xl:mb-8 opacity-0 animate-slideInLeft" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <img src={logo} alt="LearnLink Logo" className="h-10 xl:h-12 w-auto" />
            <span className="text-4xl xl:text-5xl font-bold tracking-tight">
              <span className="text-gray-900">Learn</span>
              <span className="text-blue-600">Link</span>
            </span>
          </div>

          <div className="text-center space-y-6 xl:space-y-8">
            <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 leading-tight opacity-0 animate-slideInLeft" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              Empowering Sri Lanka's <br />
              <span className="text-blue-600">Future</span>
            </h2>

            <div className="relative inline-block opacity-0 animate-slideInUp" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white p-2 transform rotate-1 hover:rotate-0 transition-transform duration-500 max-w-sm xl:max-w-md mx-auto">
                <img
                  src="/images/login/3.webp"
                  alt="Students learning together"
                  className="w-full h-56 xl:h-64 rounded-2xl object-cover"
                />
              </div>
              {/* Decorative Glow */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
            </div>

            <p className="max-w-sm mx-auto text-lg text-gray-600 leading-relaxed font-medium opacity-0 animate-slideInLeft" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
              Connect and share with the students in your community on LearnLink.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Card */}
      <div className="w-full lg:w-[45%] h-full flex items-center justify-center p-6 bg-gray-50/30">
        <div className="w-full max-w-[400px] animate-fadeIn">
          {/* Mobile Only Header */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <img src={logo} alt="LearnLink Logo" className="h-10 w-auto mb-2" />
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-gray-900">Learn</span>
              <span className="text-blue-600">Link</span>
            </h1>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] p-8 xl:p-10 border border-gray-100/50">
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Login</h2>
              <p className="mt-1.5 text-base text-gray-500">Welcome back! Please enter your details.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 focus:bg-white transition-all duration-200"
                    placeholder="student@example.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-11 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 focus:bg-white transition-all duration-200"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-12.542 0C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-6 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all duration-300 shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </form>

            <div className="relative flex py-6 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-[9px] uppercase tracking-[0.2em] font-bold">Or</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex justify-center items-center py-3 px-6 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5 mr-3" />
              Sign in with Google
            </button>

            <p className="mt-6 text-center text-gray-500 font-medium text-xs">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                Create Account
              </Link>
            </p>

            <div className="mt-6 pt-5 border-t border-gray-100 flex justify-center space-x-4">
              <a href="#" className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Privacy</a>
              <a href="#" className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Help</a>
              <a href="#" className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
