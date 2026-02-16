
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
  
  if (id === 'classic' || id === 'executive' || id === 'corporate') {
    return (
      <div className={baseStyles}>
        <div className="p-2 border-[2px]" style={{ borderColor: accentColor }}>
          <div className="h-1 w-1/4 bg-slate-300 mx-auto mb-1" />
          <div className="h-2 w-3/4 mx-auto mb-1" style={{ backgroundColor: accentColor + '40' }} />
          <div className="h-8 w-full bg-slate-100 mb-2 rounded-sm" />
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <div className="h-1 w-full bg-slate-200" />
              <div className="h-1 w-full bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (id === 'magazine' || id === 'editorial') {
    return (
      <div className={baseStyles}>
        <div className="h-1/2 w-full bg-slate-200 relative">
          <div className="absolute bottom-1 right-1 h-2 w-4" style={{ backgroundColor: accentColor }} />
        </div>
        <div className="p-2 space-y-1">
          <div className="h-2 w-full bg-slate-900" />
          <div className="h-1 w-1/2 bg-slate-300" />
        </div>
      </div>
    );
  }

  if (id === 'modern') {
    return (
      <div className={baseStyles + " flex"}>
        <div className="w-3 bg-slate-100 h-full border-r border-slate-200" />
        <div className="flex-1 p-2 space-y-2">
          <div className="h-4 w-full bg-slate-900" />
          <div className="h-12 w-full bg-slate-200 rounded-sm" />
        </div>
      </div>
    );
  }

  if (id === 'gallery') {
    return (
      <div className={baseStyles + " p-2 flex flex-col items-center"}>
        <div className="h-1 w-2 bg-slate-300 mb-2" />
        <div className="h-16 w-full bg-slate-100 border-2 border-slate-200 mb-2" />
        <div className="h-2 w-full bg-slate-900" />
      </div>
    );
  }

  return (
    <div className={baseStyles + " flex flex-col items-center justify-center p-4"}>
      <div className="w-4 h-0.5 mb-2" style={{ backgroundColor: accentColor }} />
      <div className="h-2 w-3/4 bg-slate-900" />
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('welcome');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportGuide, setShowExportGuide] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  
  const [eventData, setEventData] = useState<EventData>({
    title: 'Design Innovation Summit',
    date: 'November 12, 2024',
    location: 'Metropolitan Arts Hub, NYC',
    content: 'An immersive experience exploring the intersection of technology and human-centric design. This summit brings together global visionaries to redefine the future of creativity and social impact in the digital age.',
    highlights: [
      'Generative Art Installations',
      'Future of UX Panel Discussion',
      'Sustainable Product Showcase'
    ],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070',
      scale: 1,
      fit: 'cover',
      position: { x: 50, y: 50 }
    },
    logo: undefined,
    additionalPages: []
  });

  const [config, setConfig] = useState<BulletinConfig>({
    primaryColor: '#4f46e5',
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
    await new Promise(r => setTimeout(r, 2000));

    try {
      const dataUrl = await toPng(exportRef.current, { 
        cacheBust: true, 
        pixelRatio: 4,
        backgroundColor: '#ffffff',
        skipAutoScale: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          borderRadius: '0px'
        }
      });
      
      const link = document.createElement('a');
      link.download = `${eventData.title.replace(/\s+/g, '_')}_Bulletin.png`;
      link.href = dataUrl;
      link.click();
      
      setIsExporting(false);
      setShowExportGuide(true);
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
      alert('High-quality capture failed. Please ensure your images are fully loaded and try again.');
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
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center no-print">
          <div className="relative w-24 h-24 mb-8">
            <Loader2 className="w-full h-full text-indigo-400 animate-spin absolute opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Finalizing Document</h2>
          <p className="text-slate-400 max-w-sm text-sm leading-relaxed font-medium">Generating high-fidelity master assets. This ensures perfect quality in print.</p>
        </div>
      )}

      {showExportGuide && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4 no-print">
           <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
             <div className="p-8 text-center">
               <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 className="text-green-600" size={32}/>
               </div>
               <h3 className="text-2xl font-black text-slate-900 uppercase mb-2">Saved Successfully</h3>
               <p className="text-slate-500 text-sm mb-8">Your professional bulletin has been generated by InstantBulletin.</p>
               <button onClick={() => setShowExportGuide(false)} className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 shadow-xl">Back to Editor</button>
             </div>
           </div>
        </div>
      )}

      <header className="no-print bg-white px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center"></div>

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
          {step !== 'welcome' && (
            <button className="md:hidden p-3 text-slate-600 bg-slate-50 rounded-xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 md:hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
             <div className="flex flex-col gap-3">
                {[
                  { id: 'template', label: 'Layout' },
                  { id: 'edit', label: 'Content' },
                  { id: 'export', label: 'Review' }
                ].map((s, i) => (
                  <button key={s.id} onClick={() => { setStep(s.id as AppStep); setMobileMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${step === s.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === s.id ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>{i + 1}</div>
                    <span className="text-sm uppercase tracking-widest">{s.label}</span>
                  </button>
                ))}
             </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-x-hidden">
        {step === 'welcome' && (
          <section className="flex flex-col items-center justify-center text-center px-6 py-12 md:py-24 max-w-4xl mx-auto">
            <div className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 shadow-sm">
              <Sparkles size={14} /> Professional Design Tool
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-none">
              High-Quality Bulletins <br className="hidden md:block"/><span className="text-indigo-600">Created Instantly.</span>
            </h2>
            <p className="text-slate-500 text-base md:text-xl mb-12 leading-relaxed max-w-2xl font-medium">Create professionally typeset announcements. High-resolution export optimized for printing and high-res brand logos.</p>
            <button onClick={nextStep} className="w-full md:w-auto bg-slate-900 hover:bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 transition-all shadow-2xl group active:scale-95">
              Start Designing <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </section>
        )}

        {step === 'template' && (
          <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
            <div className="mb-12 md:mb-16 text-center">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">Select a Layout</h3>
              <p className="text-sm md:text-base text-slate-500 font-medium">Layouts specifically optimized for high-res logo and content integration without overlap.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { id: 'corporate', name: 'The Corporate', desc: 'Dedicated header space for prominent brand logos.', font: 'sans' },
                { id: 'editorial', name: 'The Editorial', desc: 'Asymmetric artistic layout for creative events.', font: 'serif' },
                { id: 'executive', name: 'The Executive', desc: 'Balanced logo-first corporate aesthetic.', font: 'serif' },
                { id: 'gallery', name: 'The Gallery', desc: 'Bold imagery with minimal signatures.', font: 'sans' },
                { id: 'magazine', name: 'The Feature', desc: 'Editorial hero-focused composition.', font: 'serif' },
                { id: 'classic', name: 'The Classic', desc: 'Timeless symmetrical arrangement.', font: 'serif' },
                { id: 'modern', name: 'The Edge', desc: 'Sleek sidebar-driven tech layout.', font: 'sans' },
                { id: 'minimal', name: 'The Pure', desc: 'Ultra-clean, spacing-focused design.', font: 'sans' }
              ].map((t) => (
                <div key={t.id} onClick={() => { updateConfig({ templateId: t.id as TemplateId, fontFamily: t.font as any }); nextStep(); }} className={`group cursor-pointer bg-white border-2 rounded-[2rem] p-5 md:p-8 transition-all hover:shadow-2xl flex flex-col ${config.templateId === t.id ? 'border-indigo-600 shadow-2xl scale-[1.02]' : 'border-slate-100 hover:border-indigo-200'}`}>
                  <div className="aspect-[1/1.414] bg-slate-50 rounded-3xl mb-6 md:mb-8 overflow-hidden border border-slate-100 p-4 relative group-hover:bg-white transition-colors">
                     <TemplateThumbnail id={t.id as TemplateId} accentColor={config.primaryColor} />
                  </div>
                  <div className="mt-auto">
                    <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{t.name}</h4>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 'edit' && (
          <section className="bg-white border-y border-slate-100 py-10 md:py-16">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 md:mb-16 gap-6">
                <div className="flex items-center gap-4">
                  <button onClick={prevStep} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-indigo-600"><ChevronLeft size={24} /></button>
                  <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Editor Studio</h3>
                </div>
                <button onClick={nextStep} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95">Generate Preview <ChevronRight size={20} /></button>
              </div>
              <EditorPanel eventData={eventData} config={config} onEventUpdate={updateEventData} onConfigUpdate={updateConfig} />
            </div>
          </section>
        )}

        {step === 'export' && (
          <section className="bg-slate-100 py-8 md:py-24 px-2 md:px-6 min-h-screen">
             <div className="no-print max-w-6xl mx-auto mb-12 flex flex-col md:flex-row items-center justify-between gap-8 px-2">
               <div className="flex items-center gap-5 w-full md:w-auto">
                  <button onClick={prevStep} className="p-4 bg-white hover:bg-slate-50 rounded-[1.5rem] shadow-sm text-slate-600 border border-slate-200"><ChevronLeft size={20} /></button>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">Final Master</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Document Review</p>
                  </div>
               </div>
               <div className="flex flex-col items-stretch md:items-end gap-4 w-full md:w-auto">
                 <div className="flex flex-col sm:flex-row gap-4">
                   <button onClick={handleExportPDF} className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-[2rem] font-black shadow-sm transition-all flex items-center justify-center gap-3 border border-slate-200 active:scale-95"><Printer size={20} /> PDF Export</button>
                   <button onClick={handleExportImage} disabled={isExporting} className="px-10 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">{isExporting ? <Loader2 className="animate-spin" size={20}/> : <Download size={20} />} High-Res PNG</button>
                 </div>
               </div>
             </div>

            <div className="max-w-full md:max-w-[850px] mx-auto pb-32 px-1">
              <div ref={exportRef} className="print-area bg-white shadow-2xl rounded-2xl md:rounded-none overflow-hidden transform-gpu">
                <BulletinPreview eventData={eventData} config={config} />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="no-print bg-white border-t border-slate-50 py-10 px-6 text-center">
        <p className="text-[11px] text-slate-900 font-black uppercase tracking-[0.3em] mb-2">InstantBulletin</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bn_Jibril © 2024</p>
      </footer>
    </div>
  );
};

export default App;
