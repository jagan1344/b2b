import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Lock, Mail, ChevronRight, User, ArrowLeft } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login, registerInit, registerVerify } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerInit(form.name, form.email, form.password);
      setMode('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerVerify(form.email, otp);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
      <div className="absolute rounded-full animate-pulse" style={{ top: '20%', left: '20%', width: '384px', height: '384px', background: 'rgba(79,70,229,0.2)', filter: 'blur(100px)' }} />
      <div className="absolute rounded-full animate-pulse" style={{ bottom: '20%', right: '20%', width: '384px', height: '384px', background: 'rgba(236,72,153,0.2)', filter: 'blur(100px)', animationDelay: '2s' }} />

      <div className="w-full max-w-md p-6 z-10">
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6" style={{ background: 'linear-gradient(135deg, #4f46e5, #ec4899)', boxShadow: '0 10px 25px rgba(79,70,229,0.2)' }}>
            <span className="text-2xl font-bold text-white tracking-wider">SP</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-gray-400">
            {mode === 'login' ? 'Sign in to your dashboard' : mode === 'register' ? 'Register as a teacher or principal' : `Enter the OTP sent to ${form.email}`}
          </p>
        </div>

        <Card className="backdrop-blur-xl animate-fade-in" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5 flex flex-col">
              <div className="relative">
                <Mail className="absolute left-3 top-[38px] -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input label="Email" type="email" placeholder="teacher@spms.edu" className="text-white pl-10 py-3" containerClassName="mb-0" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: '#374151' }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-[38px] -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input label="Password" type="password" placeholder="••••••••" className="text-white pl-10 py-3" containerClassName="mb-0" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: '#374151' }} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <Button type="submit" className="w-full py-3 border-none group" isLoading={loading} style={{ background: 'linear-gradient(to right, #4f46e5, #ec4899)' }}>
                {!loading && <>Sign In <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
              <p className="text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <button type="button" className="text-indigo-400 hover:text-indigo-300 font-medium" onClick={() => { setMode('register'); setError(''); }}>Register</button>
              </p>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5 flex flex-col">
              <div className="relative">
                <User className="absolute left-3 top-[38px] -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input label="Full Name" placeholder="Dr. Jane Doe" className="text-white pl-10 py-3" containerClassName="mb-0" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: '#374151' }} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-[38px] -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input label="Email" type="email" placeholder="teacher@spms.edu" className="text-white pl-10 py-3" containerClassName="mb-0" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: '#374151' }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-[38px] -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input label="Password" type="password" placeholder="Min 6 characters" className="text-white pl-10 py-3" containerClassName="mb-0" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: '#374151' }} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <Button type="submit" className="w-full py-3 border-none group" isLoading={loading} style={{ background: 'linear-gradient(to right, #4f46e5, #ec4899)' }}>
                {!loading && <>Send OTP <ChevronRight className="w-4 h-4 ml-2" /></>}
              </Button>
              <p className="text-center text-sm text-gray-400">
                <button type="button" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 mx-auto" onClick={() => { setMode('login'); setError(''); }}>
                  <ArrowLeft className="w-4 h-4" /> Back to login
                </button>
              </p>
            </form>
          )}

          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 flex flex-col">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(79,70,229,0.2)' }}>
                  <Mail className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-gray-300 text-sm">We sent a 6-digit code to <span className="text-white font-medium">{form.email}</span></p>
              </div>
              <Input placeholder="Enter 6-digit OTP" className="text-white text-center text-2xl tracking-widest py-4 font-bold" containerClassName="mb-0" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: '#374151', letterSpacing: '8px' }} value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} />
              <Button type="submit" className="w-full py-3 border-none" isLoading={loading} style={{ background: 'linear-gradient(to right, #4f46e5, #ec4899)' }}>
                {!loading && 'Verify & Continue'}
              </Button>
              <p className="text-center text-sm text-gray-400">
                <button type="button" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 mx-auto" onClick={() => { setMode('register'); setError(''); }}>
                  <ArrowLeft className="w-4 h-4" /> Change email
                </button>
              </p>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-gray-500 mt-8">© {new Date().getFullYear()} SPMS Platform. Teacher & Principal Portal.</p>
      </div>
    </div>
  );
};
