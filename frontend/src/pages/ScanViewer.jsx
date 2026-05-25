import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  ArrowLeft, Activity, Printer, FileText, 
  AlertTriangle, Shield, CheckCircle, Loader2 
} from 'lucide-react';

const ScanViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Records States
  const [scan, setScan] = useState(null);
  const [patient, setPatient] = useState(null);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScanData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // 1. Fetch specific scan log
        const scanRes = await api.get(`/scans/${id}`);
        setScan(scanRes.data);

        // 2. Fetch associated patient and report in parallel
        const [patientRes, reportRes] = await Promise.all([
          api.get(`/patients/${scanRes.data.patient_id}`),
          api.get(`/reports/scan/${scanRes.data.id}`)
        ]);

        setPatient(patientRes.data);
        setReport(reportRes.data);
      } catch (err) {
        console.error("Failed to load diagnostic scan details:", err);
        setError("Could not load diagnostic data. Ensure the backend is active.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScanData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-medical-primaryLight animate-spin" />
          <span className="text-xs text-slate-400">Loading tissue slide diagnostics...</span>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-[#05070c] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-6 rounded-xl border border-medical-danger/20 text-center">
          <AlertTriangle className="w-10 h-10 text-medical-danger mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Diagnostic Load Failed</p>
          <p className="text-xs text-slate-400 mb-6">{error || "The scan log requested does not exist."}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white hover:bg-white/10 cursor-pointer"
          >
            Go Back to Workstation
          </button>
        </div>
      </div>
    );
  }

  const isMalignant = scan.prediction.toLowerCase() === 'malignant';
  const confidencePercent = (scan.confidence * 100).toFixed(1);

  // Form final static URLs for image rendering
  const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const originalImageUrl = `${apiBaseURL}/${scan.image_path}`;
  const heatmapImageUrl = `${apiBaseURL}/${scan.heatmap_path}`;

  return (
    <div className="min-h-screen bg-[#05070c] py-8 print:py-0 font-sans">
      <div className="max-w-7xl mx-auto px-6 print:px-0">
        
        {/* Back and Action controls (Hide on Print) */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workstation
          </button>
          
          <button 
            onClick={handlePrint}
            className="bg-white/5 border border-white/5 hover:border-medical-primary/30 hover:bg-medical-primary/10 text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save Report
          </button>
        </div>

        {/* Case Info Ribbon */}
        <div className="p-6 rounded-xl glass-panel border border-white/5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 print:border-slate-300 print:text-black print:bg-white">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Diagnostic Case Log</div>
            <h1 className="font-display font-extrabold text-2xl text-white print:text-black mt-1">
              Case Profile: {patient?.full_name || 'N/A'}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
              <span>Patient ID: #{scan.patient_id}</span>
              <span>Age: {patient?.age || 'N/A'}</span>
              <span>Gender: {patient?.gender || 'N/A'}</span>
              <span>Date: {new Date(scan.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Large AI Indicator Badge */}
          <div className="flex items-center gap-5">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">AI Prediction</span>
              <span className={`font-display font-black text-xl tracking-wider uppercase ${
                isMalignant ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {scan.prediction}
              </span>
            </div>
            
            {/* Circular Confidence Graph */}
            <div className="w-16 h-16 relative flex items-center justify-center select-none">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  fill="transparent" 
                  stroke="rgba(255, 255, 255, 0.05)" 
                  strokeWidth="4" 
                />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  fill="transparent" 
                  stroke={isMalignant ? "#ef4444" : "#10b981"} 
                  strokeWidth="4" 
                  strokeDasharray={163.36}
                  strokeDashoffset={163.36 - (163.36 * scan.confidence)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute font-display font-black text-xs text-white print:text-black">
                {confidencePercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Imaging comparison panel (Original vs. Grad-CAM) */}
        <div className="grid md:grid-cols-2 gap-8 mb-8 print:grid-cols-2 print:gap-4">
          
          {/* Original Slide Card */}
          <div className="rounded-xl glass-panel border border-white/5 overflow-hidden flex flex-col print:border-slate-300">
            <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-medical-primaryLight" />
              <span className="text-xs font-semibold text-white print:text-black">Original Biopsy Tissue Slide</span>
            </div>
            <div className="bg-medical-dark flex items-center justify-center min-h-[350px] relative overflow-hidden">
              <img 
                src={originalImageUrl} 
                alt="Original Histopathology" 
                className="w-full h-full object-contain max-h-[400px]" 
              />
            </div>
          </div>

          {/* Grad-CAM Overlaid Heatmap Card */}
          <div className="rounded-xl glass-panel border border-white/5 overflow-hidden flex flex-col print:border-slate-300">
            <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center gap-2">
              <Activity className="w-4 h-4 text-medical-accentLight" />
              <span className="text-xs font-semibold text-white print:text-black">Grad-CAM Region Activation Overlay</span>
            </div>
            <div className="bg-medical-dark flex items-center justify-center min-h-[350px] relative overflow-hidden">
              <img 
                src={heatmapImageUrl} 
                alt="Grad-CAM Activation" 
                className="w-full h-full object-contain max-h-[400px]" 
              />
            </div>
          </div>

        </div>

        {/* Detailed Medical Report Text View */}
        <div className="p-8 rounded-xl glass-panel border border-white/5 print:border-slate-300 print:bg-white print:text-black">
          <h3 className="font-display font-bold text-lg text-white print:text-black mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <FileText className="w-5 h-5 text-medical-primaryLight" />
            Clinical Text Report Summary
          </h3>
          <pre className="font-mono text-xs text-slate-300 print:text-black bg-[#080b13]/60 print:bg-white p-6 rounded-xl border border-white/5 print:border-none overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {report?.report_text || "Compiling clinical summary file..."}
          </pre>
          
          {/* Embedded Disclaimer Badge */}
          <div className="mt-6 p-4 rounded-xl bg-medical-warning/10 border border-medical-warning/20 text-[11px] text-amber-300/90 leading-relaxed flex gap-3 print:bg-yellow-50 print:text-amber-800 print:border-amber-200">
            <AlertTriangle className="w-5 h-5 text-medical-warning shrink-0" />
            <div>
              <span className="font-bold block uppercase tracking-wider mb-0.5">Clinical Support Notice</span>
              This visualization and class indicator are designed as computer-vision diagnostic support mechanisms only. They must not replace direct histological slide checks and pathologists sign-offs.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScanViewer;
