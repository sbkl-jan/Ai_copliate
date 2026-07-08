import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import api from '../services/api';
import { connectSocket } from '../services/socket';
import { Bot, KeyRound, Mail, Sparkles, UserPlus } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, refreshToken, user } = response.data.data;
        
        dispatch(setCredentials({ accessToken, refreshToken, user }));
        connectSocket(accessToken);
        navigate('/');
      } else {
        await api.post('/auth/register', {
          email,
          password,
          firstName,
          lastName,
          businessName,
        });
        // On registration success, toggle back to login and populate
        setIsLogin(true);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication action failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Simulate Firebase OAuth Token verification
      const mockFirebaseToken = 'mock-google-firebase-token';
      const response = await api.post('/auth/firebase-sso', {
        firebaseToken: mockFirebaseToken,
        businessName: businessName || `${firstName || 'OAuth'}'s Operations`,
      });

      const { accessToken, refreshToken, user } = response.data.data;
      dispatch(setCredentials({ accessToken, refreshToken, user }));
      connectSocket(accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'SSO Authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Decorative ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500 rounded-full filter blur-[150px] opacity-10 animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500 rounded-full filter blur-[120px] opacity-10" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl border border-white/10 z-10 transition-all duration-300">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="p-3 bg-brand-500 rounded-2xl text-white shadow-lg shadow-brand-500/20">
            <Bot size={32} className="animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold font-sans tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-slate-400 text-sm text-center">
            {isLogin 
              ? 'Sign in to access your autonomous digital employee' 
              : 'Launch your multi-agent enterprise copilot workspace'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
              <input
                type="text"
                placeholder="Business/Company Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              />
            </>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="relative">
            <KeyRound size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <Sparkles size={16} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={16} /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-full border-t border-white/5" />
            <span className="relative px-3 bg-dark-600 text-xs text-slate-500 uppercase font-bold tracking-wider">
              Or Connect With
            </span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-white/10 hover:border-brand-500/30 hover:bg-brand-500/5 text-slate-300 hover:text-white font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google Identity Provider
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-400 hover:text-brand-300 text-sm font-semibold transition-all duration-150"
          >
            {isLogin 
              ? 'Need a business account? Create Workspace' 
              : 'Already have a workspace? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
