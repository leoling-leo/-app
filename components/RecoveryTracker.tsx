
import React, { useState, useEffect } from 'react';
import { Moon, Heart, Smile, Activity, Battery, Thermometer, Weight, Save, Zap, Brain, Shield, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Language } from '../types';
import { getT } from '../translations';

const mockWeightTrendData = [
  { day: 'Mon', weight: 75.8 },
  { day: 'Tue', weight: 75.4 },
  { day: 'Wed', weight: 75.5 },
  { day: 'Thu', weight: 75.1 },
  { day: 'Fri', weight: 74.9 },
  { day: 'Sat', weight: 74.8 },
  { day: 'Sun', weight: 74.5 },
];

const RecoveryTracker: React.FC<{ lang: Language, selectedDate: string }> = ({ lang, selectedDate }) => {
  const t = getT(lang);
  const [weight, setWeight] = useState<string>("75.0");
  const [soreness, setSoreness] = useState(3);
  const [sleepDur, setSleepDur] = useState(7.5);
  const [sleepQual, setSleepQual] = useState(8);
  const [stress, setStress] = useState(2);
  const [energy, setEnergy] = useState(7);

  // In a real app, fetch subjective/objective recovery data for selectedDate
  useEffect(() => {
    // Mocking weight load from selectedDate
    // setWeight(fetchedWeight);
  }, [selectedDate]);

  // Mock calculation for readiness score
  const readinessScore = Math.round(
    ((10 - soreness) * 2 + sleepDur * 5 + sleepQual * 4 + (10 - stress) * 3 + energy * 3) / 1.5
  );

  const SurveyItem = ({ label, value, min, max, step, onChange, icon: Icon, color }: any) => (
    <div className="space-y-3">
      <div className="flex justify-between text-sm items-center">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-zinc-300 font-medium">{label}</span>
        </div>
        <span className="font-black text-white text-base">{value}{max === 12 ? 'h' : '/10'}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step || 1} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
      />
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* 1. Readiness Score Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black p-6 rounded-3xl border border-zinc-800 shadow-2xl">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.recoveryScore}</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black italic tracking-tighter text-white">{readinessScore}</span>
              <span className="text-orange-500 font-black text-xl italic tracking-tighter">%</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-orange-500 text-black text-[10px] font-black uppercase rounded">Optimal</span>
              <span className="text-zinc-400 text-xs">Based on current metrics</span>
            </div>
          </div>
          <div className="relative">
             <div className="w-24 h-24 rounded-full border-4 border-zinc-800 flex items-center justify-center relative">
                <Battery className={`w-10 h-10 ${readinessScore > 70 ? 'text-orange-500' : 'text-zinc-500'}`} fill="currentColor" fillOpacity={readinessScore/100} />
                {/* SVG Ring for visual juice */}
                <svg className="absolute inset-0 -rotate-90 w-full h-full">
                  <circle 
                    cx="48" cy="48" r="44" 
                    fill="none" stroke="#f97316" strokeWidth="4" 
                    strokeDasharray="276" strokeDashoffset={276 - (276 * readinessScore / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
             </div>
          </div>
        </div>
        {/* Abstract background decor */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 blur-[60px] rounded-full"></div>
      </div>

      {/* 2. Body Weight Input */}
      <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
            <Weight className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{t.dailyWeight}</div>
            <div className="flex items-baseline gap-1">
              <input 
                type="number" 
                value={weight} 
                step="0.1"
                onChange={(e) => setWeight(e.target.value)}
                className="bg-transparent border-none p-0 text-2xl font-black text-white w-20 focus:ring-0 focus:outline-none font-mono"
              />
              <span className="text-sm font-bold text-zinc-500">{lang === 'zh' ? '公斤' : 'kg'}</span>
            </div>
          </div>
        </div>
        <button className="p-3 bg-zinc-800 hover:bg-orange-500 text-zinc-400 hover:text-black rounded-xl transition-all active:scale-90 shadow-lg">
          <Save className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Objective Data: Weight Trend (Replaces HRV) */}
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" /> {t.weightTrend}
        </h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockWeightTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#f97316' }}
                cursor={{ stroke: '#f97316', strokeWidth: 1 }}
                formatter={(value: number) => [`${value} kg`, 'Weight']}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={{ fill: '#000000', stroke: '#f97316', strokeWidth: 2, r: 4 }} 
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Subjective Questionnaire */}
      <div className="space-y-6 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Smile className="w-4 h-4 text-white" /> {t.subjectiveSurvey}
          </h3>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded font-mono">30 SECS</span>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <SurveyItem 
            label={t.muscleSoreness} value={soreness} min={0} max={10} 
            onChange={setSoreness} icon={Activity} color="text-orange-500"
          />
          <SurveyItem 
            label={t.sleepDuration} value={sleepDur} min={4} max={12} step={0.5}
            onChange={setSleepDur} icon={Moon} color="text-white"
          />
          <SurveyItem 
            label={t.sleepQuality} value={sleepQual} min={0} max={10} 
            onChange={setSleepQual} icon={Zap} color="text-orange-500"
          />
          <SurveyItem 
            label={t.stressLevel} value={stress} min={0} max={10} 
            onChange={setStress} icon={Brain} color="text-white"
          />
          <SurveyItem 
            label={t.energyLevel} value={energy} min={0} max={10} 
            onChange={setEnergy} icon={Shield} color="text-orange-500"
          />
        </div>

        <button className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase tracking-tighter rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-950/20">
          {t.saveRecord}
        </button>
      </div>

      {/* 5. Objective Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center gap-3 shadow-xl">
          <Heart className="w-5 h-5 text-orange-500" />
          <div>
            <div className="text-[10px] text-zinc-500 font-black uppercase">RHR</div>
            <div className="text-lg font-black text-white">54 <span className="text-[10px] text-zinc-500 font-bold">BPM</span></div>
          </div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center gap-3 shadow-xl">
          <Thermometer className="w-5 h-5 text-white" />
          <div>
            <div className="text-[10px] text-zinc-500 font-black uppercase">Temp</div>
            <div className="text-lg font-black text-white">98.2<span className="text-[10px] text-zinc-500 font-bold">°F</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryTracker;
