--
-- PostgreSQL database dump
--

\restrict FiozIWnWvMPq5bVhkT8MSbhOcFmKkauaLaPhajSJCMcsGpouKLx3KEo35FoAYq9

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AnalysisType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AnalysisType" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY'
);


--
-- Name: GoalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GoalStatus" AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'ABANDONED',
    'ARCHIVED',
    'SUSPENDED'
);


--
-- Name: MetricType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MetricType" AS ENUM (
    'NUMERIC',
    'DURATION',
    'FREQUENCY',
    'PERCENTAGE',
    'STAGE'
);


--
-- Name: PlanStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PlanStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'PARTIAL',
    'FAILED',
    'CANCELLED'
);


--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'INPUTTING',
    'ANALYZING',
    'COMPLETED',
    'SKIPPED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AIAnalysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AIAnalysis" (
    id text NOT NULL,
    "dailyReviewId" text,
    "weeklyReviewId" text,
    "monthlyReviewId" text,
    "analysisType" public."AnalysisType" NOT NULL,
    "structuredReport" jsonb NOT NULL,
    "narrativeReport" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AIAnalysisFeedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AIAnalysisFeedback" (
    id text NOT NULL,
    "aiAnalysisId" text NOT NULL,
    "userScore" integer NOT NULL,
    "isPass" boolean NOT NULL,
    "isExcellent" boolean NOT NULL,
    "excellentReason" text,
    "failReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AIReflection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AIReflection" (
    id text NOT NULL,
    "feedbackId" text NOT NULL,
    "issueDescription" text NOT NULL,
    "improvementDirection" text NOT NULL,
    "isApplied" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AISuccessCase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AISuccessCase" (
    id text NOT NULL,
    "feedbackId" text NOT NULL,
    "excellentPattern" text NOT NULL,
    "replicableCondition" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: DailyPlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DailyPlan" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "monthlyPlanId" text,
    title text NOT NULL,
    description text,
    date timestamp(3) without time zone NOT NULL,
    "metricType" public."MetricType" NOT NULL,
    "targetValue" text NOT NULL,
    "currentValue" text,
    status public."PlanStatus" DEFAULT 'PENDING'::public."PlanStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: DailyReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DailyReview" (
    id text NOT NULL,
    "userId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "rawInput" text NOT NULL,
    completed text,
    "notCompleted" text,
    obstacles text,
    "emotionState" text,
    "mindsetNote" text,
    "followUpLog" jsonb,
    status public."ReviewStatus" DEFAULT 'INPUTTING'::public."ReviewStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: LifeGoal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LifeGoal" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    description text,
    "timeHorizon" text,
    status public."GoalStatus" DEFAULT 'ACTIVE'::public."GoalStatus" NOT NULL,
    "sortOrder" integer,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: MonthlyPlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MonthlyPlan" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "yearlyGoalId" text,
    title text NOT NULL,
    description text,
    month integer NOT NULL,
    year integer NOT NULL,
    "metricType" public."MetricType" NOT NULL,
    "targetValue" text NOT NULL,
    "currentValue" text,
    "startValue" text,
    status public."GoalStatus" DEFAULT 'ACTIVE'::public."GoalStatus" NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: MonthlyReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MonthlyReview" (
    id text NOT NULL,
    "userId" text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "rawInput" text,
    summary text,
    "missingDays" jsonb,
    status public."ReviewStatus" DEFAULT 'INPUTTING'::public."ReviewStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    nickname text,
    age integer NOT NULL,
    occupation text NOT NULL,
    industry text NOT NULL,
    city text,
    "weekdayAvailableHours" double precision NOT NULL,
    "weekdayTimeBlocks" jsonb,
    "weekendAvailableHours" double precision NOT NULL,
    "weekendTimeBlocks" jsonb,
    "goalDomains" text[],
    "pastExperience" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WeeklyReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WeeklyReview" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "weekStart" timestamp(3) without time zone NOT NULL,
    "weekEnd" timestamp(3) without time zone NOT NULL,
    year integer NOT NULL,
    week integer NOT NULL,
    "rawInput" text,
    summary text,
    "missingDays" jsonb,
    status public."ReviewStatus" DEFAULT 'INPUTTING'::public."ReviewStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: YearlyGoal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."YearlyGoal" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "lifeGoalId" text,
    title text NOT NULL,
    description text,
    year integer NOT NULL,
    "metricType" public."MetricType" NOT NULL,
    "targetValue" text NOT NULL,
    "currentValue" text,
    "startValue" text,
    status public."GoalStatus" DEFAULT 'ACTIVE'::public."GoalStatus" NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: AIAnalysis; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AIAnalysis" (id, "dailyReviewId", "weeklyReviewId", "monthlyReviewId", "analysisType", "structuredReport", "narrativeReport", "createdAt") FROM stdin;
30bc6be7-6a0b-49df-bb4a-f73162a87e76	fdb49ce8-4fad-4f9b-91ce-0a8bd815cdd9	\N	\N	DAILY	{"completionSummary": {"completed": ["项目提案初稿"], "notCompleted": [], "completionRate": "80%"}, "deviationAnalysis": {"behind": [], "onTrack": ["项目进度"], "riskLevel": "低"}, "executionDiagnosis": {"issues": ["会议过多"], "pattern": "上午效率低", "rootCause": "时间管理"}, "externalPerspective": {"risks": [], "trendInsights": ["远程办公趋势下时间管理工具需求增长"], "directionCheck": "方向正确", "newOpportunities": []}, "adjustmentSuggestions": {"planChanges": [], "executionOptimization": ["将会议安排在下午"]}}	今日完成项目提案初稿，主要阻碍是会议占用上午时间。建议将会议安排在下午，上午保留给深度工作。	2026-05-19 13:09:59.287
\.


--
-- Data for Name: AIAnalysisFeedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AIAnalysisFeedback" (id, "aiAnalysisId", "userScore", "isPass", "isExcellent", "excellentReason", "failReason", "createdAt") FROM stdin;
f4278128-0d4b-49d8-8eaf-8952491a466b	30bc6be7-6a0b-49df-bb4a-f73162a87e76	85	t	t	分析准确识别了会议干扰问题，外部视角有洞察	\N	2026-05-19 13:09:59.292
\.


--
-- Data for Name: AIReflection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AIReflection" (id, "feedbackId", "issueDescription", "improvementDirection", "isApplied", "createdAt") FROM stdin;
\.


--
-- Data for Name: AISuccessCase; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AISuccessCase" (id, "feedbackId", "excellentPattern", "replicableCondition", "createdAt") FROM stdin;
ebffc58d-a387-48dc-ad6e-ab292db5503a	f4278128-0d4b-49d8-8eaf-8952491a466b	准确识别用户时间管理问题，结合远程办公趋势给出建议	当用户反馈时间管理问题时，复用此分析模式	2026-05-19 13:09:59.296
\.


--
-- Data for Name: DailyPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DailyPlan" (id, "userId", "monthlyPlanId", title, description, date, "metricType", "targetValue", "currentValue", status, "createdAt", "updatedAt") FROM stdin;
652147fe-738d-47c4-8f31-ff1beef31396	18740e56-f2f2-47bb-ae21-5982a309d3e7	f60ee59b-8c5e-40ff-aee0-fd4c7327e2f3	完成项目提案初稿	\N	2026-06-15 00:00:00	NUMERIC	1 份	1 份	COMPLETED	2026-05-19 13:09:59.278	2026-05-19 13:09:59.278
\.


--
-- Data for Name: DailyReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DailyReview" (id, "userId", date, "rawInput", completed, "notCompleted", obstacles, "emotionState", "mindsetNote", "followUpLog", status, "createdAt", "updatedAt") FROM stdin;
fdb49ce8-4fad-4f9b-91ce-0a8bd815cdd9	18740e56-f2f2-47bb-ae21-5982a309d3e7	2026-06-15 00:00:00	今天完成了项目提案的初稿，但是觉得效率不够高，上午被会议占用了很多时间。下午专注写了两个小时，进度还行。	完成项目提案初稿		上午会议过多，打断思路	中性偏积极	意识到时间块管理的重要性	[{"answer": "大约2个小时", "question": "今天开会占用了多少时间？"}, {"answer": "可以把会议安排在下午", "question": "有什么方式可以减少会议干扰？"}]	COMPLETED	2026-05-19 13:09:59.283	2026-05-19 13:09:59.283
\.


--
-- Data for Name: LifeGoal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LifeGoal" (id, "userId", title, description, "timeHorizon", status, "sortOrder", "completedAt", "createdAt", "updatedAt") FROM stdin;
3141a279-61c5-4cab-b399-c679fec3d9ed	18740e56-f2f2-47bb-ae21-5982a309d3e7	实现财务自由	通过被动收入覆盖生活支出，不再依赖工资收入	10年	ACTIVE	1	\N	2026-05-19 13:09:59.263	2026-05-19 13:09:59.263
\.


--
-- Data for Name: MonthlyPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MonthlyPlan" (id, "userId", "yearlyGoalId", title, description, month, year, "metricType", "targetValue", "currentValue", "startValue", status, "completedAt", "createdAt", "updatedAt") FROM stdin;
f60ee59b-8c5e-40ff-aee0-fd4c7327e2f3	18740e56-f2f2-47bb-ae21-5982a309d3e7	213595ce-e4f7-4adc-b599-75b8539c8c42	Q2 冲刺：季度收入15万	\N	6	2026	NUMERIC	150000 元	50000 元	\N	ACTIVE	\N	2026-05-19 13:09:59.272	2026-05-19 13:09:59.272
\.


--
-- Data for Name: MonthlyReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MonthlyReview" (id, "userId", month, year, "rawInput", summary, "missingDays", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, nickname, age, occupation, industry, city, "weekdayAvailableHours", "weekdayTimeBlocks", "weekendAvailableHours", "weekendTimeBlocks", "goalDomains", "pastExperience", "createdAt", "updatedAt") FROM stdin;
18740e56-f2f2-47bb-ae21-5982a309d3e7	\N	28	软件工程师	科技	\N	4	[{"end": "12:00", "start": "09:00"}, {"end": "18:00", "start": "14:00"}]	8	[{"end": "12:00", "start": "10:00"}, {"end": "17:00", "start": "14:00"}]	{财务,健康,学习}	\N	2026-05-19 13:09:59.257	2026-05-19 13:09:59.257
\.


--
-- Data for Name: WeeklyReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WeeklyReview" (id, "userId", "weekStart", "weekEnd", year, week, "rawInput", summary, "missingDays", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: YearlyGoal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."YearlyGoal" (id, "userId", "lifeGoalId", title, description, year, "metricType", "targetValue", "currentValue", "startValue", status, "completedAt", "createdAt", "updatedAt") FROM stdin;
213595ce-e4f7-4adc-b599-75b8539c8c42	18740e56-f2f2-47bb-ae21-5982a309d3e7	3141a279-61c5-4cab-b399-c679fec3d9ed	年收入达到50万	\N	2026	NUMERIC	500000 元	120000 元	300000 元	ACTIVE	\N	2026-05-19 13:09:59.268	2026-05-19 13:09:59.268
\.


--
-- Name: AIAnalysisFeedback AIAnalysisFeedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AIAnalysisFeedback"
    ADD CONSTRAINT "AIAnalysisFeedback_pkey" PRIMARY KEY (id);


--
-- Name: AIAnalysis AIAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AIAnalysis"
    ADD CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: AIReflection AIReflection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AIReflection"
    ADD CONSTRAINT "AIReflection_pkey" PRIMARY KEY (id);


--
-- Name: AISuccessCase AISuccessCase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AISuccessCase"
    ADD CONSTRAINT "AISuccessCase_pkey" PRIMARY KEY (id);


--
-- Name: DailyPlan DailyPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailyPlan"
    ADD CONSTRAINT "DailyPlan_pkey" PRIMARY KEY (id);


--
-- Name: DailyReview DailyReview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailyReview"
    ADD CONSTRAINT "DailyReview_pkey" PRIMARY KEY (id);


--
-- Name: LifeGoal LifeGoal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LifeGoal"
    ADD CONSTRAINT "LifeGoal_pkey" PRIMARY KEY (id);


--
-- Name: MonthlyPlan MonthlyPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MonthlyPlan"
    ADD CONSTRAINT "MonthlyPlan_pkey" PRIMARY KEY (id);


--
-- Name: MonthlyReview MonthlyReview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MonthlyReview"
    ADD CONSTRAINT "MonthlyReview_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WeeklyReview WeeklyReview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WeeklyReview"
    ADD CONSTRAINT "WeeklyReview_pkey" PRIMARY KEY (id);


--
-- Name: YearlyGoal YearlyGoal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."YearlyGoal"
    ADD CONSTRAINT "YearlyGoal_pkey" PRIMARY KEY (id);


--
-- Name: AIAnalysisFeedback AIAnalysisFeedback_aiAnalysisId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AIAnalysisFeedback"
    ADD CONSTRAINT "AIAnalysisFeedback_aiAnalysisId_fkey" FOREIGN KEY ("aiAnalysisId") REFERENCES public."AIAnalysis"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AIAnalysis AIAnalysis_dailyReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AIAnalysis"
    ADD CONSTRAINT "AIAnalysis_dailyReviewId_fkey" FOREIGN KEY ("dailyReviewId") REFERENCES public."DailyReview"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AIAnalysis AIAnalysis_monthlyReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AIAnalysis"
    ADD CONSTRAINT "AIAnalysis_monthlyReviewId_fkey" FOREIGN KEY ("monthlyReviewId") REFERENCES public."MonthlyReview"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AIAnalysis AIAnalysis_weeklyReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AIAnalysis"
    ADD CONSTRAINT "AIAnalysis_weeklyReviewId_fkey" FOREIGN KEY ("weeklyReviewId") REFERENCES public."WeeklyReview"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AIReflection AIReflection_feedbackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AIReflection"
    ADD CONSTRAINT "AIReflection_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES public."AIAnalysisFeedback"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AISuccessCase AISuccessCase_feedbackId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AISuccessCase"
    ADD CONSTRAINT "AISuccessCase_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES public."AIAnalysisFeedback"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DailyPlan DailyPlan_monthlyPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailyPlan"
    ADD CONSTRAINT "DailyPlan_monthlyPlanId_fkey" FOREIGN KEY ("monthlyPlanId") REFERENCES public."MonthlyPlan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: DailyPlan DailyPlan_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailyPlan"
    ADD CONSTRAINT "DailyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DailyReview DailyReview_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailyReview"
    ADD CONSTRAINT "DailyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LifeGoal LifeGoal_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LifeGoal"
    ADD CONSTRAINT "LifeGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MonthlyPlan MonthlyPlan_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MonthlyPlan"
    ADD CONSTRAINT "MonthlyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MonthlyPlan MonthlyPlan_yearlyGoalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MonthlyPlan"
    ADD CONSTRAINT "MonthlyPlan_yearlyGoalId_fkey" FOREIGN KEY ("yearlyGoalId") REFERENCES public."YearlyGoal"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MonthlyReview MonthlyReview_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MonthlyReview"
    ADD CONSTRAINT "MonthlyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WeeklyReview WeeklyReview_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WeeklyReview"
    ADD CONSTRAINT "WeeklyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: YearlyGoal YearlyGoal_lifeGoalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."YearlyGoal"
    ADD CONSTRAINT "YearlyGoal_lifeGoalId_fkey" FOREIGN KEY ("lifeGoalId") REFERENCES public."LifeGoal"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: YearlyGoal YearlyGoal_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."YearlyGoal"
    ADD CONSTRAINT "YearlyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict FiozIWnWvMPq5bVhkT8MSbhOcFmKkauaLaPhajSJCMcsGpouKLx3KEo35FoAYq9

