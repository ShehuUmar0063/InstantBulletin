
import React from 'react';
import { 
  Palette, 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  ImageIcon,
  Layout,
  ZoomIn,
  RefreshCcw,
  MoveHorizontal,
  MoveVertical
} from 'lucide-react';
import { EventData, BulletinConfig, EventPage, ImageMetadata } from '../types';

interface EditorPanelProps {
  eventData: EventData;
  config: BulletinConfig;
  onEventUpdate: (updates: Partial<EventData>) => void;
  onConfigUpdate: (updates: Partial<BulletinConfig>) => void;
}

const PRESET_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#334155' },
  { name: 'Violet', value: '#7c3aed' },
];

const EditorPanel: React.FC<EditorPanelProps> = ({ eventData, config, onEventUpdate, onConfigUpdate }) => {
  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...eventData.highlights];
    newHighlights[index] = value;
    onEventUpdate({ highlights: newHighlights });
  };

  const addHighlight = () => {
    onEventUpdate({ highlights: [...eventData.highlights, ''] });
  };

  const removeHighlight = (index: number) => {
    onEventUpdate({ highlights: eventData.highlights.filter((_, i) => i !== index) });
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, pageIdx: number | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const metadata: ImageMetadata = {
          url: reader.result as string,
          scale: 1,
          fit: 'cover',
          position: { x: 50, y: 50 }
        };

        if (pageIdx === 'cover') {
          onEventUpdate({ coverImage: metadata });
        } else {
          const newPages = [...eventData.additionalPages];
          newPages[pageIdx] = { 
            ...newPages[pageIdx], 
            images: [metadata]
          };
          onEventUpdate({ additionalPages: newPages });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateImageMeta = (pageIdx: number | 'cover', updates: Partial<ImageMetadata>) => {
    if (pageIdx === 'cover') {
      onEventUpdate({ coverImage: { ...eventData.coverImage!, ...updates } });
    } else {
      const newPages = [...eventData.additionalPages];
      const currentImg = newPages[pageIdx].images[0];
      if (currentImg) {
        newPages[pageIdx] = { 
          ...newPages[pageIdx], 
          images: [{ ...currentImg, ...updates }] 
        };
        onEventUpdate({ additionalPages: newPages });
      }
    }
  };

  const removeImage = (pageIdx: number | 'cover') => {
    if (pageIdx === 'cover') {
      onEventUpdate({ coverImage: undefined });
    } else {
      const newPages = [...eventData.additionalPages];
      newPages[pageIdx] = { ...newPages[pageIdx], images: [] };
      onEventUpdate({ additionalPages: newPages });
    }
  };

  const ControlGroup = ({ label, icon: Icon, min, max, value, onChange }: any) => (
    <div className="flex items-center gap-3">
      <Icon size={12} className="text-slate-400 shrink-0" />
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={label === 'Zoom' ? '0.1' : '1'} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-indigo-600 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer"
      />
      <span className="text-[9px] font-mono font-bold text-slate-500 w-6 text-right">
        {label === 'Zoom' ? `${Math.round(value * 100)}%` : `${Math.round(value)}%`}
      </span>
    </div>
  );

  const ImageController = ({ meta, pageIdx }: { meta: ImageMetadata, pageIdx: number | 'cover' }) => (
    <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => updateImageMeta(pageIdx, { fit: 'cover' })}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${meta.fit === 'cover' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Fill
          </button>
          <button 
            onClick={() => updateImageMeta(pageIdx, { fit: 'contain' })}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${meta.fit === 'contain' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Fit
          </button>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => updateImageMeta(pageIdx, { scale: 1, position: { x: 50, y: 50 } })}
            className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg border border-slate-200"
            title="Reset All"
           >
             <RefreshCcw size={14} />
           </button>
           <button 
            onClick={() => removeImage(pageIdx)}
            className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors rounded-lg border border-red-100"
           >
             <Trash2 size={14} />
           </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <ControlGroup 
          label="Zoom" 
          icon={ZoomIn} 
          min="0.5" 
          max="3" 
          value={meta.scale} 
          onChange={(val: number) => updateImageMeta(pageIdx, { scale: val })} 
        />
        <ControlGroup 
          label="Pan X" 
          icon={MoveHorizontal} 
          min="0" 
          max="100" 
          value={meta.position.x} 
          onChange={(val: number) => updateImageMeta(pageIdx, { position: { ...meta.position, x: val } })} 
        />
        <ControlGroup 
          label="Pan Y" 
          icon={MoveVertical} 
          min="0" 
          max="100" 
          value={meta.position.y} 
          onChange={(val: number) => updateImageMeta(pageIdx, { position: { ...meta.position, y: val } })} 
        />
      </div>
    </div>
  );

  const MediaSlot = ({ pageIdx, label }: { pageIdx: number | 'cover', label: string }) => {
    const currentMeta = pageIdx === 'cover' ? eventData.coverImage : eventData.additionalPages[pageIdx]?.images?.[0];
    const inputId = `media-input-${pageIdx}`;

    return (
      <div className="space-y-3">
        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
        <div 
          className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 bg-white group cursor-pointer hover:border-indigo-400 transition-all shadow-inner"
          onClick={() => !currentMeta && document.getElementById(inputId)?.click()}
        >
          {currentMeta ? (
            <div className="relative w-full h-full overflow-hidden bg-slate-100">
               <img 
                src={currentMeta.url} 
                className="w-full h-full transition-transform duration-200 origin-center pointer-events-none"
                style={{ 
                  objectFit: currentMeta.fit, 
                  transform: `scale(${currentMeta.scale})`,
                  objectPosition: `${currentMeta.position.x}% ${currentMeta.position.y}%` 
                }} 
               />
               <div 
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                onClick={() => document.getElementById(inputId)?.click()}
               >
                 <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/20">Replace Asset</span>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-300">
                <ImageIcon size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Drag media or Click<br/><span className="text-[9px] opacity-60">Professional Framing Enabled</span></span>
            </div>
          )}
          <input id={inputId} type="file" accept="image/*" onChange={(e) => handleMediaUpload(e, pageIdx)} className="hidden" />
        </div>
        {currentMeta && <ImageController meta={currentMeta} pageIdx={pageIdx} />}
      </div>
    );
  };

  const handleAdditionalPageChange = (index: number, field: keyof EventPage, value: string) => {
    const newPages = [...eventData.additionalPages];
    newPages[index] = { ...newPages[index], [field]: value };
    onEventUpdate({ additionalPages: newPages });
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-12">
      <div className="lg:col-span-4 space-y-6 md:space-y-10 order-2 lg:order-1">
        <div>
          <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
            <Layout size={14} /> Studio Config
          </label>
          <div className="space-y-8 bg-slate-50 p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-3">Total Page Count</label>
              <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200">
                {[1, 2, 3, 4].map(num => (
                  <button 
                    key={num}
                    onClick={() => onConfigUpdate({ pageCount: num })}
                    className={`flex-1 py-2.5 text-[10px] md:text-xs font-black rounded-xl transition-all ${config.pageCount === num ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-4">Brand Accent</label>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onConfigUpdate({ primaryColor: color.value })}
                    className={`h-10 w-full rounded-xl transition-all relative flex items-center justify-center shadow-sm ${
                      config.primaryColor.toLowerCase() === color.value.toLowerCase() 
                        ? 'ring-2 ring-offset-2 ring-indigo-400 scale-95' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
                <div className="relative h-10 w-full">
                  <input 
                    type="color" 
                    value={config.primaryColor}
                    onChange={(e) => onConfigUpdate({ primaryColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-white"><Plus size={16} className="text-slate-400"/></div>
                </div>
              </div>
            </div>

            <MediaSlot pageIdx="cover" label="Main Front Page Media" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-12 md:space-y-16 order-1 lg:order-2">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-slate-900 text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-md">P1</span>
            <h4 className="text-[11px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Front Cover Metadata</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Title</label>
              <input 
                type="text" 
                value={eventData.title}
                onChange={(e) => onEventUpdate({ title: e.target.value })}
                placeholder="The Event Name..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-base font-black text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Calendar size={12} /> Date String
              </label>
              <input 
                type="text" 
                value={eventData.date}
                onChange={(e) => onEventUpdate({ date: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <MapPin size={12} /> Venue Label
              </label>
              <input 
                type="text" 
                value={eventData.location}
                onChange={(e) => onEventUpdate({ location: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cover Summary</label>
            <textarea 
              value={eventData.content}
              onChange={(e) => onEventUpdate({ content: e.target.value })}
              className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-100 outline-none resize-none text-sm text-slate-700 font-medium leading-relaxed"
              placeholder="Tell the core story of your event..."
            />
          </div>
        </section>

        {config.pageCount > 1 && (
          <div className="space-y-12">
            {Array.from({ length: config.pageCount - 1 }).map((_, idx) => (
              <section key={idx} className="space-y-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="bg-indigo-600 text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-md">P{idx + 2}</span>
                  <h4 className="text-[11px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Extended Narrative {idx + 1}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Section Headline</label>
                      <input 
                        type="text" 
                        value={eventData.additionalPages[idx]?.title || ''}
                        onChange={(e) => handleAdditionalPageChange(idx, 'title', e.target.value)}
                        placeholder="e.g. Schedule of Activities"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 outline-none text-sm font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Body Details</label>
                      <textarea 
                        value={eventData.additionalPages[idx]?.content || ''}
                        onChange={(e) => handleAdditionalPageChange(idx, 'content', e.target.value)}
                        className="w-full h-48 px-5 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-100 outline-none resize-none text-sm text-slate-700 font-medium leading-loose"
                        placeholder="Provide more in-depth information for this page..."
                      />
                    </div>
                  </div>
                  
                  <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <MediaSlot pageIdx={idx} label={`Page ${idx + 2} Visualization`} />
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        <section className="pb-12">
          <div className="flex justify-between items-center mb-6">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dynamic Bullet Points</label>
            <button onClick={addHighlight} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-colors">
              <Plus size={14} /> New Item
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventData.highlights.map((h, i) => (
              <div key={i} className="relative group">
                <input 
                  type="text" 
                  value={h}
                  onChange={(e) => handleHighlightChange(i, e.target.value)}
                  className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none text-xs font-bold text-slate-700"
                />
                <button onClick={() => removeHighlight(i)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors p-1.5"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditorPanel;
