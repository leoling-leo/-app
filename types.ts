
export type Pillar = 'TRAIN' | 'EAT' | 'REST' | 'INSIGHTS';
export type Language = 'zh' | 'en';

export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export type WorkoutType = 'Bodybuilding' | 'Powerlifting' | 'HYROX' | 'Running' | 'Custom';

export interface WorkoutSession {
  id: string;
  date: string;
  type: WorkoutType;
  exercises: Exercise[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  type: WorkoutType;
  exerciseNames: string[];
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Supplement {
  id: string;
  name: string;
  servings: string;
  taken: boolean;
}

export interface DailyLog {
  date: string;
  workout?: WorkoutSession;
  meals: FoodItem[];
  waterMl: number;
  supplements: Supplement[];
  sleepHours: number;
  subjectiveRest: number; // 1-10
  heartRateVariability?: number;
}

export interface WeeklyAIReport {
  summary: string;
  trainingAdvice: string;
  nutritionAdvice: string;
  recoveryAdvice: string;
  readinessScore: number;
}
