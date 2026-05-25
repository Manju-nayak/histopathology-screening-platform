import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Mail, Lock, User, UserPlus, LogIn } from 'lucide-react';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('doctor');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } else {
      const result = await register(fullName, email, password, role);
      if (result.success) {
        setSuccess('Clinician profile created successfully! Please sign in with your credentials.');
        setIsLogin(true);
        setPassword('');
      } else {
        setError(result.error);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-[#05070c] via-[#090e1a] to-[#121829] relative overflow-hidden font-sans">
      {/* Decorative Blur Spheres for Glassmorphism */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-medical-primary opacity-[0.04] blur-[110px] -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-medical-accent opacity-[0.04] blur-[110px] -bottom-40 -right-40 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-medical-primary/20 opacity-[0.05] blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Main Glass Layout Container */}
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-2xl overflow-hidden glass-panel shadow-2xl border border-white/5 hover:border-medical-primary/10 transition-all duration-500">
        
        {/* Left Side: Illustrative Platform Overview */}
        <div className="p-12 bg-gradient-to-br from-[#064789]/40 via-[#4FB3FF]/10 to-medical-dark flex flex-col justify-between border-r border-medical-border relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-medical-primary/20 flex items-center justify-center border border-medical-primary/30">
              <Activity className="w-5 h-5 text-medical-primaryLight animate-pulse" />
            </div>
            <span className="font-display font-bold text-lg tracking-wide uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              TumorTrace
            </span>
          </div>

          <div className="my-12">
            <h1 className="font-display font-extrabold text-3xl leading-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
              AI-Assisted Histopathology Cancer Screening
            </h1>
            <p className="text-slate-400 leading-relaxed font-light text-sm mb-6">
              Empowering clinical pathologists with ResNet50 neural network classification support and region-specific Grad-CAM thermal explainability maps.
            </p>
            
            <div className="flex flex-col gap-3 text-xs text-slate-300 font-light bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-medical-success" />
                Dual classification: Benign & Malignant slides
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-medical-success" />
                Region-of-interest Grad-CAM activations overlay
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-medical-success" />
                Complies with medical diagnostic disclaimers
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-light flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-medical-primaryLight" />
            Guarded by standard JWT Authentication
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="font-display font-bold text-2xl text-white">
              {isLogin ? 'Sign In Workstation' : 'Register Clinician'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {isLogin ? 'Enter clinical credentials to unlock the dashboard.' : 'Configure profile to join the screening platform.'}
            </p>
          </div>

          {/* Toast Notifications */}
          {error && (
            <div className="p-3 bg-medical-danger/10 border border-medical-danger/20 rounded-lg text-xs text-red-400 mb-6 animate-pulse">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-medical-success/10 border border-medical-success/20 rounded-lg text-xs text-emerald-400 mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Full Name (Registration only) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full bg-[#111625] border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-medical-primary transition-all font-light"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-xs">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@cancerplatform.com"
                  className="w-full bg-[#111625] border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-medical-primary transition-all font-light"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-xs">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111625] border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-medical-primary transition-all font-light"
                />
              </div>
            </div>

            {/* Role (Registration only) */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs">Authorized Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`py-2 px-4 rounded-xl border text-xs font-medium transition-all ${
                      role === 'doctor'
                        ? 'bg-medical-primary/20 border-medical-primary text-white shadow-glow-primary'
                        : 'bg-[#111625] border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    Pathologist / Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 px-4 rounded-xl border text-xs font-medium transition-all ${
                      role === 'admin'
                        ? 'bg-medical-primary/20 border-medical-primary text-white shadow-glow-primary'
                        : 'bg-[#111625] border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 bg-gradient-to-r from-medical-primary to-medical-accent hover:opacity-90 active:scale-95 text-white font-medium text-sm py-3 px-6 rounded-xl shadow-glow-primary flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Workstation
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register Profile
                </>
              )}
            </button>
          </form>

          {/* Form Toggle Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-xs text-slate-400 hover:text-medical-primaryLight transition-all underline decoration-dotted underline-offset-4 cursor-pointer"
            >
              {isLogin
                ? "Don't have an account? Request clinician registration"
                : "Already registered? Go back to clinical sign in"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
