--
-- PostgreSQL database dump
--

\restrict Kq8uB3IY8jNg8b7cFWPh5wgV1yvRBuIy8TX0V1Bf4Xo27FB5dOdkhpfiTc9lQwE

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
a0f678e1-7f27-4567-b0e7-e088690c786b	5d72f90e-d05c-4095-9471-f6155bde30b7	\N	\N	DAILY	{"completionSummary": "今早6:30准时起床，完成李鸿章视频粗剪(差2个小片段)。上班琐事一件件处理完。晚上开发复盘软件。", "deviationAnalysis": "1) 视频粗剪差2个小片段未完成 2) 本周运动完全挂零", "executionDiagnosis": {"fogModel": {"prompt": "缺少运动提醒机制", "ability": "晚上时间被开发占用，运动时间被挤掉", "motivation": "运动和视频剪辑动力不足，知道该做但拖延"}, "rootCause": "时间分配冲突，琐事+开发占用了运动和剪辑时间"}, "externalPerspective": "今天维护型工作偏多。明天需优先大需求，同时找回运动节奏"}	整体状态不错，早起高效。本周运动挂零需注意。情绪积极。	2026-05-21 12:58:41.635
\.


--
-- Data for Name: AIAnalysisFeedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AIAnalysisFeedback" (id, "aiAnalysisId", "userScore", "isPass", "isExcellent", "excellentReason", "failReason", "createdAt") FROM stdin;
eb3a583e-0b46-46ed-bfd0-1144713ef682	a0f678e1-7f27-4567-b0e7-e088690c786b	61	t	f	\N	分析没有引用当月目标做对比，缺少目标偏差评估	2026-05-21 13:03:35.801
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
5d72f90e-d05c-4095-9471-f6155bde30b7	1e285969-0593-48fe-a438-dd213f99e7e0	2026-05-21 00:00:00	今早6:30起床，做了李鸿章视频；目前定了完成到第3章结束，输出一个视频，目前第三章粗剪还差2个小片段；上班很多琐事，今天比较好的一点是一件件都做了，干完一件干一件，把琐事完成了，明天再搞大需求；晚上回来继续开发这个反思复盘软件；不过这周都还没有运动呢；情绪挺开心的；最近中午都是睡一会，还挺精神的	6:30起床、做了李鸿章视频、琐事一件件处理完、晚上开发复盘软件	第三章粗剪还差2个小片段、本周还没运动	上班琐事多	开心	\N	\N	ANALYZING	2026-05-21 12:56:18.246	2026-05-21 12:58:48.927
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
c5f5bc79-5793-44c0-83f4-d3bb5b84ca98	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	自媒体账号达到5000粉丝	持续运营更新一个自媒体账号，积累5000粉丝	2028	NUMERIC	5000 粉丝	2500 粉丝	2500 粉丝	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-21 13:45:20.085
1bd105f0-6658-4439-bef4-6bca8a11c244	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	年收入达到78w	2026里程碑：从72w提升到78w	2026	NUMERIC	780000 元	720000 元	720000 元	ACTIVE	\N	2026-05-19 14:53:58.941	2026-05-21 13:45:19.942
171414ee-8aa5-4833-af89-69d3eb53e297	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	体脂率降到20%（薄肌身材）	2026里程碑：从22%降到20%，建立规律训练习惯	2026	NUMERIC	20 %	22 %	22 %	ACTIVE	\N	2026-05-19 14:53:58.941	2026-05-21 13:45:19.955
039fb435-5dcc-4da5-9eca-d278fc4db1c6	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	练成薄肌挺拔身材（体脂率16%）	不驼背、肩背挺直的薄肌身材，体脂率从22%降到16%	2028	NUMERIC	16 %	18 %	18 %	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-21 13:45:20.094
50c0532e-26c6-439b-a7d2-2144ad972e16	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	充沛率≥50%（6h睡眠高精力）	2026里程碑：晨起精力充沛率从40%提升到50%	2026	PERCENTAGE	50 %	40 %	30 %	ACTIVE	\N	2026-05-19 14:53:58.941	2026-05-21 13:45:19.967
0368f43a-86a0-4cc8-8f60-e8424ec2860b	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	家庭存款达到300w	从当前10w积累到300w	2028	NUMERIC	3000000 元	2200000 元	2200000 元	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-21 13:45:20.103
4a9546d9-caa5-4f57-97c8-caa7c246bfbc	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	家庭存款达到150w	2026里程碑：从10w积累到40w	2026	NUMERIC	1500000 元	1000000 元	1000000 元	ACTIVE	\N	2026-05-19 14:53:58.941	2026-05-21 13:45:20
83952657-fe93-4e89-854f-4590b978610a	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	自媒体粉丝达到500	2026里程碑：从0积累到800粉丝，建立运营节奏	2026	NUMERIC	500 粉丝	59 粉丝	0 粉丝	ACTIVE	\N	2026-05-19 14:53:58.941	2026-05-21 14:00:13.239
cfe13c61-f9c6-4b80-b3df-f743671d1ff7	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	家庭年收入达到110w	从当前72w提升到110w，3年内实现	2028	NUMERIC	1100000 元	900000 元	900000 元	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-21 13:45:20.066
2f7cc77c-5e0d-46a2-bc68-b4c440afa940	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	6h睡眠保持高精力（充沛率≥85%）	每天复盘时自评：①闹钟响起直接起？②下午不犯困？≥1个✅=当日充沛。月充沛率≥85%	2028	PERCENTAGE	85 %	65 %	65 %	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-21 13:45:20.076
8080c70c-5f47-44b1-aea3-be90bbe733cf	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	年收入达到90w	2027里程碑：从78w提升到90w	2027	NUMERIC	900000 元	780000 元	780000 元	ACTIVE	\N	2026-05-19 14:53:58.948	2026-05-21 13:45:20.012
7f2a8323-8d91-49e0-8371-0e396f03ea43	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	体脂率降到18%（薄肌身材）	2027里程碑：从20%降到18%，肩背挺拔初现	2027	NUMERIC	18 %	20 %	20 %	ACTIVE	\N	2026-05-19 14:53:58.948	2026-05-21 13:45:20.024
6f7b2869-8e70-422b-86bf-364640cf720e	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	充沛率≥65%（6h睡眠高精力）	2027里程碑：晨起精力充沛率从50%提升到65%	2027	PERCENTAGE	65 %	50 %	50 %	ACTIVE	\N	2026-05-19 14:53:58.948	2026-05-21 13:45:20.035
04d5f19c-5db5-4431-8230-02cf0019aac6	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	自媒体粉丝达到2500	2027里程碑：从800增长到2500粉丝	2027	NUMERIC	2500 粉丝	800 粉丝	800 粉丝	ACTIVE	\N	2026-05-19 14:53:58.948	2026-05-21 13:45:20.046
e8cb4d10-d5fd-4086-a509-7c1e27634b35	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	家庭存款达到220w	2027里程碑：从40w积累到130w	2027	NUMERIC	2200000 元	1500000 元	1500000 元	ACTIVE	\N	2026-05-19 14:53:58.948	2026-05-21 13:45:20.057
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

\unrestrict Kq8uB3IY8jNg8b7cFWPh5wgV1yvRBuIy8TX0V1Bf4Xo27FB5dOdkhpfiTc9lQwE

