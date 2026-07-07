const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || json.error.code);
  return json.data as T;
}

async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || json.error.code);
  return json.data as T;
}

async function patch<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || json.error.code);
  return json.data as T;
}

export interface User {
  id: string; nickname?: string; age: number; occupation: string; industry: string;
  city?: string; weekdayAvailableHours: number; weekendAvailableHours: number;
  goalDomains: string[]; createdAt: string; updatedAt: string;
}

export interface LifeGoal {
  id: string; title: string; description?: string; timeHorizon?: string;
  status: string; sortOrder?: number; completedAt?: string;
}

export interface YearlyGoal {
  id: string; lifeGoalId?: string; title: string; description?: string;
  year: number; metricType: string; targetValue: string; currentValue?: string;
  startValue?: string; status: string;
}

export interface MonthlyPlan {
  id: string; yearlyGoalId?: string; title: string; description?: string;
  month: number; year: number; metricType: string; targetValue: string;
  currentValue?: string; status: string;
}

export interface DailyPlan {
  id: string; title: string; date: string; metricType: string;
  targetValue: string; currentValue?: string; status: string;
}

export interface Review {
  id: string; date: string; rawInput?: string; completed?: string;
  notCompleted?: string; obstacles?: string; emotionState?: string;
  mindsetNote?: string; followUpLog?: Array<{question: string; answer: string}>;
  status: string; aiAnalyses?: AIAnalysis[];
}

export interface AIAnalysis {
  id: string; analysisType: string; structuredReport: any;
  narrativeReport?: string; createdAt: string;
  feedbacks?: AIAnalysisFeedback[];
}

export interface AIAnalysisFeedback {
  id: string; userScore: number; isPass: boolean; isExcellent: boolean;
  excellentReason?: string; failReason?: string;
  reflections?: Array<{id: string; issueDescription: string; improvementDirection: string}>;
  successCases?: Array<{id: string; excellentPattern: string; replicableCondition?: string}>;
}

export interface CalendarDay {
  date: string; dayOfWeek: number; planCount: number; completedPlans: number;
  hasReview: boolean; reviewStatus?: string; analysisScore?: number;
}

export interface ProgressOverview {
  lifeGoals: LifeGoal[]; yearlyGoals: YearlyGoal[]; monthlyPlans: MonthlyPlan[];
  stats: { total: number; completed: number; completionRate: number };
  recentReviews: Array<{id: string; date: string; status: string}>;
}

export interface GoalChain {
  goal: any; children: { monthlyPlans?: MonthlyPlan[]; yearlyGoals?: any[] };
}

export interface CalendarData {
  year: number; month: number; days: CalendarDay[];
}

// ——— LifeArchive ———
export interface LifeArchive {
  id: string;
  userId: string;
  layerCore?: {
    personality?: {
      mbti?: string;
      bigFive?: {
        openness?: number;
        conscientiousness?: number;
        extraversion?: number;
        agreeableness?: number;
        neuroticism?: number;
      };
      gallup?: string[];
    };
  };
  layerResources?: {
    skills?: Array<{ skillName: string; level: string; yearsOfExperience: number; description?: string }>;
    weekdayAvailableHours?: number;
    weekendAvailableHours?: number;
    weekdayTimeBlocks?: string;
    weekendTimeBlocks?: string;
    fixedExpenditure?: string;
    finance?: {
      safetyNet?: string;
      incomeStructure?: string;
      investableFunds?: string;
      financialStage?: string;
    };
    support?: {
      guidance?: string;
      collaboration?: string;
      emotionalSupport?: string;
      socialNetwork?: string;
    };
    energyDescription?: string;
    health?: {
      physicalHealth?: string;
      mentalState?: string;
      exerciseRoutine?: string;
      addictiveHabits?: string;
    };
  };
  layerBehavior?: Record<string, any>;
  layerFuture?: {
    vision?: { years10?: string; years3?: string; year1?: string };
    goalSource?: { motivation?: string; whyNow?: string };
    outcomeRange?: { description?: string; minimum?: string; ideal?: string };
    roleModels?: { positive?: string; negative?: string };
  };
  summary?: string;
}

export type LayerCoreInput = NonNullable<LifeArchive['layerCore']>;
export type LayerResourcesInput = NonNullable<LifeArchive['layerResources']>;
export type LayerFutureInput = NonNullable<LifeArchive['layerFuture']>;

export interface Suggestion {
  type: 'positive' | 'warning' | 'critical';
  message: string;
  source?: string;
}

export interface WeeklyCheck {
  week: number;
  year: number;
  hasReview: boolean;
  reviewStatus?: string;
  analysisScore?: number;
  summary?: string;
  days?: CalendarDay[];
}

export interface MonthlyReviewData {
  id: string;
  year: number;
  month: number;
  status: string;
  rating?: string;
  completionRate?: number;
  analysisScore?: number;
  aiAnalyses?: AIAnalysis[];
  monthlyPlans?: MonthlyPlan[];
}

export const ARCHIVE_API = {
  get: () => get<LifeArchive | null>('/life-archive'),
  updateLayerCore: (data: LayerCoreInput) => patch<LifeArchive>('/life-archive/layer-core', data),
  updateLayerResources: (data: LayerResourcesInput) => patch<LifeArchive>('/life-archive/layer-resources', data),
  updateLayerFuture: (data: LayerFutureInput) => patch<LifeArchive>('/life-archive/layer-future', data),
  getSummary: () => get<{ summary: string } | null>('/life-archive/summary'),
  refreshSummary: () => post<{ summary: string }>('/life-archive/summary/refresh', {}),
};

export const api = {
  getUser: () => get<User>('/user'),
  getLifeGoals: () => get<LifeGoal[]>('/goals/life'),
  getYearlyGoals: (year?: number) => get<YearlyGoal[]>(`/goals/yearly${year ? `?year=${year}` : ''}`),
  getMonthlyPlans: (year?: number, month?: number, yearlyGoalId?: string) => {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (month) params.set('month', String(month));
    if (yearlyGoalId) params.set('yearlyGoalId', yearlyGoalId);
    const qs = params.toString();
    return get<MonthlyPlan[]>(`/plans/monthly${qs ? '?' + qs : ''}`);
  },
  getDailyPlans: (date?: string) => get<DailyPlan[]>(`/plans/daily${date ? '?date=' + date : ''}`),
  getDailyReview: (date: string) => get<Review>(`/reviews/daily/${date}`),
  getAnalysis: (id: string) => get<AIAnalysis>(`/analysis/${id}`),
  getProgressOverview: () => get<ProgressOverview>('/progress/overview'),
  getGoalChain: (goalId: string) => get<GoalChain>(`/progress/goal/${goalId}`),
  getCalendar: (year: number, month: number) => get<CalendarData>(`/progress/calendar?year=${year}&month=${month}`),
  getSuggestions: () => get<Suggestion[]>('/analysis/suggestions'),
  getWeeklyReviewCheck: (year: number, week: number) => get<WeeklyCheck>(`/reviews/weekly/check?year=${year}&week=${week}`),
  getWeeklyReview: (year: number, week: number) => get<Review>(`/reviews/weekly/${year}/${week}`),
  getMonthlyReview: (year: number, month: number) => get<MonthlyReviewData>(`/reviews/monthly/${year}/${month}`),
};
