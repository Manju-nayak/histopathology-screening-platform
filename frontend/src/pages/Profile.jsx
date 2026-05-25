import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  User, Mail, Shield, Calendar, ChevronLeft, 
  Activity, Users, FileText, Loader2, LogOut 
} from 'lucide-react';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalScans: 0,
    malignantCount: 0,
    benignCount: 0,
    malignantPercentage: 0,
    benignPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      setIsLoading(true);
      try {
        // Fetch fresh profile and lists of patients & scans (which are isolated by doctor in backend)
        const [profileRes, patientsRes, scansRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/patients'),
          api.get('/scans')
        ]);

        setProfile(profileRes.data);

        const patients = patientsRes.data;
        const scans = scansRes.data;

        const malignant = scans.filter(s => s.prediction.toLowerCase() === 'malignant').length;
        const benign = scans.filter(s => s.prediction.toLowerCase() === 'benign').length;
        const total = scans.length;

        setStats({
          totalPatients: patients.length,
          totalScans: total,
          malignantCount: malignant,
          benignCount: benign,
          malignantPercentage: total > 0 ? ((malignant / total) * 100).toFixed(1) : 0,
          benignPercentage: total > 0 ? ((benign / total) * 100).toFixed(1) : 0
        });
      } catch (err) {
        console.error("Failed to load profile details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-medical-primaryLight animate-spin" />
      </div>
    );
  }

  const formattedDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="min-h-screen bg-medical-dark text-slate-100 font-sans relative overflow-hidden flex flex-col">
      {/* Background Glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-medical-primary opacity-[0.03] blur-[100px] -top-52 -left-52 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-medical-accent opacity-[0.03] blur-[100px] -bottom-52 -right-52 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0e1322]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all font-medium cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Workstation
          </button>
          <span className="font-display font-bold text-base uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Clinician Profile
          </span>
          <button 
            onClick={logout}
            className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-medical-danger/30 hover:bg-medical-danger/10 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            title="Logout session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Profile Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Clinician Card (Left) */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
              {/* Top Accent Gradient Line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-medical-primary to-medical-accent" />
              
              {/* Avatar Ring */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-medical-primary to-medical-accent p-1.5 mb-4 shadow-glow-primary group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full bg-medical-panel flex items-center justify-center text-slate-200">
                  <User className="w-10 h-10 text-slate-300" />
                </div>
              </div>

              <h2 className="font-display font-bold text-lg text-white mb-1">
                {profile?.full_name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-medical-primary/20 text-medical-primaryLight border border-medical-primary/20 mb-6 tracking-wider">
                {profile?.role === 'admin' ? 'Administrator' : 'Pathologist'}
              </span>

              {/* Info Details List */}
              <div className="w-full flex flex-col gap-4 text-left text-xs border-t border-white/5 pt-6">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Email Address</p>
                    <p className="text-slate-300 font-light truncate">{profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <Shield className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Credentials</p>
                    <p className="text-slate-300 font-light capitalize">{profile?.role} Role Auth</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Registered Since</p>
                    <p className="text-slate-300 font-light">{formattedDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinician Caseload Stats (Right) */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Numeric Counters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-28 hover:border-medical-primary/20 transition-all">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Patients Registered</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-3xl text-white">{stats.totalPatients}</span>
                  <span className="text-[10px] text-slate-500">active profiles</span>
                </div>
                <Users className="w-10 h-10 text-medical-primary opacity-[0.06] absolute right-4 bottom-4" />
              </div>

              <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-28 hover:border-medical-accent/20 transition-all">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Inferences Performed</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-3xl text-white">{stats.totalScans}</span>
                  <span className="text-[10px] text-slate-500">biopsy logs</span>
                </div>
                <FileText className="w-10 h-10 text-medical-accent opacity-[0.06] absolute right-4 bottom-4" />
              </div>
            </div>

            {/* Diagnostic Distribution Analytics */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5">
              <h3 className="font-display font-bold text-sm text-white mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-medical-primaryLight" />
                AI Screening Diagnostic Distribution
              </h3>

              {stats.totalScans === 0 ? (
                <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-xl">
                  <span className="text-xs text-slate-500">No screenings run yet. Start screening in the workstation.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  
                  {/* Malignant Ratio Row */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-red-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-medical-danger shadow-glow-danger" />
                        Malignant Detections
                      </span>
                      <span className="text-slate-300 font-semibold">{stats.malignantCount} cases ({stats.malignantPercentage}%)</span>
                    </div>
                    {/* Glowing Progress bar */}
                    <div className="w-full h-3 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full shadow-glow-danger transition-all duration-1000"
                        style={{ width: `${stats.malignantPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Benign Ratio Row */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-medical-success shadow-glow-success" />
                        Benign Detections
                      </span>
                      <span className="text-slate-300 font-semibold">{stats.benignCount} cases ({stats.benignPercentage}%)</span>
                    </div>
                    {/* Glowing Progress bar */}
                    <div className="w-full h-3 rounded-full bg-slate-900 border border-white/5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full shadow-glow-success transition-all duration-1000"
                        style={{ width: `${stats.benignPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Diagnostic Summary Note */}
                  <p className="text-[10px] text-slate-500 font-light border-t border-white/5 pt-4 leading-relaxed">
                    Note: Diagnostic ratios display outcomes computed exclusively from biopsy slides registered directly under your supervisor ID. These statistics synchronize live with each screening completed at the workstation.
                  </p>

                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;
