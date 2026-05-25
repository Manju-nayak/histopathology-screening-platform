import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Users, Activity, UploadCloud, FileText, Plus, Search, 
  ChevronRight, Calendar, UserPlus, LogOut, Loader2 
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
              HistoAI Workstation
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{user?.full_name || 'CLINICIAN'}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role} Mode</div>
            </div>
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Main Screening Workstation */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Dashboard Metrics Widgets */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* Total Scans Card */}
            <div className="p-5 rounded-xl glass-panel relative overflow-hidden flex flex-col justify-between h-28">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Scans</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-2xl text-white">{totalScans}</span>
                <span className="text-[10px] text-slate-500">cases</span>
              </div>
              <Activity className="w-10 h-10 text-medical-primary opacity-[0.08] absolute right-4 bottom-4" />
            </div>

            {/* Malignancy Index Card */}
            <div className="p-5 rounded-xl glass-panel relative overflow-hidden flex flex-col justify-between h-28">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Malignancy Ratio</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-2xl text-white">{malignantRate}%</span>
                <span className="text-[10px] text-slate-500">positive</span>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full absolute top-5 right-5 ${parseFloat(malignantRate) > 40 ? 'bg-medical-danger' : 'bg-medical-success'}`} />
            </div>

            {/* Registered Patients Card */}
            <div className="p-5 rounded-xl glass-panel relative overflow-hidden flex flex-col justify-between h-28">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Patients Logs</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-2xl text-white">{totalPatients}</span>
                <span className="text-[10px] text-slate-500">profiles</span>
              </div>
              <Users className="w-10 h-10 text-medical-primary opacity-[0.08] absolute right-4 bottom-4" />
            </div>

          </div>

          {/* Biopsy Upload and AI screening */}
          <div className="p-6 rounded-xl glass-panel border border-white/5">
            <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-medical-primaryLight" />
              Upload Biopsy Slide for AI Screening
            </h2>

            {uploadError && (
              <div className="p-3 bg-medical-danger/10 border border-medical-danger/20 text-xs text-red-400 rounded-lg mb-4 animate-pulse">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadInference} className="flex flex-col gap-5">
              
              {/* Select Patient Profile */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs font-medium">1. Select Patient Profile</label>
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
                    No patient records. Please register a patient first using the side panel.
                  </p>
                )}
              </div>

              {/* Upload Dropzone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 text-xs font-medium">2. Upload Histopathology Biopsy Image</label>
                <div className="grid md:grid-cols-2 gap-4">
                  
                  {/* File Input Box */}
                  <label className="border-2 border-dashed border-white/5 hover:border-medical-primary/40 bg-[#111625]/60 hover:bg-[#111625] rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all">
                    <UploadCloud className="w-8 h-8 text-slate-500" />
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-300">Drag slide here or browse</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Supports PNG, JPG, JPEG, TIFF</p>
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
                      <span className="text-xs text-slate-500">Image Preview Window</span>
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

          {/* Interactive Case History Log */}
          <div className="p-6 rounded-xl glass-panel border border-white/5 flex-1 flex flex-col">
            
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-medical-primaryLight" />
                Historical Case Screening Logs
              </h2>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter cases by name or class..."
                  className="w-full bg-[#111625] border border-white/5 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-medical-primary transition-all font-light"
                />
              </div>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto flex-1 max-h-[350px]">
              {isLoadingLogs ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-medical-primary animate-spin" />
                </div>
              ) : filteredScans.length === 0 ? (
                <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-xl">
                  <span className="text-xs text-slate-500">No matching scan logs found in history.</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-medium">
                      <th className="py-2.5">Scan ID</th>
                      <th className="py-2.5">Patient Name</th>
                      <th className="py-2.5">Prediction</th>
                      <th className="py-2.5">Confidence</th>
                      <th className="py-2.5">Screened Date</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredScans.map((scan) => {
                      const patient = patients.find((p) => p.id === scan.patient_id);
                      const isMalignant = scan.prediction.toLowerCase() === 'malignant';
                      return (
                        <tr key={scan.id} className="hover:bg-white/[0.02] transition-all">
                          <td className="py-3 font-semibold text-slate-300">#{scan.id}</td>
                          <td className="py-3 text-white font-medium">
                            {patient ? patient.full_name : `Patient ID ${scan.patient_id}`}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isMalignant 
                                ? 'bg-red-950/40 text-red-400 border border-red-900/30' 
                                : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                            }`}>
                              {scan.prediction}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-slate-300">
                            {(scan.confidence * 100).toFixed(1)}%
                          </td>
                          <td className="py-3 text-slate-400">
                            {new Date(scan.created_at).toLocaleDateString()}
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

        {/* Right Column: Side Action Panels */}
        <div className="flex flex-col gap-8">
          
          {/* Patient Quick-Register Profile */}
          <div className="p-6 rounded-xl glass-panel border border-white/5">
            <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-medical-primaryLight" />
              Register Patient Profile
            </h2>

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
                  className="w-full bg-[#111625] border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-medical-primary transition-all font-light"
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
                    className="w-full bg-[#111625] border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-medical-primary transition-all font-light"
                  />
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 text-xs">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full bg-[#111625] border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-medical-primary transition-all cursor-pointer font-light"
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
                  className="w-full bg-[#111625] border border-white/5 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-medical-primary transition-all font-light resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingPatient}
                className="mt-2 bg-[#111625] border border-white/5 hover:border-medical-primary/30 hover:bg-medical-primary/10 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
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

          {/* Quick Guidance Panel */}
          <div className="p-6 rounded-xl glass-panel border border-white/5 text-xs font-light text-slate-400 flex flex-col gap-3">
            <span className="font-display font-bold text-white text-sm mb-1">Clinical Screening Guide</span>
            <div className="flex gap-2">
              <Calendar className="w-4 h-4 text-medical-primaryLight shrink-0" />
              <span>Ensure slide is clean RGB resolution, ideally extracted from standard 224x224 patch zooms.</span>
            </div>
            <div className="flex gap-2">
              <Activity className="w-4 h-4 text-medical-accentLight shrink-0" />
              <span>Grad-CAM output overlays show features contributing most to class score backpropagation.</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default Dashboard;
