import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, ArrowRight, Brain, Sparkles, Lock, CheckCircle, Eye } from 'lucide-react';


const Landing = () => {
  const navigate = useNavigate();

  const handleLaunch = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-medical-dark text-slate-100 font-sans relative overflow-hidden flex flex-col">
      {/* Decorative Blur Spheres for Glassmorphism & High-tech Vibe */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-medical-primary opacity-[0.04] blur-[120px] -top-80 -left-60 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-medical-accent opacity-[0.04] blur-[120px] top-1/3 -right-60 pointer-events-none" />
      <div className="absolute w-[700px] h-[700px] rounded-full bg-[#1e1b4b] opacity-[0.06] blur-[150px] -bottom-80 left-1/3 pointer-events-none" />

      {/* Header/Navbar */}
      <header className="border-b border-white/5 bg-[#0e1322]/40 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-medical-primary/20 flex items-center justify-center border border-medical-primary/30 shadow-glow-primary">
              <Activity className="w-5 h-5 text-medical-primaryLight animate-pulse" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              TumorTrace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-slate-300 hover:text-white transition-colors cursor-pointer px-4 py-2"
            >
              Clinical Sign In
            </button>
            <button
              onClick={handleLaunch}
              className="bg-gradient-to-r from-medical-primary to-medical-accent hover:opacity-90 active:scale-95 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-glow-primary flex items-center gap-1.5 transition-all cursor-pointer"
            >
              Launch Workstation
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center flex-1">
        
        {/* Status Chip */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-8 backdrop-blur-sm animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5 text-medical-accentLight" />
          <span>ResNet50 + Grad-CAM Pipeline Ready</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Main Headings */}
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent max-w-4xl mb-6">
          AI-Assisted Histopathology Cancer Screening Workstation
        </h1>
        
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl font-light leading-relaxed mb-10">
          Empowering clinical pathologists with state-of-the-art Deep Learning classification models and region-of-interest heatmaps for rapid and accurate biopsy cell analysis.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center w-full max-w-md">
          <button
            onClick={handleLaunch}
            className="flex-1 bg-gradient-to-r from-medical-primary to-medical-accent hover:opacity-95 active:scale-95 text-white font-semibold text-sm py-4 px-8 rounded-2xl shadow-glow-primary flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Launch Workstation
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              navigate('/login');
              // To toggle to register mode automatically if desired
            }}
            className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 active:scale-95 text-slate-200 hover:text-white font-semibold text-sm py-4 px-8 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4 text-medical-primaryLight" />
            Request Account
          </button>
        </div>

        {/* Animated AI Microscope Scanner Visualizer */}
        <div className="w-full max-w-4xl h-[420px] rounded-2xl border border-white/5 bg-[#0e1322]/20 backdrop-blur-sm relative overflow-hidden mb-20 shadow-2xl flex items-center justify-center p-8 group hover:border-medical-primary/20 transition-all duration-500">
          {/* Subtle grid lines background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
          
          {/* Scanning sweep laser line */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-medical-primaryLight to-transparent shadow-[0_0_15px_#6366f1] animate-[sweep_4s_ease-in-out_infinite] z-20 pointer-events-none" />
          
          {/* Microscope Viewport Area */}
          <div className="relative w-72 h-72 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center animate-[spin_60s_linear_infinite]">
            <div className="absolute inset-2 rounded-full border border-medical-primary/25" />
            <div className="absolute inset-6 rounded-full border border-dashed border-medical-accent/20" />
            
            {/* Center target crosshair */}
            <div className="absolute w-8 h-px bg-white/20" />
            <div className="absolute h-8 w-px bg-white/20" />
          </div>

          {/* SVG Cellular Structures with Saliency Heatmaps */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-80 h-80 flex items-center justify-center">
              
              {/* Healthy cell */}
              <div className="absolute top-16 left-20 w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 rounded-full bg-emerald-500/40" />
              </div>

              {/* Malignant cell being scanned (Hotspot) */}
              <div className="absolute top-28 right-16 w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                {/* Glowing Heatmap Overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-500 to-yellow-500 opacity-20 animate-ping" />
                <div className="w-6 h-6 rounded-full bg-red-600/60 animate-pulse flex items-center justify-center border border-red-400">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              {/* Saliency Grad-CAM Heatmap Blobs (Absolute positions) */}
              <div className="absolute bottom-20 left-28 w-24 h-20 rounded-full bg-gradient-to-r from-[#4FB3FF]/20 via-[#064789]/15 to-red-500/25 blur-xl animate-pulse" />
              <div className="absolute bottom-24 right-28 w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-500/15 to-red-500/20 blur-lg animate-pulse-slow" />
              
              {/* Mitotic Nucleus Spline */}
              <div className="absolute bottom-24 left-32 w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <div className="w-5 h-8 rounded-full border border-emerald-400/40 rotate-45" />
              </div>
            </div>
          </div>

          {/* High-tech overlays (HUD) */}
          <div className="absolute top-6 left-6 text-left flex flex-col gap-1 font-mono text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5 text-medical-primaryLight">
              <span className="w-1.5 h-1.5 rounded-full bg-medical-primaryLight animate-ping" />
              SCANNING INFERENCE ACTIVE
            </div>
            <div>MODEL: RESNET50_CLASSIFIER</div>
            <div>RESOLUTION: 224x224 PX</div>
          </div>

          <div className="absolute bottom-6 right-6 text-right flex flex-col gap-1 font-mono text-[10px] text-slate-500">
            <div>TARGET COORD: X=142.8, Y=294.1</div>
            <div>CELL TYPE: PLEOMORPHIC SLIDE</div>
            <div className="text-red-400 font-bold">PROBABILITY: 99.24% MALIGNANT</div>
          </div>

          {/* Center Target Box */}
          <div className="absolute w-44 h-16 rounded-xl border border-white/10 bg-[#0e1322]/80 backdrop-blur-md shadow-glass flex items-center justify-center gap-3 px-4 py-2 hover:border-medical-primary/30 transition-all z-20">
            <Activity className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
            <div className="text-left font-mono">
              <div className="text-[10px] font-semibold text-white uppercase tracking-wider">Malignancy Detected</div>
              <div className="text-[11px] font-bold text-red-400">99.2% Confidence</div>
            </div>
          </div>
        </div>

        {/* Core Capabilities */}
        <div className="grid md:grid-cols-3 gap-8 text-left w-full max-w-5xl mb-24">
          
          <div className="p-8 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between group hover:border-medical-primary/30 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-medical-primary/15 border border-medical-primary/20 flex items-center justify-center text-medical-primaryLight mb-6 shadow-glow-primary">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-3">
                Deep Learning Classification
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Utilizes optimized ResNet50 neural networks to automatically identify and classify tissue biopsies as Benign or Malignant with exceptional accuracy.
              </p>
            </div>
            <div className="w-1.5 h-12 bg-medical-primary absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-md" />
          </div>

          <div className="p-8 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between group hover:border-medical-primary/30 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-medical-accent/15 border border-medical-accent/20 flex items-center justify-center text-medical-accentLight mb-6 shadow-glow-primary">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-3">
                Explainable AI Heatmaps
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Generates Grad-CAM activation overlays pinpointing exact cell structures and anomalies contributing to the classification confidence.
              </p>
            </div>
            <div className="w-1.5 h-12 bg-medical-accent absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-md" />
          </div>

          <div className="p-8 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between group hover:border-medical-primary/30 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-glow-success">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-3">
                Clinician Data Isolation
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Secure JWT-gated workflows. Medical profiles, patient records, and analysis logs are strictly segregated so doctors only access their authorized cases.
              </p>
            </div>
            <div className="w-1.5 h-12 bg-emerald-500 absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-md" />
          </div>

        </div>

        {/* Statistical Performance Highlights */}
        <div className="w-full max-w-5xl rounded-2xl glass-panel p-8 border border-white/5 hover:border-medical-primary/20 hover:shadow-glow-primary flex flex-col md:flex-row items-center justify-around gap-8 mb-20 text-center transition-all duration-300">
          <div>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">99.2%</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-1">Model Accuracy</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">&lt; 3.0s</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-1">Inference Time</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">100%</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-1">Clinician Isolation</div>
          </div>
        </div>

        {/* About TumorTrace Section */}
        <div className="w-full max-w-5xl text-left border border-white/5 bg-[#0e1322]/20 rounded-2xl p-8 md:p-12 mb-20 relative overflow-hidden backdrop-blur-sm hover:border-medical-accent/25 transition-colors duration-300">
          <div className="absolute w-[300px] h-[300px] rounded-full bg-medical-accent opacity-[0.02] blur-[80px] -bottom-32 -right-32 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/3">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-medical-accentLight uppercase tracking-widest bg-medical-accent/10 px-2.5 py-1 rounded-md border border-medical-accent/25 mb-4">
                <Sparkles className="w-3 h-3" /> About the Platform
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight mb-4">
                Empowering Digital Pathology
              </h2>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                TumorTrace bridges the gap between complex deep learning models and clinical safety, offering instant diagnostic double-checks directly at the workstation.
              </p>
            </div>
            
            <div className="md:w-2/3 grid sm:grid-cols-2 gap-6 text-xs font-light text-slate-300">
              <div className="flex flex-col gap-2 p-5 rounded-xl bg-white/[0.01] border border-white/5">
                <span className="font-display font-bold text-white text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-medical-primaryLight" />
                  ResNet50 Architecture
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Our classification model utilizes deep convolutional neural networks optimized to identify micro-anomalies in histopathological tissue layouts, distinguishing between malignant and benign structures.
                </p>
              </div>

              <div className="flex flex-col gap-2 p-5 rounded-xl bg-white/[0.01] border border-white/5">
                <span className="font-display font-bold text-white text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-medical-accentLight" />
                  Grad-CAM Saliency
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Rather than functioning as a black-box, TumorTrace generates backpropagated activation maps, highlighting cells and regions that contributed most to the AI classifier's diagnosis.
                </p>
              </div>

              <div className="flex flex-col gap-2 p-5 rounded-xl bg-white/[0.01] border border-white/5">
                <span className="font-display font-bold text-white text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Pathologist in the Loop
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Designed as an assistive technology. AI outcomes help order and pre-screen slide queues, ensuring pathologists spend their focus on complex cases while minimizing human diagnostic oversights.
                </p>
              </div>

              <div className="flex flex-col gap-2 p-5 rounded-xl bg-white/[0.01] border border-white/5">
                <span className="font-display font-bold text-white text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Compliant Data Vault
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Compliant with clinical standards. Pathologist accounts are fully isolated, meaning patient details, diagnostics report histories, and slides are accessible only to the doctor who registered them.
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Clinical Disclaimer & Footer */}
      <footer className="border-t border-white/5 bg-[#0b0e1a]/80 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-medical-primaryLight" />
            <span className="text-xs text-slate-500 font-light max-w-md text-left">
              <strong>Clinical Disclaimer:</strong> TumorTrace is an AI-assisted diagnostic screening utility. Artificial intelligence predictions and visual heatmaps are intended strictly as supportive guidance and must be validated by a certified pathologist before finalized diagnoses.
            </span>
          </div>
          <div className="text-slate-600 text-xs font-light font-sans">
            &copy; {new Date().getFullYear()} TumorTrace. All clinical rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
