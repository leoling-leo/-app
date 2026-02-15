
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, Play, Timer, History, Zap, Dumbbell, Activity, Settings2, ChevronLeft, ChevronRight, Trophy, Search, X, BookMarked, Save, PlusCircle } from 'lucide-react';
import { Exercise, WorkoutSet, Language, WorkoutType, WorkoutTemplate, WorkoutSession } from '../types';
import { getT } from '../translations';
import PublishModal from './PublishModal';

const exerciseDatabase: Record<WorkoutType, string[]> = {
  Bodybuilding: [
    'Bench Press', 'Incline Dumbbell Press', 'Chest Fly', 'Pushup',
    'Lat Pulldown', 'Barbell Row', 'One Arm Row', 'Pull Up',
    'Shoulder Press', 'Lateral Raise', 'Face Pull',
    'Back Squat', 'Leg Press', 'Leg Extension', 'Leg Curl',
    'Bicep Curl', 'Hammer Curl', 'Tricep Extension', 'Dip'
  ],
  Powerlifting: [
    'Competition Back Squat', 'Pause Squat', 'Low Bar Squat',
    'Competition Bench Press', 'Close Grip Bench Press', 'Pause Bench Press',
    'Competition Deadlift', 'Sumo Deadlift', 'Conventional Deadlift', 'Deficit Deadlift',
    'Overhead Press', 'Rack Pull'
  ],
  HYROX: [
    '1km Run', 'SkiErg (1000m)', 'Sled Push (50m)', 'Sled Pull (50m)',
    'Burpee Broad Jumps (80m)', 'Rowing (1000m)', 'Farmers Carry (200m)',
    'Sandbag Lunges (100m)', 'Wall Balls (75/100 reps)'
  ],
  Running: [
    'Easy Run', 'Tempo Run', 'Interval Sprints', 'Long Slow Distance',
    'Hill Repeats', 'Recovery Jog', 'VO2 Max Intervals'
  ],
  Custom: [
    'Plank', 'Crunches', 'Leg Raises', 'Yoga Flow', 'Mobility Routine'
  ]
};

const exerciseDatabaseZH: Record<WorkoutType, string[]> = {
  Bodybuilding: [
    '臥推', '上斜啞鈴推舉', '胸部飛鳥', '伏地挺身',
    '滑輪下拉', '槓鈴划船', '單臂划船', '引體向上',
    '肩推', '側平舉', '面拉',
    '槓鈴深蹲', '腿推', '腿屈伸', '腿彎舉',
    '二頭彎舉', '錘式彎舉', '三頭下壓', '撐體'
  ],
  Powerlifting: [
    '比賽深蹲', '暫停深蹲', '低槓深蹲',
    '比賽臥推', '窄握臥推', '暫停臥推',
    '比賽硬舉', '相撲硬舉', '傳統硬舉', '墊高硬舉',
    '肩推', '架上拉'
  ],
  HYROX: [
    '1公里跑步', '滑雪機 (1000m)', '推雪橇 (50m)', '拉雪橇 (50m)',
    '波比跳遠 (80m)', '划船機 (1000m)', '農夫走路 (200m)',
    '沙袋分腿蹲 (100m)', '藥球投擲 (75/100 reps)'
  ],
  Running: [
    '輕鬆跑', '節奏跑', '間歇衝刺', '長距離慢跑',
    '坡道重複跑', '恢復跑', 'VO2 Max 間歇'
  ],
  Custom: [
    '棒式', '仰臥起坐', '舉腿', '瑜珈流動', '活動度訓練'
  ]
};

// Simulated history
const lastWeightHistory: Record<string, number> = {
  'Bench Press': 80,
  '臥推': 80,
  'Back Squat': 120,
  '槓鈴深蹲': 120,
  'Deadlift': 160,
  '比賽硬舉': 160,
  'Lat Pulldown': 65,
  '滑輪下拉': 65
};

const WorkoutTracker: React.FC<{ lang: Language, selectedDate: string }> = ({ lang, selectedDate }) => {
  const t = getT(lang);
  const types: WorkoutType[] = ['Bodybuilding', 'Powerlifting', 'HYROX', 'Running', 'Custom'];
  const [workoutType, setWorkoutType] = useState<WorkoutType>('Bodybuilding');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  
  // Modals
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  
  // Template Creation State
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplType, setTplType] = useState<WorkoutType>('Bodybuilding');
  const [tplExercises, setTplExercises] = useState<string[]>([]);
  const [tplSearch, setTplSearch] = useState('');

  const [activeCategoryInPicker, setActiveCategoryInPicker] = useState<WorkoutType>('Bodybuilding');
  const [searchQuery, setSearchQuery] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  useEffect(() => {
    setActiveCategoryInPicker(workoutType);
  }, [workoutType, isPickerOpen]);

  useEffect(() => {
    const saved = localStorage.getItem('zenith_templates');
    if (saved) setTemplates(JSON.parse(saved));
  }, []);

  const saveTemplates = (newTemplates: WorkoutTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('zenith_templates', JSON.stringify(newTemplates));
  };

  const addSelectedExercise = (name: string) => {
    const lastWeight = lastWeightHistory[name] || 0;
    setExercises([...exercises, {
      id: Date.now().toString(),
      name,
      sets: [{ reps: 10, weight: lastWeight, completed: false }]
    }]);
    setIsPickerOpen(false);
    setSearchQuery('');
  };

  const handleFinishWorkout = () => {
    if (exercises.length === 0) {
      alert(lang === 'zh' ? '請先新增運動動作' : 'Please add exercises first');
      return;
    }
    setIsPublishOpen(true);
  };

  const handleSaveAsTemplate = () => {
    if (exercises.length === 0) return;
    const name = prompt(t.templateName, `${workoutType} Routine`);
    if (name) {
      const newTemplate: WorkoutTemplate = {
        id: Date.now().toString(),
        name,
        type: workoutType,
        exerciseNames: exercises.map(ex => ex.name)
      };
      saveTemplates([...templates, newTemplate]);
      alert(lang === 'zh' ? '課表已儲存！' : 'Template saved!');
    }
  };

  const createNewTemplate = () => {
    if (!tplName.trim()) return;
    const newTemplate: WorkoutTemplate = {
      id: Date.now().toString(),
      name: tplName,
      type: tplType,
      exerciseNames: tplExercises
    };
    saveTemplates([...templates, newTemplate]);
    setIsCreatingTemplate(false);
  };

  const applyTemplate = (template: WorkoutTemplate) => {
    setWorkoutType(template.type);
    const newExercises = template.exerciseNames.map((name, i) => ({
      id: `${Date.now()}-${i}`,
      name,
      sets: [{ reps: 10, weight: lastWeightHistory[name] || 0, completed: false }]
    }));
    setExercises(newExercises);
    setIsTemplateOpen(false);
  };

  const filteredExercises = useMemo(() => {
    const db = lang === 'zh' ? exerciseDatabaseZH : exerciseDatabase;
    const currentList = db[activeCategoryInPicker];
    if (!searchQuery) return currentList;
    return currentList.filter(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeCategoryInPicker, lang, searchQuery]);

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { reps: lastSet.reps, weight: lastSet.weight, completed: false }]
        };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: any) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const getWorkoutTypeConfig = (type: WorkoutType) => {
    switch (type) {
      case 'Bodybuilding': return { label: t.bodybuilding, icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-500' };
      case 'Powerlifting': return { label: t.powerlifting, icon: Dumbbell, color: 'text-red-500', bg: 'bg-red-500' };
      case 'HYROX': return { label: t.hyrox, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500' };
      case 'Running': return { label: t.running, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500' };
      case 'Custom': return { label: t.custom, icon: Settings2, color: 'text-zinc-500', bg: 'bg-zinc-500' };
    }
  };

  const currentConfig = getWorkoutTypeConfig(workoutType);
  const Icon = currentConfig.icon;

  const currentSessionData: WorkoutSession = {
    id: 'current',
    date: selectedDate,
    type: workoutType,
    exercises: exercises
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* 1. Carousel Workout Type Selector */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 p-4">
           <Zap className={`w-12 h-12 opacity-5 ${currentConfig.color}`} fill="currentColor" />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <button 
            onClick={() => {
              const currentIndex = types.indexOf(workoutType);
              const nextIndex = (currentIndex - 1 + types.length) % types.length;
              setWorkoutType(types[nextIndex]);
            }}
            className="p-3 bg-black/40 hover:bg-black rounded-2xl text-zinc-500 hover:text-white transition active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center text-center px-4 animate-fadeIn" key={workoutType}>
            <div className={`w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-4 border border-zinc-800 shadow-inner`}>
              <Icon className={`w-8 h-8 ${currentConfig.color}`} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{t.workoutType}</h3>
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">{currentConfig.label}</h2>
          </div>

          <button 
            onClick={() => {
              const currentIndex = types.indexOf(workoutType);
              const nextIndex = (currentIndex + 1) % types.length;
              setWorkoutType(types[nextIndex]);
            }}
            className="p-3 bg-black/40 hover:bg-black rounded-2xl text-zinc-500 hover:text-white transition active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">{t.todaySession}</h2>
        <div className="flex gap-2">
          <button onClick={() => setIsTemplateOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition">
            <BookMarked className="w-5 h-5 text-blue-500" />
          </button>
          <button onClick={handleSaveAsTemplate} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition">
            <Save className="w-5 h-5 text-orange-500" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl group transition-all">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 ${currentConfig.bg} rounded-full`}></div>
                <h3 className="text-xl font-black italic text-white uppercase tracking-tight">{ex.name}</h3>
              </div>
              <button onClick={() => setExercises(exercises.filter(e => e.id !== ex.id))} className="p-2 text-zinc-600 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {ex.sets.map((set, idx) => (
                <div key={idx} className={`grid grid-cols-4 gap-4 items-center py-2 transition-opacity ${set.completed ? 'opacity-30' : ''}`}>
                  <div className="text-center font-black italic text-zinc-400">#{idx + 1}</div>
                  <input type="number" value={set.weight} onChange={(e) => updateSet(ex.id, idx, 'weight', parseFloat(e.target.value))} className="bg-black text-center py-2 rounded-xl border border-zinc-800 text-white font-mono" />
                  <input type="number" value={set.reps} onChange={(e) => updateSet(ex.id, idx, 'reps', parseInt(e.target.value))} className="bg-black text-center py-2 rounded-xl border border-zinc-800 text-white font-mono" />
                  <button onClick={() => updateSet(ex.id, idx, 'completed', !set.completed)} className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center ${set.completed ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => addSet(ex.id)} className="mt-4 w-full py-2 bg-zinc-800/50 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-zinc-400">
              <Plus className="w-4 h-4" /> {t.addSet}
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <button onClick={() => setIsPickerOpen(true)} className="w-full py-8 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:border-orange-500 transition-all bg-zinc-900/20 active:scale-95 group">
          <Plus className="w-6 h-6" />
          <span className="font-black uppercase tracking-widest text-[10px]">{t.addExercise}</span>
        </button>

        <button 
          onClick={handleFinishWorkout}
          className="w-full py-5 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-tighter rounded-3xl shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Play className="w-5 h-5 fill-black" /> {t.finishWorkout}
        </button>
      </div>

      {/* Modals */}
      {isPublishOpen && (
        <PublishModal 
          lang={lang} 
          onClose={() => setIsPublishOpen(false)} 
          workoutData={currentSessionData} 
        />
      )}

      {/* Picker Modal Placeholder */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsPickerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-zinc-900 rounded-[2.5rem] p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black italic text-white uppercase">{t.addExercise}</h3>
               <button onClick={() => setIsPickerOpen(false)}><X className="w-6 h-6 text-zinc-500" /></button>
             </div>
             <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
               {filteredExercises.map((ex, i) => (
                 <button key={i} onClick={() => addSelectedExercise(ex)} className="w-full p-4 bg-zinc-800/30 hover:bg-orange-500/10 rounded-2xl text-left font-bold text-zinc-300 hover:text-white transition">
                   {ex}
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* Template Modal Placeholder */}
      {isTemplateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsTemplateOpen(false)}></div>
          <div className="relative w-full max-w-md bg-zinc-900 rounded-[2.5rem] p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black italic text-white uppercase">{t.templates}</h3>
               <button onClick={() => setIsTemplateOpen(false)}><X className="w-6 h-6 text-zinc-500" /></button>
             </div>
             <div className="space-y-3">
               {templates.length === 0 ? <p className="text-center text-zinc-600 italic">{t.noTemplates}</p> : 
                templates.map(tpl => (
                  <button key={tpl.id} onClick={() => applyTemplate(tpl)} className="w-full p-4 bg-zinc-800/30 hover:bg-blue-500/10 border border-zinc-800 rounded-2xl text-left">
                    <div className="font-bold text-white">{tpl.name}</div>
                    <div className="text-[10px] text-zinc-500">{tpl.type} • {tpl.exerciseNames.length} EX</div>
                  </button>
                ))
               }
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutTracker;
