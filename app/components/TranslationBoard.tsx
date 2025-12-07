import React, { useEffect, useRef } from 'react';
import { useStore, TranscriptSegment } from '../store/useStore';

export const TranslationBoard: React.FC = () => {
  const { segments, currentText, currentTranslation } = useStore();
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments, currentText, currentTranslation]);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto h-full p-4 overflow-y-auto scrollbar-hide space-y-6">
      {/* History Segments */}
      {segments.map((seg) => (
        <SegmentItem key={seg.id} segment={seg} />
      ))}

      {/* Current Active Segment */}
      {(currentText || currentTranslation) && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
           <div className="p-6 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 backdrop-blur-sm">
             {/* Source */}
             <p className="text-3xl md:text-4xl font-medium text-zinc-100 leading-relaxed tracking-wide opacity-90">
               {currentText}
               <span className="inline-block w-2.5 h-6 ml-2 bg-indigo-500 animate-pulse rounded-full align-middle"/>
             </p>
             
             {/* Translation Preview */}
             {currentTranslation && (
                 <p className="mt-4 text-2xl md:text-3xl font-light text-indigo-300 leading-relaxed font-serif">
                   {currentTranslation}
                 </p>
             )}
           </div>
        </div>
      )}

      <div ref={endRef} className="h-4" />
    </div>
  );
};

// Sub-component for individual completed segments
const SegmentItem = ({ segment }: { segment: TranscriptSegment }) => {
  return (
    <div className="group p-6 rounded-2xl hover:bg-zinc-800/20 transition-colors border border-transparent hover:border-zinc-800/50">
      <p className="text-3xl md:text-4xl font-medium text-zinc-300 leading-relaxed tracking-wide mb-3">
        {segment.text}
      </p>
      <p className="text-2xl md:text-3xl font-light text-indigo-400/90 leading-relaxed font-serif">
        {segment.translation}
      </p>
    </div>
  );
};
