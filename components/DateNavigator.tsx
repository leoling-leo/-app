
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { Language } from '../types';
import { getT } from '../translations';

interface DateNavigatorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  lang: Language;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ selectedDate, onDateChange, lang }) => {
  const t = getT(lang);
  const dateObj = new Date(selectedDate);
  const todayStr = new Date().toISOString().split('T')[0];
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const formatDateLabel = () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    if (selectedDate === todayStr) return t.today;
    if (selectedDate === yesterday) return t.yesterday;
    if (selectedDate === tomorrow) return t.tomorrow;
    
    return dateObj.toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const shiftDate = (days: number) => {
    const newDate = new Date(dateObj.getTime() + days * 86400000);
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  const resetToToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(todayStr);
  };

  const handleContainerClick = () => {
    // Explicitly trigger the date picker if supported
    if (dateInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch (e) {
          dateInputRef.current.focus();
          dateInputRef.current.click();
        }
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 mb-6 shadow-xl relative z-40">
      <div className="flex items-center">
        <button 
          onClick={() => shiftDate(-1)}
          className="p-2.5 text-zinc-500 hover:text-white transition-colors rounded-xl active:bg-zinc-800"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="relative flex-1 flex items-center justify-center group">
        <div 
          onClick={handleContainerClick}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-800/50 group-hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent group-hover:border-zinc-700 relative"
        >
          <Calendar className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none mb-0.5">
              {lang === 'zh' ? '選擇日期' : 'Select Date'}
            </span>
            <span className="text-sm font-black text-white uppercase tracking-tight leading-none">
              {formatDateLabel()}
            </span>
          </div>
          {/* Hidden but functional date input */}
          <input 
            ref={dateInputRef}
            type="date" 
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none w-full h-full"
            title={lang === 'zh' ? '開啟日曆' : 'Open Calendar'}
          />
        </div>
        
        {selectedDate !== todayStr && (
          <button 
            onClick={resetToToday}
            className="absolute -right-1 p-2 text-zinc-600 hover:text-orange-500 transition-all rounded-full bg-black/40 border border-zinc-800/50 hover:border-orange-500/30"
            title={t.today}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center">
        <button 
          onClick={() => shiftDate(1)}
          className="p-2.5 text-zinc-500 hover:text-white transition-colors rounded-xl active:bg-zinc-800"
          aria-label="Next Day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DateNavigator;
