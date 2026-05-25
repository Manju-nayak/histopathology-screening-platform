import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  ChevronLeft, Activity, Calendar, FileText, 
  UploadCloud, Loader2, User, ChevronRight, Shield 
} from 'lucide-react';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Biopsy upload states (specific to this patient)
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchPatientAndScans = async () => {
    setIsLoading(true);
    try {
      const [patientRes, scansRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get('/scans')
      ]);
      setPatient(patientRes.data);
      // Filter scans belonging to this patient and sort newest first
      const patientScans = scansRes.data
        .filter(s => s.patient_id === parseInt(id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setScans(patientScans);
    } catch (err) {
      console.error("Failed to load patient profile details:", err);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientAndScans();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  const handleUploadInference = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!selectedFile) {
      setUploadError("Please choose a valid biopsy image file (PNG, JPG, TIFF) to screen.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('patient_id', id);

    try {
      const response = await api.post('/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Redirect to the scan report page
      navigate(`/scan/${response.data.scan_id}`);
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.detail || "AI screening failed. Check backend logs.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-medical-dark flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-medical-primaryLight animate-spin" />
      </div>
    );
  }

  // Stats
  const totalScans = scans.length;
  const malignantCount = scans.filter(s => s.prediction.toLowerCase() === 'malignant').length;
  const malignantRate = totalScans > 0 ? ((malignantCount / totalScans) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-medical-dark text-slate-100 font-sans relative overflow-hidden flex flex-col">
      {/* Background decoration blurs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-medical-primary opacity-[0.03] blur-[100px] -top-52 -left-52 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-medical-accent opacity-[0.03] blur-[100px] -bottom-52 -right-52 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-[#0e1322]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all font-medium cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <span className="font-display font-bold text-base uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Patient Case Record
          </span>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Patient Profile & Screening Stats (2/5 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Patient Details Card */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-medical-primary to-medical-accent" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-medical-primary/20 flex items-center justify-center border border-medical-primary/25">
                <User className="w-6 h-6 text-medical-primaryLight" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-white leading-tight">
                  {patient?.full_name}
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Patient Record ID #{patient?.id}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs font-light border-t border-white/5 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Age</p>
                  <p className="text-slate-200 mt-0.5">{patient?.age} years</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Gender</p>
                  <p className="text-slate-200 mt-0.5">{patient?.gender}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Registered On</p>
                <p className="text-slate-200 mt-0.5">{new Date(patient?.created_at).toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Clinical Medical History</p>
                <p className="text-slate-300 mt-1 bg-white/[0.02] border border-white/5 p-3 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {patient?.medical_history || 'No previous medical history recorded.'}
                </p>
              </div>
            </div>
          </div>

          {/* Screening Analytics Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-28 hover:border-medical-primary/10 transition-colors">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Screenings</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-2xl text-white">{totalScans}</span>
                <span className="text-[10px] text-slate-500 font-light">slides</span>
              </div>
              <FileText className="w-8 h-8 text-medical-primary opacity-[0.06] absolute right-4 bottom-4" />
            </div>

            <div className="p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-28 hover:border-medical-primary/10 transition-colors">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Malignancy Ratio</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-2xl text-white">{malignantRate}%</span>
                <span className="text-[10px] text-slate-500 font-light">positive</span>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full absolute top-5 right-5 ${parseFloat(malignantRate) > 40 ? 'bg-medical-danger animate-ping' : 'bg-medical-success'}`} />
            </div>
          </div>

        </div>

        {/* Right Column: Case history logs table & Uploader (3/5 width) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Perform New Biopsy Screening Form */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 shadow-lg">
            <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-medical-primaryLight" />
              Perform AI Biopsy Screening for {patient?.full_name}
            </h3>

            {uploadError && (
              <div className="p-3 bg-medical-danger/10 border border-medical-danger/20 text-xs text-red-400 rounded-lg mb-4 animate-pulse">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadInference} className="flex flex-col gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                
                {/* File Dropzone */}
                <label className="border-2 border-dashed border-white/5 hover:border-medical-primary/45 bg-[#111625]/60 hover:bg-[#111625] rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                  <UploadCloud className="w-7 h-7 text-slate-500" />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-300">Choose tissue image</p>
                    <p className="text-[9px] text-slate-500 font-light mt-0.5">Supports PNG, JPG, TIFF</p>
                  </div>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.tiff"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Preview Window */}
                <div className="bg-[#111625] border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden h-28">
                  {filePreview ? (
                    <img 
                      src={filePreview} 
                      alt="Biopsy Slide Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-xs text-slate-500 font-light">Image Preview</span>
                  )}
                </div>

              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="bg-gradient-to-r from-medical-primary to-medical-accent hover:opacity-90 active:scale-95 text-white text-xs font-semibold py-3 px-6 rounded-xl shadow-glow-primary flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running ResNet50 analysis pipeline...
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

          {/* Historical Case Screening Logs */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 flex-1 flex flex-col">
            <h3 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-medical-primaryLight" />
              Historical Case Screening Logs
            </h3>

            <div className="overflow-y-auto flex-1 max-h-[280px]">
              {scans.length === 0 ? (
                <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-xl">
                  <span className="text-xs text-slate-500 font-light">No screening records registered for this patient.</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-medium">
                      <th className="py-2.5 font-semibold">Scan ID</th>
                      <th className="py-2.5 font-semibold">AI Prediction</th>
                      <th className="py-2.5 font-semibold">Confidence</th>
                      <th className="py-2.5 font-semibold">Screened Date</th>
                      <th className="py-2.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {scans.map((scan) => {
                      const isMalignant = scan.prediction.toLowerCase() === 'malignant';
                      return (
                        <tr key={scan.id} className="hover:bg-white/[0.02] transition-all">
                          <td className="py-3 font-semibold text-slate-300">#{scan.id}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
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

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0b0e1a]/80 py-8 mt-auto font-sans">
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
    </div>
  );
};

export default PatientDetail;
