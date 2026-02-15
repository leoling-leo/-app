
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, Search, Loader2, Utensils, Zap, Flame, Droplets, Plus, Minus, Pill, CheckCircle2, Circle, X, Info, Trash2, Edit2, Settings } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import { FoodItem, Language, Supplement } from '../types';
import { getT } from '../translations';

// Local Food Database Simulation
const foodDatabase: Record<Language, FoodItem[]> = {
  zh: [
    { name: "雞胸肉 (100g)", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { name: "白米飯 (一碗)", calories: 240, protein: 4, carbs: 53, fats: 0.5 },
    { name: "雞蛋 (一顆)", calories: 72, protein: 6, carbs: 0.6, fats: 5 },
    { name: "地瓜 (中型)", calories: 112, protein: 2, carbs: 26, fats: 0.1 },
    { name: "無糖豆漿 (240ml)", calories: 80, protein: 7, carbs: 4, fats: 4 },
    { name: "牛排 (200g)", calories: 500, protein: 50, carbs: 0, fats: 30 },
    { name: "香蕉 (根)", calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
    { name: "全麥吐司 (一片)", calories: 75, protein: 3, carbs: 13, fats: 1 },
    { name: "希臘優格 (100g)", calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
    { name: "酪梨 (半顆)", calories: 160, protein: 2, carbs: 8.5, fats: 14.7 },
  ],
  en: [
    { name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { name: "White Rice (1 Bowl)", calories: 240, protein: 4, carbs: 53, fats: 0.5 },
    { name: "Egg (Large)", calories: 72, protein: 6, carbs: 0.6, fats: 5 },
    { name: "Sweet Potato (Medium)", calories: 112, protein: 2, carbs: 26, fats: 0.1 },
    { name: "Soy Milk (Unsweetened, 240ml)", calories: 80, protein: 7, carbs: 4, fats: 4 },
    { name: "Beef Steak (200g)", calories: 500, protein: 50, carbs: 0, fats: 30 },
    { name: "Banana (1 unit)", calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
    { name: "Whole Wheat Toast (1 slice)", calories: 75, protein: 3, carbs: 13, fats: 1 },
    { name: "Greek Yogurt (100g)", calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
    { name: "Avocado (Half)", calories: 160, protein: 2, carbs: 8.5, fats: 14.7 },
  ]
};

const FoodLogger: React.FC<{ lang: Language, selectedDate: string }> = ({ lang, selectedDate }) => {
  const t = getT(lang);
  const [meals, setMeals] = useState<FoodItem[]>([]);
  const [water, setWater] = useState<number>(0);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  
  // Modals
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isManageSuppsOpen, setIsManageSuppsOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSupp, setEditingSupp] = useState<Supplement | null>(null);
  
  // Manual Food Input State
  const [manualFood, setManualFood] = useState<FoodItem>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Load & Persistence
  useEffect(() => {
    const savedSupps = localStorage.getItem('zenith_supplements');
    if (savedSupps) {
      setSupplements(JSON.parse(savedSupps));
    } else {
      const defaultSupps = [
        { id: '1', name: lang === 'zh' ? '乳清蛋白' : 'Whey Protein', servings: '1 scoop', taken: false },
        { id: '2', name: lang === 'zh' ? '肌酸' : 'Creatine', servings: '5g', taken: false },
        { id: '3', name: lang === 'zh' ? '綜合維他命' : 'Multivitamin', servings: '1 pill', taken: false }
      ];
      setSupplements(defaultSupps);
      localStorage.setItem('zenith_supplements', JSON.stringify(defaultSupps));
    }
  }, [lang]);

  // Reset daily status on date change
  useEffect(() => {
    setSupplements(prev => prev.map(s => ({ ...s, taken: false })));
    setMeals([]);
    setWater(0);
  }, [selectedDate]);

  const saveSupplementsToStore = (newSupps: Supplement[]) => {
    setSupplements(newSupps);
    localStorage.setItem('zenith_supplements', JSON.stringify(newSupps));
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const analysis = await analyzeFoodImage(base64, lang);
        if (analysis.name) {
          setMeals(prev => [...prev, analysis]);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredDatabase = useMemo(() => {
    const db = foodDatabase[lang];
    if (!searchQuery) return db;
    return db.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [lang, searchQuery]);

  const addMeal = (item: FoodItem) => {
    setMeals(prev => [...prev, item]);
    setIsManualOpen(false);
    setSearchQuery('');
    setManualFood({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  const removeMeal = (index: number) => {
    setMeals(prev => prev.filter((_, i) => i !== index));
  };

  const totals = meals.reduce((acc, m) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fats: acc.fats + m.fats,
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const toggleSupplement = (id: string) => {
    setSupplements(prev => prev.map(s => s.id === id ? { ...s, taken: !s.taken } : s));
  };

  const addOrUpdateSupplement = (supp: Partial<Supplement>) => {
    if (editingSupp) {
      const updated = supplements.map(s => s.id === editingSupp.id ? { ...s, ...supp } : s);
      saveSupplementsToStore(updated);
    } else {
      const newSupp: Supplement = {
        id: Date.now().toString(),
        name: supp.name || '',
        servings: supp.servings || '',
        taken: false
      };
      saveSupplementsToStore([...supplements, newSupp]);
    }
    setEditingSupp(null);
  };

  const deleteSupplement = (id: string) => {
    if (confirm(lang === 'zh' ? '確定要刪除此補充品嗎？' : 'Are you sure you want to delete this supplement?')) {
      const filtered = supplements.filter(s => s.id !== id);
      saveSupplementsToStore(filtered);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Action Header */}
      <div className="flex gap-3">
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="flex-1 bg-white hover:bg-zinc-200 text-black py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-tighter transition disabled:opacity-50 shadow-xl active:scale-95"
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          {isAnalyzing ? t.analyzing : t.aiScan}
        </button>
        <button 
          onClick={() => setIsManualOpen(true)}
          className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-tighter transition shadow-xl border border-zinc-800 active:scale-95"
        >
          <Search className="w-5 h-5 text-orange-500" /> {t.manual}
        </button>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleImageCapture} 
        className="hidden" 
      />

      {/* Totals Card */}
      <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{lang === 'zh' ? '今日營養總計' : 'Daily Nutrients'}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black italic tracking-tighter text-white">{totals.calories}</span>
                <span className="text-orange-500 font-black text-xl italic tracking-tighter">kcal</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/40 border border-zinc-800/50 rounded-2xl p-3 flex flex-col items-center">
              <div className="text-sm font-black text-white">{totals.protein}g</div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{t.protein}</div>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, (totals.protein / 200) * 100)}%` }}></div>
              </div>
            </div>
            <div className="bg-black/40 border border-zinc-800/50 rounded-2xl p-3 flex flex-col items-center">
              <div className="text-sm font-black text-white">{totals.carbs}g</div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{t.carbs}</div>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (totals.carbs / 350) * 100)}%` }}></div>
              </div>
            </div>
            <div className="bg-black/40 border border-zinc-800/50 rounded-2xl p-3 flex flex-col items-center">
              <div className="text-sm font-black text-white">{totals.fats}g</div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{t.fats}</div>
              <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${Math.min(100, (totals.fats / 90) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 blur-[50px] rounded-full"></div>
      </div>

      {/* Water & Supplements */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <Droplets className="w-6 h-6 text-blue-500 fill-blue-500/20" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{t.water}</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{water}</span>
                <span className="text-sm font-bold text-zinc-500">ml</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setWater(Math.max(0, water - 250))}
              className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition active:scale-90"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setWater(water + 250)}
              className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-blue-500 hover:bg-zinc-700 transition active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-lg font-black italic uppercase tracking-tighter flex items-center gap-2">
              <Pill className="w-5 h-5 text-orange-500" /> {t.supplements}
            </h3>
            <button 
              onClick={() => setIsManageSuppsOpen(true)}
              className="p-2 text-zinc-500 hover:text-white transition-colors flex items-center gap-1 group"
              title={t.manageSupplements}
            >
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
          <div className="space-y-3">
            {supplements.length === 0 ? (
              <div className="text-center py-6 text-zinc-600 italic text-xs">{lang === 'zh' ? '請點擊設定按鈕新增補充品' : 'Manage list to add supplements'}</div>
            ) : (
              supplements.map((s) => (
                <div 
                  key={s.id} 
                  onClick={() => toggleSupplement(s.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    s.taken ? 'bg-orange-500/10 border-orange-500/30' : 'bg-black/20 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${s.taken ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                      {s.taken ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${s.taken ? 'text-white' : 'text-zinc-400'}`}>{s.name}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{s.servings}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Logged Meals List */}
      <div className="space-y-3">
        <h3 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2 text-white px-1">
          <Utensils className="w-5 h-5 text-orange-500" /> {t.loggedMeals}
        </h3>
        {meals.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 italic border-2 border-dashed border-zinc-900 rounded-3xl">
            {t.noMeals}
          </div>
        ) : (
          meals.map((meal, idx) => (
            <div key={idx} className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-zinc-700 transition">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{meal.name}</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-mono text-white font-black italic tracking-tighter">+{meal.calories}</div>
                <button 
                  onClick={() => removeMeal(idx)}
                  className="p-2 text-zinc-600 hover:text-red-500 transition-colors active:scale-90"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Supplement Manager Modal */}
      {isManageSuppsOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-0 sm:p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setIsManageSuppsOpen(false); setEditingSupp(null); }}></div>
          <div className="relative w-full max-w-md bg-zinc-900 border-b border-zinc-800 rounded-b-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slideDown">
            <div className="p-6 pb-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">{t.manageSupplements}</h3>
              <button onClick={() => { setIsManageSuppsOpen(false); setEditingSupp(null); }} className="p-2 text-zinc-500 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
              {/* Add/Edit Form */}
              <div className="bg-black/40 p-5 rounded-3xl border border-zinc-800 space-y-4">
                <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest px-1">
                  {editingSupp ? t.editSupplement : t.addSupplement}
                </h4>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder={t.supplementName}
                    value={editingSupp ? editingSupp.name : searchQuery}
                    onChange={(e) => editingSupp ? setEditingSupp({...editingSupp, name: e.target.value}) : setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-white text-sm outline-none focus:border-orange-500 transition"
                  />
                  <input 
                    type="text" 
                    placeholder={t.promptServings}
                    value={editingSupp ? editingSupp.servings : ''}
                    id="servingsInput"
                    onChange={(e) => editingSupp ? setEditingSupp({...editingSupp, servings: e.target.value}) : null}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-white text-sm outline-none focus:border-orange-500 transition"
                  />
                </div>
                <button 
                  onClick={() => {
                    const name = editingSupp ? editingSupp.name : searchQuery;
                    const servings = editingSupp ? editingSupp.servings : (document.getElementById('servingsInput') as HTMLInputElement).value;
                    if (name.trim()) {
                      addOrUpdateSupplement({ name, servings });
                      setSearchQuery('');
                      if (!editingSupp) (document.getElementById('servingsInput') as HTMLInputElement).value = '';
                    }
                  }}
                  className="w-full py-3.5 bg-white text-black rounded-2xl font-black uppercase tracking-tighter hover:bg-zinc-200 transition active:scale-95"
                >
                  {editingSupp ? lang === 'zh' ? '確認修改' : 'Update' : t.addSupplement}
                </button>
              </div>

              {/* List */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest px-1">現有清單</h4>
                {supplements.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-800 rounded-xl text-orange-500">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-100">{s.name}</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{s.servings}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingSupp(s)}
                        className="p-2 text-zinc-500 hover:text-orange-500 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteSupplement(s.id)}
                        className="p-2 text-zinc-500 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Food Entry / DB Search Modal */}
      {isManualOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-0 sm:p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsManualOpen(false)}></div>
          <div className="relative w-full max-w-md bg-zinc-900 border-b border-zinc-800 rounded-b-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slideDown">
            <div className="p-6 pb-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">{t.addFood}</h3>
              <button onClick={() => setIsManualOpen(false)} className="p-2 text-zinc-500 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
              {/* Database Search */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder={t.searchFood}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-2xl py-3.5 pl-10 pr-4 text-white text-sm focus:border-orange-500 outline-none transition"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 px-1">
                    <Zap className="w-3 h-3 text-orange-500" /> {searchQuery ? 'Search Results' : t.commonFoods}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredDatabase.slice(0, 6).map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => addMeal(item)}
                        className="w-full p-4 bg-zinc-800/30 hover:bg-orange-500/5 border border-zinc-800 hover:border-orange-500/30 rounded-2xl text-left flex items-center justify-between group transition-all"
                      >
                        <div>
                          <div className="font-bold text-zinc-200 group-hover:text-white transition-colors">{item.name}</div>
                          <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                            {item.calories} kcal • P: {item.protein}g • C: {item.carbs}g • F: {item.fats}g
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-zinc-600 group-hover:text-orange-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Manual Entry */}
              <div className="pt-6 border-t border-zinc-800 space-y-4">
                <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2 px-1">
                  <Info className="w-3 h-3 text-blue-500" /> {t.manualAdd}
                </h4>
                <div className="space-y-4 bg-black/40 p-4 rounded-3xl border border-zinc-800/50">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest px-1">{t.foodName}</label>
                    <input 
                      type="text" 
                      placeholder={t.foodName}
                      value={manualFood.name}
                      onChange={(e) => setManualFood({...manualFood, name: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-white text-sm outline-none focus:border-orange-500 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest px-1">{t.calories}</label>
                      <input 
                        type="number" 
                        value={manualFood.calories || ''}
                        onChange={(e) => setManualFood({...manualFood, calories: parseFloat(e.target.value) || 0})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-white text-sm outline-none focus:border-orange-500 transition font-mono pr-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest px-1">{t.protein}</label>
                      <input 
                        type="number" 
                        value={manualFood.protein || ''}
                        onChange={(e) => setManualFood({...manualFood, protein: parseFloat(e.target.value) || 0})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-white text-sm outline-none focus:border-orange-500 transition font-mono pr-6"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest px-1">{t.carbs}</label>
                      <input 
                        type="number" 
                        value={manualFood.carbs || ''}
                        onChange={(e) => setManualFood({...manualFood, carbs: parseFloat(e.target.value) || 0})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-white text-sm outline-none focus:border-orange-500 transition font-mono pr-6"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest px-1">{t.fats}</label>
                      <input 
                        type="number" 
                        value={manualFood.fats || ''}
                        onChange={(e) => setManualFood({...manualFood, fats: parseFloat(e.target.value) || 0})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-white text-sm outline-none focus:border-orange-500 transition font-mono pr-6"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => manualFood.name && addMeal(manualFood)}
                  className="w-full py-4 bg-orange-500 text-black rounded-2xl font-black uppercase tracking-tighter hover:bg-orange-400 transition active:scale-95 shadow-lg shadow-orange-950/20 mt-2"
                >
                  {t.saveFood}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLogger;
