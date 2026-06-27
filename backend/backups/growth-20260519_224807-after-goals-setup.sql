--
-- PostgreSQL database dump
--

\restrict nQMu51SBU9jcbgkPjpsjfyxx4mL9k5YHsgqQd0dmY7ESdyzL6JKPZAOGBxnXDao

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
\.


--
-- Data for Name: AIAnalysisFeedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AIAnalysisFeedback" (id, "aiAnalysisId", "userScore", "isPass", "isExcellent", "excellentReason", "failReason", "createdAt") FROM stdin;
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
\.


--
-- Data for Name: DailyPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DailyPlan" (id, "userId", "monthlyPlanId", title, description, date, "metricType", "targetValue", "currentValue", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DailyReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DailyReview" (id, "userId", date, "rawInput", completed, "notCompleted", obstacles, "emotionState", "mindsetNote", "followUpLog", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LifeGoal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LifeGoal" (id, "userId", title, description, "timeHorizon", status, "sortOrder", "completedAt", "createdAt", "updatedAt") FROM stdin;
496ae741-04f2-4791-9b8c-8139f658771a	1e285969-0593-48fe-a438-dd213f99e7e0	时间自由·健康·家庭幸福·快乐自由	可以自由决定什么时间工作、什么时间休息。身体健康，家庭幸福，快乐自由地生活。	终身	ACTIVE	1	\N	2026-05-19 13:38:12.907	2026-05-19 13:38:12.907
\.


--
-- Data for Name: MonthlyPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MonthlyPlan" (id, "userId", "yearlyGoalId", title, description, month, year, "metricType", "targetValue", "currentValue", "startValue", status, "completedAt", "createdAt", "updatedAt") FROM stdin;
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
1e285969-0593-48fe-a438-dd213f99e7e0	lmh	30	AI产品经理	互联网、AI、新能源	\N	3.67	[{"end": "08:40", "start": "06:30"}, {"end": "22:30", "start": "21:00"}]	6	[]	{健身,健康,AI,美容院经营,自媒体}	\N	2026-05-19 13:29:57.41	2026-05-19 13:38:03.509
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
cfe13c61-f9c6-4b80-b3df-f743671d1ff7	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	家庭年收入达到110w	从当前72w提升到110w，3年内实现	2028	NUMERIC	1100000 元	720000 元	720000 元	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-19 13:50:38.753
0368f43a-86a0-4cc8-8f60-e8424ec2860b	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	家庭存款达到300w	从当前10w积累到300w	2028	NUMERIC	3000000 元	100000 元	100000 元	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-19 13:50:38.753
039fb435-5dcc-4da5-9eca-d278fc4db1c6	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	练成薄肌挺拔身材（体脂率16%）	不驼背、肩背挺直的薄肌身材，体脂率从22%降到16%	2028	NUMERIC	16 %	22 %	22 %	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-19 13:50:38.753
c5f5bc79-5793-44c0-83f4-d3bb5b84ca98	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	自媒体账号达到5000粉丝	持续运营更新一个自媒体账号，积累5000粉丝	2028	NUMERIC	5000 粉丝	0 粉丝	0 粉丝	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-19 13:50:38.753
2f7cc77c-5e0d-46a2-bc68-b4c440afa940	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	6h睡眠保持高精力（充沛率≥85%）	每天复盘时自评：①闹钟响起直接起？②下午不犯困？≥1个✅=当日充沛。月充沛率≥85%	2028	PERCENTAGE	85 %	40 %	40 %	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-19 14:41:16.039
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

\unrestrict nQMu51SBU9jcbgkPjpsjfyxx4mL9k5YHsgqQd0dmY7ESdyzL6JKPZAOGBxnXDao

