import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Lock, Mail, ChevronRight, User, ArrowLeft } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login, registerDirect } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

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
      await registerDirect(form.name, form.email, form.password);
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
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-400">
            {mode === 'login' ? 'Sign in to your dashboard' : 'Register as a teacher or principal'}
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
                {!loading && <>Register & Continue <ChevronRight className="w-4 h-4 ml-2" /></>}
              </Button>
              <p className="text-center text-sm text-gray-400">
                <button type="button" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 mx-auto" onClick={() => { setMode('login'); setError(''); }}>
                  <ArrowLeft className="w-4 h-4" /> Back to login
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
