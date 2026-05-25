import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Users, Activity, UploadCloud, FileText, Plus, Search, 
  ChevronRight, Calendar, UserPlus, LogOut, Loader2, Settings, Shield 
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Settings & Theme preferences
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('resnet50');
  
  // Workstation Active Tab
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'register'

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  // Patients & Scans States
  const [patients, setPatients] = useState([]);
  const [scans, setScans] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    full_name: '',
    age: '',
    gender: 'Female',
    medical_history: ''
  });
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [patientError, setPatientError] = useState('');
  const [patientSuccess, setPatientSuccess] = useState('');

  // Upload Slide Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Search Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch baseline records
  const fetchData = async () => {
    setIsLoadingLogs(true);
    try {
      const [patientsRes, scansRes] = await Promise.all([
        api.get('/patients'),
        api.get('/scans')
      ]);
      setPatients(patientsRes.data);
      // Sort scans by created_at descending (newest first)
      const sortedScans = scansRes.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setScans(sortedScans);
    } catch (e) {
      console.error("Failed fetching database logs:", e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle New Patient Creation
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setPatientError('');
    setPatientSuccess('');
    setIsCreatingPatient(true);

    try {
      const response = await api.post('/patients', {
        full_name: newPatient.full_name,
        age: parseInt(newPatient.age),
        gender: newPatient.gender,
        medical_history: newPatient.medical_history || null
      });
      setPatients((prev) => [...prev, response.data]);
      setPatientSuccess(`Patient profile registered: ${response.data.full_name}`);
      // Select the newly created patient automatically in the upload select
      setSelectedPatientId(response.data.id);
      // Reset form
      setNewPatient({ full_name: '', age: '', gender: 'Female', medical_history: '' });
    } catch (err) {
      setPatientError(err.response?.data?.detail || "Failed to register patient profile.");
    } finally {
      setIsCreatingPatient(false);
    }
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  // Handle Prediction Submission
  const handleUploadInference = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!selectedPatientId) {
      setUploadError("Please select a patient for this biopsy slide.");
      return;
    }
    if (!selectedFile) {
      setUploadError("Please choose a valid biopsy image file (PNG, JPG, TIFF).");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('patient_id', selectedPatientId);

    try {
      const response = await api.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Successfully predicted, redirect to the scan detail report page!
      navigate(`/scan/${response.data.scan_id}`);
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.detail || "AI screening failed. Check backend logs.");
    } finally {
      setIsUploading(false);
    }
  };

  // Stats Calculations
  const totalScans = scans.length;
  const malignantScans = scans.filter((s) => s.prediction.toLowerCase() === 'malignant').length;
  const malignantRate = totalScans > 0 ? ((malignantScans / totalScans) * 100).toFixed(1) : 0;
  const totalPatients = patients.length;

  // Filter scans by search query
  const filteredScans = scans.filter((scan) => {
    const patient = patients.find((p) => p.id === scan.patient_id);
    const patientName = patient ? patient.full_name.toLowerCase() : '';
    const predictionText = scan.prediction.toLowerCase();
    const query = searchTerm.toLowerCase();
    return patientName.includes(query) || predictionText.includes(query);
  });

  return (
    <div className="min-h-screen bg-[#05070c] relative flex flex-col font-sans">
      
      {/* Premium Header */}
      <header className="border-b border-white/5 bg-[#0e1322]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-medical-primary/20 flex items-center justify-center border border-medical-primary/25">
              <Activity className="w-4 h-4 text-medical-primaryLight animate-pulse" />
            </div>
            <span className="font-display font-bold text-lg uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              TumorTrace Workstation
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className="text-right flex items-center gap-3 px-3 py-1.5 rounded-xl border border-white/5 hover:border-medical-primary/25 hover:bg-medical-primary/10 transition-all cursor-pointer group"
              title="View Clinician Profile"
            >
              <div className="text-right hidden sm:block font-sans">
                <div className="text-xs font-semibold text-white group-hover:text-medical-primaryLight transition-colors">
                  {user?.full_name || 'CLINICIAN'}
                </div>
                <div className="text-[10px] text-slate-400 capitalize">{user?.role} Mode</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-medical-primary/20 flex items-center justify-center border border-medical-primary/30 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4 text-medical-primaryLight" />
              </div>
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-medical-primary/30 hover:bg-medical-primary/10 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer"
              title="Workstation Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={logout}
              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-medical-danger/30 hover:bg-medical-danger/10 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Columns: Main Screening Workstation (3/5 width) */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          
          {/* Dashboard Metrics Widgets */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Total Scans Card */}
            <div className="p-5 rounded-xl glass-panel relative overflow-hidden flex flex-col justify-between h-28 hover:border-medical-primary/10 transition-colors">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Scans</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-2xl text-white">{totalScans}</span>
                <span className="text-[10px] text-slate-500 font-light">cases</span>
              </div>
              <Activity className="w-10 h-10 text-medical-primary opacity-[0.08] absolute right-4 bottom-4 animate-pulse" />
            </div>

            {/* Malignancy Index Card */}
            <div className="p-5 rounded-xl glass-panel relative overflow-hidden flex flex-col justify-between h-28 hover:border-medical-primary/10 transition-colors">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Malignancy Ratio</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-2xl text-white">{malignantRate}%</span>
                <span className="text-[10px] text-slate-500 font-light">positive</span>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full absolute top-5 right-5 ${parseFloat(malignantRate) > 40 ? 'bg-medical-danger animate-ping' : 'bg-medical-success'}`} />
            </div>

            {/* Registered Patients Card */}
            <div className="p-5 rounded-xl glass-panel relative overflow-hidden flex flex-col justify-between h-28 hover:border-medical-primary/10 transition-colors">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Patients Logs</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-2xl text-white">{totalPatients}</span>
                <span className="text-[10px] text-slate-500 font-light">profiles</span>
              </div>
              <Users className="w-10 h-10 text-medical-primary opacity-[0.08] absolute right-4 bottom-4" />
            </div>

          </div>

          {/* Tabbed Workstation Panel */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 shadow-lg relative overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-white/5 mb-6 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'border-medical-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                AI Biopsy Screening
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'border-medical-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Register Patient Profile
              </button>
            </div>

            {/* Tab 1: AI Biopsy Screening Form */}
            {activeTab === 'upload' && (
              <div className="animate-fade-in">
                {uploadError && (
                  <div className="p-3 bg-medical-danger/10 border border-medical-danger/20 text-xs text-red-400 rounded-lg mb-4 animate-pulse">
                    {uploadError}
                  </div>
                )}

                <form onSubmit={handleUploadInference} className="flex flex-col gap-5">
                  {/* Select Patient Profile */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-xs font-medium">Select Patient Profile</label>
                    <select
                      required
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full bg-[#111625] border border-white/5 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-medical-primary transition-all cursor-pointer font-light"
                    >
                      <option value="">-- Choose registered patient profile --</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} (Age: {p.age}, Gender: {p.gender})
                        </option>
                      ))}
                    </select>
                    {patients.length === 0 && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        No patient records available. Please switch to the "Register Patient Profile" tab first.
                      </p>
                    )}
                  </div>

                  {/* Upload Dropzone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-xs font-medium">Upload Histopathology Biopsy Image</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      
                      {/* File Input Box */}
                      <label className="border-2 border-dashed border-white/5 hover:border-medical-primary/45 bg-[#111625]/60 hover:bg-[#111625] rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all">
                        <UploadCloud className="w-8 h-8 text-slate-500 group-hover:scale-105 transition-transform" />
                        <div className="text-center">
                          <p className="text-xs font-medium text-slate-300">Drag slide here or browse</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-light">Supports PNG, JPG, JPEG, TIFF</p>
                        </div>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.tiff"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {/* Image Preview Box */}
                      <div className="bg-[#111625] border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden h-36">
                        {filePreview ? (
                          <img 
                            src={filePreview} 
                            alt="Biopsy Slide Preview" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-xs text-slate-500 font-light">Image Preview Window</span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Run Button */}
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="bg-gradient-to-r from-medical-primary to-medical-accent hover:opacity-90 active:scale-95 text-white text-sm font-semibold py-3 px-6 rounded-xl shadow-glow-primary flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Screening Slide & Generating heatmaps...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 animate-pulse" />
                        Launch AI Cancer Screening Pipeline
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Patient Registration Form */}
            {activeTab === 'register' && (
              <div className="animate-fade-in">
                {patientError && (
                  <div className="p-3 bg-medical-danger/10 border border-medical-danger/20 text-xs text-red-400 rounded-lg mb-4 animate-pulse">
                    {patientError}
                  </div>
                )}
                {patientSuccess && (
                  <div className="p-3 bg-medical-success/10 border border-medical-success/20 text-xs text-emerald-400 rounded-lg mb-4">
                    {patientSuccess}
                  </div>
                )}

                <form onSubmit={handleCreatePatient} className="flex flex-col gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-xs">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      value={newPatient.full_name}
                      onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })}
                      placeholder="e.g. Johnathan Smith"
                      className="w-full bg-[#111625] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-medical-primary transition-all font-light"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Age */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 text-xs">Patient Age</label>
                      <input
                        type="number"
                        required
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                        placeholder="e.g. 54"
                        className="w-full bg-[#111625] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-medical-primary transition-all font-light"
                      />
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 text-xs">Gender</label>
                      <select
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                        className="w-full bg-[#111625] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-medical-primary transition-all cursor-pointer font-light"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-xs">Medical History (Optional)</label>
                    <textarea
                      value={newPatient.medical_history}
                      onChange={(e) => setNewPatient({ ...newPatient, medical_history: e.target.value })}
                      placeholder="e.g. Type II Diabetes, Hypertension, Prior breast biopsies in 2024..."
                      rows="3"
                      className="w-full bg-[#111625] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-medical-primary transition-all font-light resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingPatient}
                    className="mt-2 bg-gradient-to-r from-medical-primary to-medical-accent hover:opacity-90 active:scale-95 text-white text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isCreatingPatient ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Register Profile
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Historical Case Screening Logs (2/5 width) */}
        <div className="lg:col-span-2 flex flex-col">
          
          <div className="p-6 rounded-2xl glass-panel border border-white/5 h-full flex flex-col">
            
            <div className="flex flex-col gap-4 mb-6">
              <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-medical-primaryLight" />
                Historical Case Screening Logs
              </h2>
              
              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient name or prediction..."
                  className="w-full bg-[#111625] border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-medical-primary transition-all font-light"
                />
              </div>
            </div>

            {/* Logs Table */}
            <div className="overflow-y-auto flex-1 max-h-[500px] pr-1">
              {isLoadingLogs ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-medical-primary animate-spin" />
                </div>
              ) : filteredScans.length === 0 ? (
                <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-xl">
                  <span className="text-xs text-slate-500 font-light">No matching logs found.</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-medium">
                      <th className="py-2.5 font-semibold">ID</th>
                      <th className="py-2.5 font-semibold">Patient</th>
                      <th className="py-2.5 font-semibold">Prediction</th>
                      <th className="py-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredScans.map((scan) => {
                      const patient = patients.find((p) => p.id === scan.patient_id);
                      const isMalignant = scan.prediction.toLowerCase() === 'malignant';
                      return (
                        <tr key={scan.id} className="hover:bg-white/[0.02] transition-all">
                          <td className="py-3 font-semibold text-slate-400">#{scan.id}</td>
                          <td className="py-3 text-white font-medium">
                            {patient ? (
                              <button
                                onClick={() => navigate(`/patient/${patient.id}`)}
                                className="truncate max-w-[120px] text-left text-medical-primaryLight hover:text-white font-semibold hover:underline block cursor-pointer transition-colors"
                                title={`View details for ${patient.full_name}`}
                              >
                                {patient.full_name}
                              </button>
                            ) : (
                              <p className="truncate max-w-[120px] text-slate-400" title={`ID ${scan.patient_id}`}>
                                ID {scan.patient_id}
                              </p>
                            )}
                            <p className="text-[9px] text-slate-500 font-light">Conf: {(scan.confidence * 100).toFixed(0)}%</p>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              isMalignant 
                                ? 'bg-red-950/40 text-red-400 border border-red-900/30' 
                                : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                            }`}>
                              {scan.prediction}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => navigate(`/scan/${scan.id}`)}
                              className="text-xs text-medical-primaryLight hover:text-white inline-flex items-center gap-0.5 cursor-pointer font-medium hover:underline"
                            >
                              Report
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0b0e1a]/80 py-8 mt-auto font-sans w-full">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-medical-primaryLight shrink-0" />
            <span className="text-[10px] text-slate-500 font-light max-w-xl text-left leading-relaxed">
              <strong>Clinical Disclaimer:</strong> TumorTrace is an AI-assisted diagnostic screening utility. All predictions must be validated by a certified pathologist before finalized diagnoses.
            </span>
          </div>
          <div className="text-slate-600 text-[10px] font-light">
            &copy; {new Date().getFullYear()} TumorTrace. All clinical rights reserved.
          </div>
        </div>
      </footer>

      {/* Settings Modal overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md rounded-2xl glass-panel shadow-2xl p-6 relative overflow-hidden border border-white/10">
            <h3 className="font-display font-bold text-lg text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-medical-primaryLight animate-spin-slow" />
              Workstation Settings
            </h3>
            
            <div className="flex flex-col gap-6 text-sm">
              
              {/* Theme Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Appearance Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTheme('dark')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-medical-primary/20 border-medical-primary text-white shadow-glow-primary'
                        : 'bg-[#111625]/60 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    Dark Workstation
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleTheme('light')}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-medical-primary/20 border-medical-primary text-white shadow-glow-primary'
                        : 'bg-[#111625]/60 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    Light Workstation
                  </button>
                </div>
              </div>

              {/* AI Model Preference */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">AI Classification Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-[#111625] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-medical-primary transition-all cursor-pointer font-light"
                >
                  <option value="resnet50">ResNet50 + Grad-CAM Saliency Hooks (Active)</option>
                  <option value="densenet121">DenseNet121 Deep Layer (Experimental)</option>
                  <option value="vit">Vision Transformer ViT-B/16 (Experimental)</option>
                </select>
              </div>

              {/* Warning disclaimer */}
              <div className="p-3 bg-medical-warning/10 border border-medical-warning/20 rounded-xl text-[10px] text-amber-400 font-light leading-relaxed">
                Note: Changing the active model adjusts the client pipeline preview parameters. DenseNet and ViT options require custom GPU endpoints.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="mt-6 w-full bg-gradient-to-r from-medical-primary to-medical-accent hover:opacity-90 active:scale-95 text-white text-xs font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
            >
              Save & Close Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
