
import React from 'react';
import { X, Share2, CheckCircle, Trophy, TrendingUp, Calendar, Zap, Download } from 'lucide-react';
import { Language, WorkoutSession } from '../types';
import { getT } from '../translations';

interface PublishModalProps {
  lang: Language;
  onClose: () => void;
  workoutData: WorkoutSession | null;
}

const PublishModal: React.FC<PublishModalProps> = ({ lang, onClose, workoutData }) => {
  const t = getT(lang);

  // Calculate stats
  const totalVolume = workoutData?.exercises.reduce((acc, ex) => 
    acc + ex.sets.reduce((sAcc, set) => sAcc + (set.completed ? (set.weight * set.reps) : 0), 0)
  , 0) || 0;

  const totalSets = workoutData?.exercises.reduce((acc, ex) => 
    acc + ex.sets.filter(s => s.completed).length, 0
  ) || 0;

  const handleFinalPublish = () => {
    // In a real app: API call to save to database
    alert(t.publishSuccess);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideDown flex flex-col">
        {/* Modal Header */}
        <div className="p-6 flex justify-between items-center border-b border-zinc-800">
          <h3 className="text-xl font-black italic text-white uppercase tracking-tighter flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" /> {t.publishTitle}
          </h3>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {/* Shareable Card Preview */}
          <div id="share-card" className="relative aspect-[4/5] w-full bg-gradient-to-br from-orange-600 to-orange-900 rounded-[2rem] p-8 flex flex-col justify-between shadow-2xl overflow-hidden group">
            {/* Branding */}
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-orange-600 w-5 h-5" strokeWidth={3} />
                </div>
                <span className="text-white font-black italic tracking-tighter text-lg">{lang === 'zh' ? '想進步' : 'PROGRESS'}</span>
              </div>
              <div className="text-orange-200/50 text-[10px] font-black uppercase tracking-widest">
                {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Main Stats */}
            <div className="relative z-10 space-y-4">
              <div className="space-y-0">
                <div className="text-orange-200/70 text-[10px] font-black uppercase tracking-widest">{workoutData?.type}</div>
                <div className="text-5xl font-black italic text-white tracking-tighter leading-none uppercase">
                  Session<br/>Complete
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <div className="text-orange-200/50 text-[10px] font-black uppercase tracking-widest">{t.totalVolume}</div>
                  <div className="text-2xl font-black text-white italic">{totalVolume} <span className="text-xs uppercase">kg</span></div>
                </div>
                <div>
                  <div className="text-orange-200/50 text-[10px] font-black uppercase tracking-widest">{t.totalSets}</div>
                  <div className="text-2xl font-black text-white italic">{totalSets} <span className="text-xs uppercase">sets</span></div>
                </div>
              </div>
            </div>

            {/* Quote/Congrats */}
            <div className="relative z-10">
              <p className="text-white font-bold italic text-sm leading-tight opacity-90">
                "{t.congrats}"
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 blur-[60px] rounded-full -ml-10 -mb-10"></div>
            <Zap className="absolute bottom-10 right-8 w-24 h-24 text-white/10 rotate-12" fill="currentColor" />
          </div>

          <p className="text-zinc-500 text-[10px] font-bold text-center uppercase tracking-widest px-4">
            這張卡片將保存至您的進步牆並開放給教練查看
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-black/40 border-t border-zinc-800 space-y-3">
          <button 
            onClick={handleFinalPublish}
            className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase tracking-tighter rounded-2xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> {t.confirmPublish}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition">
              <Download className="w-4 h-4" /> Save
            </button>
            <button className="py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
