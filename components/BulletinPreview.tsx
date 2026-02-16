
import React from 'react';
import { Calendar, MapPin, Stars, Quote, Image as ImageIcon } from 'lucide-react';
import { EventData, BulletinConfig, ImageMetadata } from '../types';

interface BulletinPreviewProps {
  eventData: EventData;
  config: BulletinConfig;
}

const BulletinPreview: React.FC<BulletinPreviewProps> = ({ eventData, config }) => {
  const fontClass = config.fontFamily === 'serif' ? 'font-serif' : 'font-sans';
  const accentColor = config.primaryColor;
  const templateId = config.templateId || 'classic';

  const RenderImage = ({ meta, className = "" }: { meta: ImageMetadata | undefined, className?: string }) => {
    if (!meta || !meta.url) return null;
    return (
      <div className={`overflow-hidden relative bg-slate-50 ${className}`}>
        <img 
          src={meta.url} 
          crossOrigin="anonymous"
          decoding="sync"
          className="w-full h-full block antialiased"
          style={{ 
            objectFit: meta.fit, 
            transform: `scale(${meta.scale})`,
            objectPosition: `${meta.position.x}% ${meta.position.y}%`,
            width: '100%',
            height: '100%',
            imageRendering: 'crisp-edges',
          }} 
          alt="Bulletin Visual Asset"
        />
      </div>
    );
  };

  const LogoSlot = ({ className = "h-12 w-12" }: { className?: string }) => {
    if (!eventData.logo) return null;
    return (
      <div className={`${className} flex items-center justify-center overflow-hidden shrink-0`}>
        <RenderImage meta={eventData.logo} className="w-full h-full" />
      </div>
    );
  };

  const DateVenueBar = ({ className = "" }) => (
    <div className={`flex flex-wrap items-center gap-3 md:gap-6 text-gray-500 border-y border-gray-100 py-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar size={14} style={{ color: accentColor }} />
        <span className="text-[10px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap">{eventData.date || 'TBA'}</span>
      </div>
      <div className="hidden md:block w-1.5 h-1.5 bg-gray-200 rounded-full" />
      <div className="flex items-center gap-2">
        <MapPin size={14} style={{ color: accentColor }} />
        <span className="text-[10px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap">{eventData.location || 'Online'}</span>
      </div>
    </div>
  );

  const HighlightsList = ({ title = "Highlights", variant = "default" }) => (
    <div className={`p-5 md:p-8 rounded-[2rem] ${variant === 'magazine' ? 'border-l-4' : 'bg-slate-50'}`} style={{ borderLeftColor: variant === 'magazine' ? accentColor : 'transparent', backgroundColor: variant === 'magazine' ? `${accentColor}12` : undefined }}>
      <h3 className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] mb-6 md:mb-8 flex items-center gap-2" style={{ color: accentColor }}>
        <Stars size={18} />
        {title}
      </h3>
      <ul className="space-y-5">
        {eventData.highlights.filter(h => h.trim() !== '').map((item, index) => (
          <li key={index} className="flex gap-3 md:gap-4">
            <span className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: accentColor }} />
            <span className="text-[12px] md:text-[14px] font-bold text-gray-900 leading-snug tracking-tight">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderPageWrapper = (children: React.ReactNode, pageNum: number) => (
    <div 
      key={pageNum}
      className={`bg-white shadow-none mx-auto w-full max-w-[210mm] aspect-[1/1.414] overflow-hidden transition-all duration-300 ${fontClass} relative print:break-after-page preview-page`}
      style={{ minHeight: 'auto' }}
    >
       {children}
       <div className="absolute bottom-6 right-8 text-[10px] font-black text-gray-200 uppercase tracking-[0.4em] no-print">
          Page 0{pageNum}
       </div>
    </div>
  );

  const SubPageTemplate = ({ pageNum }: { pageNum: number }) => {
    const pageData = eventData.additionalPages[pageNum - 2];
    if (!pageData) return null;
    const pageImage = pageData.images?.[0];

    return (
      <div className="h-full p-10 md:p-24 flex flex-col relative border-t-[8px]" style={{ borderTopColor: accentColor }}>
        <header className="mb-10 flex flex-wrap justify-between items-start gap-6">
          <div className="flex-1 min-w-[200px]">
             <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-4" style={{ color: accentColor }}>
              {pageData.title || `Section 0${pageNum - 1}`}
            </h2>
            <div className="h-1 md:h-1.5 w-16" style={{ backgroundColor: accentColor }} />
          </div>
          <LogoSlot className="h-12 w-12 opacity-30 grayscale" />
        </header>
        <div className="flex-1 grid grid-cols-12 gap-10">
          <article className="col-span-12 md:col-span-8">
            <p className="text-gray-900 leading-relaxed md:leading-loose text-sm md:text-lg font-medium whitespace-pre-wrap mb-10">
              {pageData.content || "Expanded content section for your announcement details."}
            </p>
            {pageImage && (
              <RenderImage meta={pageImage} className="aspect-[16/10] rounded-[2.5rem] shadow-lg mt-8" />
            )}
          </article>
          <aside className="hidden md:block col-span-4 opacity-40 grayscale scale-95 origin-top-right">
             <HighlightsList title="Notes" />
          </aside>
        </div>
      </div>
    );
  };

  const FrontPage = () => {
    const coverImage = eventData.coverImage;

    if (templateId === 'corporate') return (
      <div className="h-full flex flex-col bg-white">
        <header className="bg-gray-50 p-6 md:p-10 border-b-4" style={{ borderBottomColor: accentColor }}>
          <div className="flex justify-between items-center gap-8">
            <LogoSlot className="h-20 w-32" />
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-1">Official Publication</div>
              <div className="text-[12px] font-bold" style={{ color: accentColor }}>{eventData.date}</div>
            </div>
          </div>
        </header>
        <div className="p-10 md:p-16 flex-1 flex flex-col">
          <h1 className="text-4xl md:text-7xl font-black leading-none uppercase tracking-tighter mb-10 text-gray-900 border-l-8 pl-8" style={{ borderLeftColor: accentColor }}>{eventData.title}</h1>
          <div className="grid grid-cols-12 gap-12 flex-1">
            <div className="col-span-12 md:col-span-8">
               {coverImage && <RenderImage meta={coverImage} className="aspect-video rounded-3xl mb-10 shadow-lg" />}
               <p className="text-gray-700 leading-relaxed text-[15px] md:text-xl font-medium whitespace-pre-wrap">{eventData.content}</p>
            </div>
            <div className="col-span-12 md:col-span-4">
               <HighlightsList title="Key Focus" variant="magazine" />
               <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-3">
                 <MapPin size={18} style={{ color: accentColor }} />
                 <span className="text-xs font-black uppercase tracking-widest text-gray-500">{eventData.location}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );

    if (templateId === 'editorial') return (
      <div className="h-full flex flex-col bg-white p-10 md:p-20">
        <div className="flex gap-10 items-end mb-16">
          <LogoSlot className="h-24 w-24 rounded-full border-4 border-slate-50 shadow-sm" />
          <div className="flex-1 border-b border-gray-100 pb-4">
             <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Curated Narrative</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-16">
           <div className="w-full md:w-1/3 flex flex-col">
             <h1 className="text-3xl md:text-6xl font-black leading-[0.8] uppercase tracking-tighter mb-10 text-gray-900 italic">{eventData.title}</h1>
             <DateVenueBar className="border-none p-0 flex-col items-start gap-4 mb-10" />
             <div className="mt-auto">
                <HighlightsList title="Highlights" variant="magazine" />
             </div>
           </div>
           <div className="flex-1 flex flex-col">
              {coverImage && <RenderImage meta={coverImage} className="aspect-[4/5] rounded-[4rem] mb-10 shadow-2xl" />}
              <p className="text-gray-600 leading-[1.8] text-sm md:text-lg font-medium whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-none" style={{ color: '#333' }}>{eventData.content}</p>
           </div>
        </div>
      </div>
    );

    if (templateId === 'executive') return (
      <div className="h-full p-10 md:p-20 flex flex-col bg-white border-t-[12px]" style={{ borderTopColor: accentColor }}>
        <div className="flex justify-between items-center mb-16 gap-10">
          <LogoSlot className="h-20 w-20" />
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Announcement</div>
            <div className="h-1 w-12 bg-gray-100 ml-auto" />
          </div>
        </div>
        <h1 className="text-4xl md:text-7xl font-black leading-[0.9] uppercase tracking-tighter mb-10 text-gray-900">{eventData.title}</h1>
        <DateVenueBar className="mb-12" />
        <div className="flex-1 grid grid-cols-12 gap-12 overflow-hidden">
          <div className="col-span-12 md:col-span-7">
            {coverImage && <RenderImage meta={coverImage} className="aspect-[4/3] rounded-[3rem] mb-10 shadow-2xl" />}
            <p className="text-gray-700 leading-relaxed text-[14px] md:text-xl font-medium whitespace-pre-wrap">{eventData.content}</p>
          </div>
          <div className="col-span-12 md:col-span-5">
            <HighlightsList />
          </div>
        </div>
      </div>
    );

    if (templateId === 'gallery') return (
      <div className="h-full bg-slate-900 flex flex-col relative overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          {coverImage ? <RenderImage meta={coverImage} className="w-full h-full opacity-60" /> : <div className="h-full bg-slate-800" />}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-12">
             <LogoSlot className="h-24 w-24 mb-12 shadow-2xl rounded-3xl bg-white/10 backdrop-blur-md p-4" />
             <h1 className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-8 drop-shadow-2xl">{eventData.title}</h1>
             <div className="h-1.5 w-24 mb-10" style={{ backgroundColor: accentColor }} />
             <div className="flex gap-6 text-white/60 text-xs font-black uppercase tracking-[0.3em]">
               <span>{eventData.date}</span>
               <span>{eventData.location}</span>
             </div>
          </div>
        </div>
        <div className="bg-white p-10 md:p-16 flex flex-col md:flex-row gap-10 items-center">
          <p className="flex-1 text-gray-600 text-sm md:text-lg font-bold leading-relaxed">{eventData.content}</p>
          <div className="w-px h-12 bg-gray-100 hidden md:block" />
          <div className="flex gap-4">
             {eventData.highlights.slice(0, 2).map((h, i) => (
               <div key={i} className="px-4 py-2 border-2 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ borderColor: accentColor, color: accentColor }}>{h}</div>
             ))}
          </div>
        </div>
      </div>
    );

    if (templateId === 'magazine') return (
      <div className="h-full flex flex-col relative bg-white">
        <div className="h-[300px] md:h-[550px] w-full relative bg-slate-200 overflow-hidden shrink-0">
          {coverImage ? <RenderImage meta={coverImage} className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center bg-slate-50" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent p-10 flex flex-wrap items-end justify-between gap-6">
            <h1 className="text-4xl md:text-7xl font-black text-white uppercase leading-[0.85] tracking-tighter flex-1 min-w-[200px]">{eventData.title}</h1>
            <LogoSlot className="h-24 w-24 shadow-2xl rounded-2xl bg-white p-2" />
          </div>
        </div>
        <div className="p-10 md:p-16 flex flex-col md:flex-row gap-12 overflow-hidden">
          <div className="flex-1">
            <DateVenueBar className="mb-10" />
            <p className="text-gray-900 leading-relaxed text-[14px] md:text-xl font-medium whitespace-pre-wrap">{eventData.content}</p>
          </div>
          <aside className="w-full md:w-80">
            <HighlightsList variant="magazine" />
          </aside>
        </div>
      </div>
    );

    if (templateId === 'modern') return (
      <div className="h-full flex bg-white overflow-hidden shadow-inner">
        <div className="w-[60px] md:w-[120px] shrink-0 h-full flex flex-col items-center py-16 gap-24 border-r border-gray-100 bg-slate-50/50">
          <LogoSlot className="h-12 w-12 md:h-16 md:w-16 shadow-md rounded-xl" />
          <div className="font-black text-xs md:text-2xl rotate-90 whitespace-nowrap tracking-[0.5em] text-gray-300 uppercase shrink-0">BULLETIN</div>
        </div>
        <div className="flex-1 p-10 md:p-20 flex flex-col overflow-hidden">
          <header className="mb-12 shrink-0">
            <div className="flex items-center gap-6 mb-4">
              <div className="h-1 w-16" style={{ backgroundColor: accentColor }} />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Master Record</span>
            </div>
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-[0.8] text-gray-900">{eventData.title}</h1>
            <DateVenueBar className="border-none p-0 mt-8" />
          </header>
          <div className="grid grid-cols-12 gap-10 flex-1 overflow-hidden">
            <div className="col-span-12 md:col-span-7 space-y-12">
              <p className="text-lg font-bold text-gray-500 leading-relaxed whitespace-pre-wrap">{eventData.content}</p>
              {coverImage && <RenderImage meta={coverImage} className="aspect-square rounded-[3rem] shadow-xl border-4 border-white" />}
            </div>
            <div className="col-span-12 md:col-span-5">
              <div className="bg-slate-900 text-white p-10 rounded-[3rem] h-full shadow-2xl">
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-10 text-indigo-400">Objectives</h3>
                 <ul className="space-y-6">
                   {eventData.highlights.slice(0, 4).map((h, i) => (
                     <li key={i} className="border-b border-white/5 pb-4">
                       <div className="text-[10px] opacity-30 font-black mb-1">0{i+1}</div>
                       <div className="text-sm font-black uppercase tracking-tight">{h}</div>
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // Default Fallback / Classic
    return (
      <div className="h-full border-[10px] md:border-[16px] p-10 md:p-16 flex flex-col relative" style={{ borderColor: accentColor }}>
        <header className="text-center mb-12 flex flex-col items-center">
          <LogoSlot className="h-20 w-20 mb-10" />
          <div className="inline-block px-4 py-1.5 text-white text-[11px] font-black tracking-[0.3em] uppercase mb-6" style={{ backgroundColor: accentColor }}>Official Event Bulletin</div>
          <h1 className="text-4xl md:text-6xl font-black leading-none uppercase tracking-tighter mb-8 text-black">{eventData.title}</h1>
          <DateVenueBar className="justify-center" />
        </header>
        {coverImage && <RenderImage meta={coverImage} className="aspect-[21/9] rounded-3xl shadow-xl border border-gray-50 mb-12" />}
        <div className="flex-1 flex flex-col md:flex-row gap-16 overflow-hidden">
          <article className="flex-1">
            <p className="text-gray-800 leading-relaxed text-lg font-medium whitespace-pre-wrap">{eventData.content}</p>
          </article>
          <aside className="w-full md:w-72 shrink-0">
            <HighlightsList />
          </aside>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-0 bg-white antialiased">
      {renderPageWrapper(<FrontPage />, 1)}
      {Array.from({ length: config.pageCount - 1 }).map((_, i) => 
        renderPageWrapper(<SubPageTemplate pageNum={i + 2} />, i + 2)
      )}
    </div>
  );
};

export default BulletinPreview;
