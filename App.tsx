
import React, { useState, useCallback, useRef } from 'react';
import { 
  Image as ImageIcon, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2,
  FileText,
  Menu,
  X,
  Loader2,
  Smartphone,
  Download,
  Printer
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { EventData, BulletinConfig, TemplateId } from './types';
import EditorPanel from './components/EditorPanel';
import BulletinPreview from './components/BulletinPreview';

type AppStep = 'welcome' | 'template' | 'edit' | 'export';

const TemplateThumbnail: React.FC<{ id: TemplateId, accentColor: string }> = ({ id, accentColor }) => {
  const baseStyles = "w-full h-full relative overflow-hidden bg-white border border-slate-200 shadow-sm transition-transform group-hover:scale-[1.03]";
  
  if (id === 'classic') {
    return (
      <div className={baseStyles}>
        <div className="p-2 border-[2px]" style={{ borderColor: accentColor }}>
          <div className="h-1 w-1/3 bg-slate-300 mx-auto mb-1" />
          <div className="h-3 w-3/4 mx-auto mb-1" style={{ backgroundColor: accentColor + '40' }} />
          <div className="h-1 w-1/2 bg-slate-200 mx-auto mb-2" />
          <div className="h-10 w-full bg-slate-100 mb-2 rounded-sm" />
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <div className="h-1 w-full bg-slate-200" />
              <div className="h-1 w-full bg-slate-200" />
              <div className="h-1 w-2/3 bg-slate-200" />
            </div>
            <div className="w-1/3 h-12 bg-slate-50 rounded-sm border border-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (id === 'magazine') {
    return (
      <div className={baseStyles}>
        <div className="h-1/3 w-full bg-slate-200 relative">
          <div className="absolute bottom-1 left-1 h-3 w-3/4" style={{ backgroundColor: accentColor }} />
        </div>
        <div className="p-2 space-y-2">
          <div className="h-1 w-1/2 bg-slate-300" />
          <div className="h-2 w-full bg-slate-100 rounded-sm" style={{ borderLeft: `2px solid ${accentColor}` }} />
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <div className="h-1 w-full bg-slate-200" />
              <div className="h-1 w-full bg-slate-200" />
              <div className="h-1 w-1/2 bg-slate-200" />
            </div>
            <div className="w-1/4 h-10 bg-slate-50 rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (id === 'modern') {
    return (
      <div className={baseStyles + " flex"}>
        <div className="w-4 bg-slate-100 border-r border-slate-200 h-full flex flex-col items-center py-2 gap-2">
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
          <div className="w-1 h-1 rounded-full bg-slate-300" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          <div className="h-1 w-4" style={{ backgroundColor: accentColor }} />
          <div className="h-6 w-full bg-slate-900 rounded-sm" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="h-1 w-full bg-slate-300" />
              <div className="h-8 w-full bg-slate-200 rounded-sm" />
            </div>
            <div className="h-16 bg-slate-800 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (id === 'minimal') {
    return (
      <div className={baseStyles + " flex flex-col items-center justify-center p-4"}>
        <div className="w-4 h-0.5 mb-4" style={{ backgroundColor: accentColor }} />
        <div className="h-2 w-3/4 bg-slate-900 mb-2" />
        <div className="h-1 w-1/2 bg-slate-300 mb-6" />
        <div className="h-12 w-full bg-slate-50 border border-slate-100 mb-6" />
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="h-1 bg-slate-200" />
          <div className="h-1 bg-slate-200" />
          <div className="h-1 bg-slate-200" />
        </div>
      </div>
    );
  }

  return null;
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('welcome');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportGuide, setShowExportGuide] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  
  const [eventData, setEventData] = useState<EventData>({
    title: 'The Annual Tech Summit 2024',
    date: 'October 24, 2024',
    location: 'Grand Convention Center, San Francisco',
    content: 'Join us for a day of innovation, networking, and groundbreaking announcements. This year\'s summit brings together the brightest minds in software engineering and artificial intelligence to discuss the future of the digital landscape.',
    highlights: [
      'Interactive AI Workshops',
      'Networking Gala with Industry Leaders',
      'Exclusive Product Reveal'
    ],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?auto=format&fit=crop&q=80&w=2070',
      scale: 1,
      fit: 'cover',
      position: { x: 50, y: 50 }
    },
    logo: undefined,
    additionalPages: []
  });

  const [config, setConfig] = useState<BulletinConfig>({
    primaryColor: '#3b82f6',
    fontFamily: 'serif',
    templateId: 'classic',
    pageCount: 1
  });

  const updateEventData = (updates: Partial<EventData>) => setEventData(prev => ({ ...prev, ...updates }));
  const updateConfig = (updates: Partial<BulletinConfig>) => {
    if (updates.pageCount !== undefined && updates.pageCount > config.pageCount) {
      const newPagesCount = updates.pageCount - 1;
      const currentAdditional = [...eventData.additionalPages];
      while (currentAdditional.length < newPagesCount) {
        currentAdditional.push({ 
          content: '', 
          images: [] 
        });
      }
      updateEventData({ additionalPages: currentAdditional });
    }
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleExportImage = useCallback(async () => {
    if (exportRef.current === null) return;
    
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 600));

    try {
      const dataUrl = await toPng(exportRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${eventData.title || 'Bulletin'}.png`;
      link.href = dataUrl;
      link.click();
      
      setIsExporting(false);
      setShowExportGuide(true);
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
    }
  }, [eventData.title]);

  const handleExportPDF = () => {
    const originalTitle = document.title;
    document.title = eventData.title || 'Bulletin';
    window.print();
    document.title = originalTitle;
  };

  const nextStep = () => {
    if (step === 'welcome') setStep('template');
    else if (step === 'template') setStep('edit');
    else if (step === 'edit') setStep('export');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    if (step === 'template') setStep('welcome');
    else if (step === 'edit') setStep('template');
    else if (step === 'export') setStep('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {isExporting && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center no-print">
          <div className="relative w-20 h-20 mb-6">
            <Loader2 className="w-full h-full text-indigo-500 animate-spin absolute" />
            <ImageIcon className="w-10 h-10 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Capturing Image</h2>
          <p className="text-slate-400 max-w-xs text-sm leading-relaxed">Rendering your high-resolution bulletin. Please stay on this screen.</p>
        </div>
      )}

      {showExportGuide && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4 no-print">
           <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
             <div className="p-6 md:p-8">
               <div className="flex justify-between items-start mb-6">
                 <h3 className="text-xl font-black text-slate-900 uppercase">Export Complete</h3>
                 <button onClick={() => setShowExportGuide(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
               </div>
               
               <div className="bg-green-50 p-4 rounded-2xl flex gap-4 mb-6">
                  <CheckCircle2 className="text-green-600 shrink-0" size={24}/>
                  <div>
                    <p className="font-bold text-slate-900 text-sm mb-1">Download Started</p>
                    <p className="text-xs text-slate-500 leading-relaxed">Your PNG image is downloading. Check your "Downloads" folder.</p>
                  </div>
               </div>
               
               <button 
                onClick={() => setShowExportGuide(false)}
                className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-800 transition-colors"
               >
                 Got it!
               </button>
             </div>
           </div>
        </div>
      )}

      <header className="no-print bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg shrink-0">
            <FileText size={20} />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base md:text-lg font-bold text-slate-900 leading-none truncate">InstantBulletin</h1>
            <p className="text-[9px] md:text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-bold">Studio Engine</p>
          </div>
        </div>

        {step !== 'welcome' && (
          <nav className="hidden md:flex items-center gap-8">
            {[
              { id: 'template', label: 'Layout' },
              { id: 'edit', label: 'Content' },
              { id: 'export', label: 'Review' }
            ].map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.id ? 'bg-indigo-600 text-white shadow-lg' : 
                  (['template', 'edit', 'export'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400')
                }`}>
                  {['template', 'edit', 'export'].indexOf(step) > i ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${step === s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                  {s.label}
                </span>
                {i < 2 && <div className="w-8 h-px bg-slate-200 ml-2" />}
              </div>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2 md:gap-3">
          {step === 'welcome' && (
            <button 
              onClick={nextStep}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap"
            >
              Get Started
            </button>
          )}
          {step !== 'welcome' && (
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 md:hidden shadow-xl z-50">
             <div className="flex flex-col gap-4">
                {[
                  { id: 'template', label: 'Layout' },
                  { id: 'edit', label: 'Content' },
                  { id: 'export', label: 'Review' }
                ].map((s, i) => (
                  <button 
                    key={s.id}
                    onClick={() => {
                      setStep(s.id as AppStep);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${step === s.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === s.id ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                      {i + 1}
                    </div>
                    <span className="font-bold text-sm uppercase tracking-widest">{s.label}</span>
                  </button>
                ))}
             </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-x-hidden">
        {step === 'welcome' && (
          <section className="flex flex-col items-center justify-center text-center px-6 py-12 md:py-20 max-w-4xl mx-auto">
            <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles size={14} /> Design Your Narrative
            </div>
            <h2 className="text-3xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Professional Event Bulletins <br className="hidden md:block"/><span className="text-indigo-600">Generated Instantly.</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-xl mb-10 md:text-xl leading-relaxed max-w-2xl">
              Create beautifully typeset, printable announcements for your events. 
              High-resolution image or PDF export for easy sharing and printing.
            </p>
            <button 
              onClick={nextStep}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-200 group active:scale-95"
            >
              Create My Bulletin
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </section>
        )}

        {step === 'template' && (
          <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="mb-8 md:mb-10 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Choose Your Layout</h3>
              <p className="text-sm md:text-base text-slate-500">Pick a primary style for your multi-page bulletin</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                { id: 'classic', name: 'The Classic', desc: 'Centered header with side highlights.', font: 'serif' },
                { id: 'magazine', name: 'The Feature', desc: 'Large hero image with bold sidebar.', font: 'serif' },
                { id: 'modern', name: 'The Edge', desc: 'Asymmetrical layout for tech & arts.', font: 'sans' },
                { id: 'minimal', name: 'The Pure', desc: 'Focused on clean lines and whitespace.', font: 'sans' }
              ].map((t) => (
                <div 
                  key={t.id}
                  onClick={() => {
                    updateConfig({ 
                      templateId: t.id as TemplateId,
                      fontFamily: t.font as any
                    });
                    nextStep();
                  }}
                  className={`group cursor-pointer bg-white border-2 rounded-3xl p-4 md:p-6 transition-all hover:shadow-2xl flex flex-col ${
                    config.templateId === t.id ? 'border-indigo-600 shadow-xl shadow-indigo-50 scale-[1.02]' : 'border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="aspect-[1/1.414] bg-slate-50 rounded-2xl mb-4 md:mb-6 overflow-hidden border border-slate-100 p-3 md:p-4 relative group-hover:bg-white transition-colors">
                     <TemplateThumbnail id={t.id as TemplateId} accentColor={config.primaryColor} />
                  </div>
                  <div className="mt-auto">
                    <h4 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{t.name}</h4>
                    <p className="text-[11px] md:text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 'edit' && (
          <section className="bg-white border-y border-slate-200 py-8 md:py-12">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                    <ChevronLeft size={24} />
                  </button>
                  <h3 className="text-xl md:text-3xl font-bold text-slate-900">Craft Your Message</h3>
                </div>
                <button 
                  onClick={nextStep}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                  Generate Preview <ChevronRight size={18} />
                </button>
              </div>
              <EditorPanel 
                eventData={eventData} 
                config={config} 
                onEventUpdate={updateEventData} 
                onConfigUpdate={updateConfig} 
              />
            </div>
          </section>
        )}

        {step === 'export' && (
          <section className="bg-slate-200 py-8 md:py-20 px-4 md:px-6 min-h-screen">
             <div className="no-print max-w-6xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4 w-full md:w-auto">
                  <button onClick={prevStep} className="p-3 bg-white hover:bg-slate-50 rounded-2xl shadow-sm text-slate-600 transition-all border border-slate-300">
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold text-slate-900 leading-tight">Final Review</h3>
                    <p className="text-[10px] md:text-sm text-slate-600">{config.pageCount} page{config.pageCount > 1 ? 's' : ''} ready</p>
                  </div>
               </div>
               <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto">
                 <div className="flex flex-col md:flex-row gap-3">
                   <button 
                    onClick={handleExportPDF}
                    className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 border border-slate-300"
                   >
                     <Printer size={18} /> Export as PDF
                   </button>
                   <button 
                    onClick={handleExportImage} 
                    disabled={isExporting}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                   >
                     {isExporting ? <Loader2 className="animate-spin" size={18}/> : <Download size={18} />}
                     Export as Image
                   </button>
                 </div>
                 <div className="bg-white/80 p-3 rounded-xl flex items-start gap-3 border border-slate-300 shadow-sm">
                    <Smartphone size={20} className="text-indigo-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] md:text-[11px] text-slate-700 font-bold leading-tight">
                       Choose Image or PDF for final output.
                    </p>
                 </div>
               </div>
             </div>

            <div className="max-w-full md:max-w-[850px] mx-auto pb-20">
              <div ref={exportRef} className="print-area bg-white p-2 md:p-0">
                <BulletinPreview eventData={eventData} config={config} />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="no-print bg-white border-t border-slate-100 py-6 px-6 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">InstantBulletin Studio © 2024</p>
      </footer>
    </div>
  );
};

export default App;
