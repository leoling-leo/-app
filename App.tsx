
import React, { useState } from 'react';
import { Dumbbell, Utensils, Moon, BarChart3, Bell, User, Languages, TrendingUp } from 'lucide-react';
import WorkoutTracker from './components/WorkoutTracker';
import FoodLogger from './components/FoodLogger';
import RecoveryTracker from './components/RecoveryTracker';
import AIInsights from './components/AIInsights';
import DateNavigator from './components/DateNavigator';
import { Pillar, Language } from './types';
import { getT } from './translations';

const App: React.FC = () => {
  const [activePillar, setActivePillar] = useState<Pillar>('TRAIN');
  const [lang, setLang] = useState<Language>('zh');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const t = getT(lang);

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const renderContent = () => {
    switch (activePillar) {
      case 'TRAIN': return <WorkoutTracker lang={lang} selectedDate={selectedDate} />;
      case 'EAT': return <FoodLogger lang={lang} selectedDate={selectedDate} />;
      case 'REST': return <RecoveryTracker lang={lang} selectedDate={selectedDate} />;
      case 'INSIGHTS': return <AIInsights lang={lang} />;
      default: return <WorkoutTracker lang={lang} selectedDate={selectedDate} />;
    }
  };

  const NavItem = ({ pillar, icon: Icon, label }: { pillar: Pillar, icon: any, label: string }) => (
    <button 
      onClick={() => setActivePillar(pillar)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-all ${
        activePillar === pillar ? 'text-orange-500 scale-110' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      <Icon className={`w-6 h-6 ${activePillar === pillar ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : ''}`} />
      <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen max-w-md mx-auto relative bg-black shadow-2xl overflow-hidden flex flex-col border-x border-zinc-900">
      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <TrendingUp className="text-black w-5 h-5" strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white">
            {lang === 'zh' ? '想進步' : 'PROGRESS'}
          </h1>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 bg-zinc-900 rounded-md text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition border border-zinc-800"
          >
            <Languages className="w-4 h-4" />
            {lang === 'zh' ? 'EN' : '中文'}
          </button>
          <button className="relative p-1 text-zinc-400 hover:text-white transition">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-black"></span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
        {/* Date Navigator for specific pillars */}
        {['TRAIN', 'EAT', 'REST'].includes(activePillar) && (
          <DateNavigator 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
            lang={lang} 
          />
        )}
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 flex justify-around items-center px-4 pb-4 pt-2 z-50 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <NavItem pillar="TRAIN" icon={Dumbbell} label={t.train} />
        <NavItem pillar="EAT" icon={Utensils} label={t.eat} />
        <NavItem pillar="REST" icon={Moon} label={t.rest} />
        <NavItem pillar="INSIGHTS" icon={BarChart3} label={t.coach} />
      </nav>

      <div className="absolute top-20 -left-20 w-64 h-64 bg-orange-600/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-40 -right-20 w-64 h-64 bg-zinc-400/5 blur-[120px] pointer-events-none"></div>
    </div>
  );
};

export default App;
