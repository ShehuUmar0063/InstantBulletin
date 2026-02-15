
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
      <div className={`overflow-hidden relative ${className}`}>
        <img 
          src={meta.url} 
          crossOrigin="anonymous"
          className="w-full h-full transition-all duration-300"
          style={{ 
            objectFit: meta.fit, 
            transform: `scale(${meta.scale})`,
            objectPosition: `${meta.position.x}% ${meta.position.y}%` 
          }} 
        />
      </div>
    );
  };

  const LogoSlot = ({ className = "h-12 w-12" }: { className?: string }) => {
    if (!eventData.logo) return null;
    return <RenderImage meta={eventData.logo} className={className} />;
  };

  const DateVenueBar = ({ className = "" }) => (
    <div className={`flex items-center gap-4 md:gap-6 text-gray-500 border-y border-gray-100 py-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar size={14} style={{ color: accentColor }} />
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{eventData.date || 'TBA'}</span>
      </div>
      <div className="w-1 h-1 bg-gray-300 rounded-full" />
      <div className="flex items-center gap-2">
        <MapPin size={14} style={{ color: accentColor }} />
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{eventData.location || 'Online'}</span>
      </div>
    </div>
  );

  const HighlightsList = ({ title = "Highlights", variant = "default" }) => (
    <div className={`p-4 md:p-6 rounded-2xl ${variant === 'magazine' ? 'border-l-4' : 'bg-slate-50'}`} style={{ borderLeftColor: variant === 'magazine' ? accentColor : 'transparent', backgroundColor: variant === 'magazine' ? `${accentColor}08` : undefined }}>
      <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2" style={{ color: accentColor }}>
        <Stars size={16} />
        {title}
      </h3>
      <ul className="space-y-4 md:space-y-5">
        {eventData.highlights.filter(h => h.trim() !== '').map((item, index) => (
          <li key={index} className="flex gap-2 md:gap-3">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: accentColor }} />
            <span className="text-[11px] md:text-xs font-bold text-gray-800 leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderPageWrapper = (children: React.ReactNode, pageNum: number) => (
    <div 
      key={pageNum}
      className={`bg-white shadow-2xl mx-auto w-full max-w-[210mm] aspect-[1/1.414] overflow-hidden transition-all duration-500 ${fontClass} mb-8 md:mb-12 last:mb-0 relative print:shadow-none print:mb-0 print:break-after-page preview-page`}
      style={{ minHeight: 'auto' }}
    >
       {children}
       <div className="absolute bottom-4 right-6 md:bottom-6 md:right-10 text-[9px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest no-print">
          Page {pageNum} / {config.pageCount}
       </div>
    </div>
  );

  const SubPageTemplate = ({ pageNum }: { pageNum: number }) => {
    const pageData = eventData.additionalPages[pageNum - 2];
    if (!pageData) return null;

    const pageImage = pageData.images?.[0];

    return (
      <div className="h-full p-8 md:p-20 flex flex-col relative border-t-[6px] md:border-t-8" style={{ borderTopColor: accentColor }}>
        <header className="mb-8 md:mb-12">
          <div className="flex justify-between items-start mb-4">
             <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-tight flex-1 pr-10" style={{ color: accentColor }}>
              {pageData.title || `Extended Overview — ${pageNum - 1}`}
            </h2>
            <LogoSlot className="h-10 w-10 opacity-40 grayscale" />
          </div>
          <div className="h-0.5 md:h-1 w-12 md:w-20" style={{ backgroundColor: accentColor }} />
        </header>
        <div className="flex-1 grid grid-cols-12 gap-6 md:gap-10">
          <article className="col-span-12 md:col-span-8">
            <p className="text-gray-800 leading-relaxed md:leading-loose text-xs md:text-base whitespace-pre-wrap mb-10">
              {pageData.content || "Detailed supplemental content for this section."}
            </p>
            
            {pageImage && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon size={16} className="text-gray-300" />
                  <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Supplemental Graphic</span>
                </div>
                <RenderImage meta={pageImage} className="aspect-[16/9] rounded-[2rem] shadow-xl grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
            )}
          </article>
          <aside className="hidden md:block col-span-4 opacity-50 grayscale scale-90 origin-top-right">
             <HighlightsList title="Context" />
          </aside>
        </div>
        <footer className="mt-8 md:mt-20 pt-6 md:pt-10 border-t border-gray-100 flex justify-between items-center opacity-30">
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest truncate max-w-[60%]">{eventData.title}</span>
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest italic">Part {pageNum}</span>
        </footer>
      </div>
    );
  };

  const FrontPage = () => {
    const coverImage = eventData.coverImage;

    if (templateId === 'classic') return (
      <div className="h-full border-[6px] md:border-[10px] p-6 md:p-10 flex flex-col relative" style={{ borderColor: accentColor }}>
        <header className="text-center mb-6 md:mb-8 flex flex-col items-center">
          <LogoSlot className="h-16 w-16 mb-6" />
          <div className="inline-block px-3 py-1 text-white text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase mb-3 md:mb-4" style={{ backgroundColor: accentColor }}>Official Event Announcement</div>
          <h1 className="text-2xl md:text-5xl font-black leading-tight uppercase tracking-tight mb-4 md:mb-6" style={{ color: '#111' }}>{eventData.title}</h1>
          <DateVenueBar className="justify-center" />
        </header>
        {coverImage && <RenderImage meta={coverImage} className="mb-6 md:mb-10 aspect-[21/9] rounded-2xl shadow-lg border border-gray-50" />}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 flex-1">
          <article className="flex-1">
            <h2 className="text-sm md:text-lg font-black uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-3">The Narrative<div className="h-px flex-1 bg-gray-100" /></h2>
            <p className="text-gray-700 leading-relaxed text-[11px] md:text-sm font-medium whitespace-pre-wrap">{eventData.content}</p>
          </article>
          <aside className="w-full md:w-64"><HighlightsList /></aside>
        </div>
        <footer className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-100 flex justify-between items-center opacity-40"><span className="text-[9px] md:text-[10px] font-black tracking-widest">EST. 2024</span><div className="w-8 h-8 md:w-10 md:h-10 border-2 flex items-center justify-center font-bold text-xs" style={{ borderColor: accentColor, color: accentColor }}>IB</div></footer>
      </div>
    );

    if (templateId === 'magazine') return (
      <div className="h-full flex flex-col relative bg-white">
        <div className="h-[220px] md:h-[450px] w-full relative bg-slate-100 overflow-hidden">
          {coverImage ? (
            <RenderImage meta={coverImage} className="w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-slate-200" size={48} /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 md:p-10 justify-between">
            <h1 className="text-2xl md:text-6xl font-black text-white uppercase leading-none tracking-tighter drop-shadow-2xl flex-1 pr-6">{eventData.title}</h1>
            <LogoSlot className="h-20 w-20 shadow-2xl rounded-xl border border-white/20" />
          </div>
        </div>
        <div className="p-6 md:p-10 grid grid-cols-12 gap-6 md:gap-10 flex-1">
          <div className="col-span-12 md:col-span-8 flex flex-col">
            <DateVenueBar className="mb-6 md:mb-8" />
            <div className="flex gap-4 mb-4 md:mb-6">
              <Quote size={40} className="opacity-10 shrink-0" style={{ color: accentColor }} />
              <p className="text-sm md:text-lg font-medium leading-relaxed italic text-gray-600 border-l-2 pl-4" style={{ borderColor: accentColor }}>A landmark event showcasing innovation and creative collaboration.</p>
            </div>
            <p className="text-gray-800 leading-relaxed text-[11px] md:text-base whitespace-pre-wrap">{eventData.content}</p>
          </div>
          <div className="hidden md:flex col-span-4 flex-col justify-start">
            <HighlightsList variant="magazine" title="Event Details" />
          </div>
        </div>
      </div>
    );

    if (templateId === 'modern') return (
      <div className="h-full flex bg-white border border-gray-100 shadow-inner overflow-hidden">
        <div className="w-[40px] md:w-[80px] shrink-0 h-full flex flex-col items-center py-6 md:py-10 gap-10 md:gap-20 border-r border-gray-100">
          <LogoSlot className="h-10 w-10 md:h-12 md:w-12" />
          <div className="font-black text-xs md:text-xl rotate-90 whitespace-nowrap tracking-[0.5em] text-gray-300 uppercase">Bulletin</div>
        </div>
        <div className="flex-1 p-6 md:p-12 flex flex-col">
          <header className="mb-8 md:mb-12">
            <div className="flex items-center gap-3 md:gap-4 mb-2">
              <div className="h-0.5 w-8 md:w-12" style={{ backgroundColor: accentColor }} />
              <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-gray-400">Exclusive Record</span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase mb-4 leading-[0.85]">{eventData.title}</h1>
            <DateVenueBar className="border-none p-0 mt-4 md:mt-8" />
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 flex-1">
            <div className="space-y-4 md:space-y-8">
              <p className="text-[11px] md:text-sm font-bold text-gray-500 leading-relaxed whitespace-pre-wrap">{eventData.content}</p>
              {coverImage && (
                <RenderImage meta={coverImage} className="aspect-square grayscale rounded-[2.5rem] shadow-2xl border-4 border-white" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="bg-gray-900 text-white p-6 md:p-10 rounded-[3rem] flex-1 shadow-2xl">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 md:mb-10 text-indigo-400">Main Focus</h3>
                <ul className="space-y-4 md:space-y-8">
                  {eventData.highlights.filter(h => h.trim() !== '').map((item, index) => (
                    <li key={index} className="flex flex-col gap-1 border-b border-white/10 pb-4 last:border-0">
                      <span className="text-[8px] md:text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Index 0{index + 1}</span>
                      <span className="text-[10px] md:text-xs font-bold leading-tight uppercase tracking-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="h-full bg-white p-8 md:p-20 flex flex-col justify-center items-center text-center">
        <div className="max-w-xl flex flex-col items-center">
          <LogoSlot className="h-16 w-16 mb-10" />
          <div className="w-12 md:w-16 h-0.5 md:h-1 mb-6 md:mb-10" style={{ backgroundColor: accentColor }} />
          <h1 className="text-xl md:text-4xl font-black tracking-tight mb-6 md:mb-8 uppercase">{eventData.title}</h1>
          <div className="flex gap-2 md:gap-4 text-[9px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 md:mb-12">
            <span>{eventData.date}</span>
            <span className="opacity-20">/</span>
            <span>{eventData.location}</span>
          </div>
          {coverImage && (
            <RenderImage meta={coverImage} className="w-full grayscale mb-8 md:mb-12 rounded-[2rem] shadow-2xl aspect-[16/10] border border-gray-100" />
          )}
          <p className="text-[11px] md:text-sm font-medium text-gray-500 leading-relaxed md:leading-loose mb-10 md:mb-16 whitespace-pre-wrap">{eventData.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 md:space-y-12 print:space-y-0">
      {renderPageWrapper(<FrontPage />, 1)}
      {Array.from({ length: config.pageCount - 1 }).map((_, i) => 
        renderPageWrapper(<SubPageTemplate pageNum={i + 2} />, i + 2)
      )}
    </div>
  );
};

export default BulletinPreview;
