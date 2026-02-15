
import React, { useState } from 'react';
import { Sparkles, Brain, Loader2, Target, ShieldAlert, Calendar } from 'lucide-react';
import { generateReport } from '../services/geminiService';
import { Language } from '../types';
import { getT } from '../translations';

const AIInsights: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = getT(lang);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  
  // Default to past 7 days
  const today = new Date().toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(lastWeek);
  const [endDate, setEndDate] = useState(today);

  const handleGenerate = async () => {
    if (new Date(endDate) < new Date(startDate)) {
      alert(t.periodError);
      return;
    }

    setIsGenerating(true);
    try {
      // Logic to filter real user data would go here. 
      // For now, we simulate logs reflecting the selected duration.
      const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      const mockLogs = lang === 'zh' ? `
        分析區間：${startDate} 至 ${endDate} (共計 ${diffDays} 天)
        訓練記錄：
        - 第 1 天：大重量深蹲 (5x5 @ 100kg), 攝取 2500kcal, 睡眠 7.5h
        - 第 ${Math.ceil(diffDays/2)} 天：核心與中強度有氧, 攝取 2200kcal, 睡眠 8h
        - 最後 1 天：硬舉 (3x3 @ 140kg), 攝取 2800kcal, 睡眠 7.5h
      ` : `
        Period: ${startDate} to ${endDate} (${diffDays} days)
        Training Logs:
        - Day 1: Heavy Squats (5x5 @ 100kg), 2500kcal intake, 7.5h sleep
        - Day ${Math.ceil(diffDays/2)}: Core & moderate cardio, 2200kcal intake, 8h sleep
        - Last Day: Deadlift (3x3 @ 140kg), 2800kcal intake, 7.5h sleep
      `;

      const result = await generateReport(mockLogs, { start: startDate, end: endDate }, lang);
      setReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="w-7 h-7 text-orange-500" /> {t.aiCoach}
        </h2>
      </div>

      {!report && (
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
              <Sparkles className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">{t.performanceReview}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mt-2 px-4">
              {t.aiDescription}
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> {t.selectPeriod}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">{t.startDate}</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-black border border-zinc-800 text-white rounded-lg p-3 text-sm focus:border-orange-500 outline-none transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">{t.endDate}</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-black border border-zinc-800 text-white rounded-lg p-3 text-sm focus:border-orange-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-white hover:bg-zinc-200 text-black py-4 rounded-2xl font-black uppercase tracking-tighter shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 relative z-10"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-orange-500" />}
            {t.generateReport}
          </button>
          
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/5 blur-[50px] rounded-full"></div>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 border-l-4 border-l-orange-500 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> {t.coachAnalysis}
              </h4>
              <span className="text-[10px] text-zinc-500 font-mono">
                {startDate} / {endDate}
              </span>
            </div>
            <div className="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed font-medium">
              {report}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex gap-4 items-start hover:border-zinc-700 transition">
              <Target className="w-6 h-6 text-white shrink-0 mt-1" />
              <div>
                <div className="font-black text-xs uppercase tracking-widest text-zinc-500 mb-1">{t.nextWeekFocus}</div>
                <div className="text-sm text-zinc-300 font-bold italic leading-snug">
                  {lang === 'zh' ? '根據選定期間的表現，建議微調攝取頻率，並維持蛋白質優勢。' : 'Based on your performance, consider adjusting intake frequency while maintaining high protein.'}
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setReport(null)}
            className="w-full py-6 text-zinc-500 hover:text-orange-500 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-[10px]"
          >
            {t.refreshData}
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
