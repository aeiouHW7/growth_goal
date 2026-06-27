--
-- PostgreSQL database dump
--

\restrict ehacYIOAoXAQ4S1RzbCoKZ62WfCjn0efGaOsFxrWnpsfOTLkkwkgiT8n0hXi8G2

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


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
-- Name: AnalysisSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AnalysisSession" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "dailyReviewId" text,
    "weeklyReviewId" text,
    "monthlyReviewId" text,
    status text DEFAULT 'idle'::text NOT NULL,
    "currentStep" text,
    result jsonb,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


--
-- Name: BehaviorPattern; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BehaviorPattern" (
    id text NOT NULL,
    "userId" text NOT NULL,
    pattern text NOT NULL,
    dimension text,
    keywords text[],
    "firstDetected" timestamp(3) without time zone NOT NULL,
    "lastDetected" timestamp(3) without time zone NOT NULL,
    frequency integer DEFAULT 1 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CapabilityScore; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CapabilityScore" (
    id text NOT NULL,
    "userId" text NOT NULL,
    dimension text NOT NULL,
    score double precision NOT NULL,
    evidence text,
    source text DEFAULT 'daily_review'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: CognitiveBiasLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CognitiveBiasLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "dailyReviewId" text,
    "weeklyReviewId" text,
    "monthlyReviewId" text,
    "biasType" text NOT NULL,
    "triggerPhrase" text NOT NULL,
    evidence text NOT NULL,
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "energyRate" integer
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
3730ccb8-bd9d-48ca-ad2e-984c8bc6220b	d0a7b1e8-a12d-48ea-ad49-7354da6fcf03	\N	\N	DAILY	{"insight": {"missing": "目标行动方面：提到了6月底完成视频第一期剪辑的年度目标关联行动，但缺少具体的拆解步骤和里程碑。", "pattern": "[模式信号] 视频制作已出现 3 次，持续出现流程跳过问题", "unaware": "你说视频剪辑不顺利，但核心问题不是技术难度，而是缺少可复用的标准流程(checklist)。每次从头想流程比执行本身更耗能。"}, "baseScore": 8, "signalGap": "attribution_missing", "energyNote": "睡了7h13min，醒来仍困，眼睛干", "energyRate": 55, "signalScore": 8, "suggestions": [{"type": "critical", "message": "视频制作前必须拉checklist，逐项确认后再开始"}, {"type": "critical", "message": "与男友约定互相检查机制，确保流程不被跳过"}, {"type": "warning", "message": "补偿机制失败：上次说'下次按流程'但未执行，需更强约束"}, {"type": "warning", "message": "6月底目标缺少中间里程碑，建议拆解到每周"}, {"type": "positive", "message": "早起+运动习惯稳定，继续保持"}, {"type": "positive", "message": "情绪积极，天气转好有助状态提升"}], "foggDiagnosis": {"detail": "视频制作跳过流程 -> 能力(A)不足：缺少标准操作流程(SOP)作为执行指引。上次反馈说'下次一定按流程走'但缺少具体步骤清单，属于能力维度不足而非动机不足。", "missing": "A"}, "defensePenalty": 0, "detectedBiases": [], "signalPatterns": [{"pattern": "视频制作", "frequency": 3}, {"pattern": "运动", "frequency": 3}, {"pattern": "复盘", "frequency": 3}, {"pattern": "早起", "frequency": 3}, {"pattern": "工作推进", "frequency": 3}, {"pattern": "睡眠", "frequency": 3}], "postureTraining": {"note": "做了训练", "completed": true}, "detectedPatterns": [{"pattern": "视频制作", "dimension": "execution", "frequency": 3}, {"pattern": "运动", "dimension": "health", "frequency": 3}, {"pattern": "复盘", "dimension": "self_awareness", "frequency": 3}, {"pattern": "早起", "dimension": "health", "frequency": 3}, {"pattern": "工作推进", "dimension": "execution", "frequency": 3}, {"pattern": "睡眠", "dimension": "health", "frequency": 3}], "completionSummary": {"completed": ["6:30起床", "处理知识库产品方案", "运动", "和男友看视频"], "notCompleted": ["视频第一期剪辑"], "completionRate": "70%"}, "deviationAnalysis": {"behind": ["视频剪辑进度 — 跳过流程导致返工风险"], "onTrack": ["作息规律(6:30起床)", "运动习惯保持", "工作推进"], "riskLevel": "中"}, "executionDiagnosis": {"issues": ["视频制作未按流程走导致生成困难 — 属于Fogg模型能力(A)不足", "补偿机制检查：上次说'明天按流程来'，今日未执行 -> 补偿失败"], "pattern": "创作类任务容易跳过流程直接做，缺少checklist约束", "rootCause": "流程执行力不足 — 缺少最小可行流程(SOP)和前置checklist", "foggAnalysis": {"prompt": "不足（没有在开始前触发流程检查的机制）", "ability": "不足（缺少标准化流程指引）", "motivation": "足够（想做视频）", "recommendation": "1. 建立视频制作checklist（打印/贴墙）；2. 每次开始前先逐项确认；3. 和男友约定互相检查机制"}}, "externalPerspective": {"risks": ["跳过流程 -> 返工 -> 时间成本翻倍 -> 影响6月底目标"], "trendInsights": ["AI视频工具迭代快，流程化是保证交付质量的关键能力"], "directionCheck": "方向正确，需加强流程管理和执行SOP建设", "timeAllocation": {"waste": "跳过流程导致的返工时间", "growth": "视频制作、复盘工具开发", "suggestion": "减少消耗型时间（返工），用checklist把growth型任务标准化", "maintenance": "工作处理知识库方案"}, "newOpportunities": []}}	\N	2026-05-22 15:19:26.334
fe5e13e2-2832-4561-9864-0c06e4c9b584	\N	\N	\N	DAILY	{"insight": {"missing": "[目标行动缺失] 6月底完成第一期视频的目标在休息日无推进，虽然合理但需关注后续恢复速度。", "pattern": "[新话题] 一个规划合理的休息日，健身、家务、陪伴、早睡节奏完整。", "unaware": "你说'主要就是休息了'，但男友次日去印尼出差，这天更像是在陪伴中度过而非单纯休息。你把情感陪伴归因为'休息'，可能低估了关系维护在你日常节奏中的权重。另外，5/22视频遇到的困难这两天都没再提起，可能是在回避那个卡点。"}, "energyRate": 85, "signalScore": 8, "suggestions": [{"type": "warning", "message": "25日男友出差后，建议立即恢复视频制作节奏。5/22的卡点不会自行消失，需要专门安排时间拆解攻克。"}, {"type": "positive", "message": "休息日安排了健身、大扫除和早睡，自我管理意识良好，为下一周期积累了能量。"}, {"type": "positive", "message": "22点早睡是很好的纪律表现，睡眠充足有助于后续高效执行。视频制作需要的就是这种状态。"}], "foggDiagnosis": {"detail": "视频制作5/22已出现'不顺利'，提示能力不足（剪辑/素材），而非不想做。休息日不处理正常，关键看25日男友走后是否重启。", "missing": "A"}, "detectedBiases": [{"type": "事后合理化", "evidence": "将陪男友出国前的陪伴时间主要归因为'休息'，回避了情感陪伴的真实优先级", "triggerPhrase": "昨天主要就是休息了"}], "postureTraining": {"note": "", "completed": false}, "capabilityDeltas": [{"score": 6.5, "evidence": "休息日完成了健身和大扫除，维护型执行力正常；但主线项目停滞。对比基线6.5，维持。", "dimension": "execution"}, {"score": 8, "evidence": "主动安排休息日并在22点早睡，知晓自己需要恢复节奏。进步。", "dimension": "self_awareness"}, {"score": 6, "evidence": "10点起床保证了12小时睡眠，但占用了上午高效时段。运动→大扫除→休息的排列合理。维持。", "dimension": "time_management"}], "detectedPatterns": [{"pattern": "视频制作遇阻后未及时恢复推进", "dimension": "execution", "frequency": 2}], "completionSummary": {"completed": ["健身（练背）", "家庭大扫除", "陪伴男友", "22点早睡"], "notCompleted": [], "completionRate": "100%"}, "deviationAnalysis": {"behind": ["视频制作目标（6月底完成第一期）连续2个复盘日无推进"], "onTrack": ["休息日安排合理，无预设计划冲突"], "riskLevel": "低"}, "executionDiagnosis": {"issues": ["视频制作在5/22遇阻后，5/24休息日完全未提及，问题尚未解决"], "pattern": "视频制作遇阻后惯性停滞", "rootCause": "休息日本身合理，但视频卡点被悬置未处理"}, "externalPerspective": {"risks": ["若休息日惯性延伸到25日之后，视频项目时间窗口将进一步收窄"], "trendInsights": ["伴侣出差前安排休息日陪伴，是健康的关系维护节奏"], "directionCheck": "休息日本身合理，但视频项目截止日期（6月底）带来的时间压力在累积", "newOpportunities": ["男友出差期间可能释放更多晚间和周末时间用于视频制作"]}, "adjustmentSuggestions": {"planChanges": ["25日起恢复视频制作的每日固定时段"], "executionOptimization": ["重新评估5/22遇阻的具体环节，拆解为可执行的最小下一步"]}}	\N	2026-05-25 04:34:51.845
6089a892-a25c-4917-9622-395440874b59	cc9f1fcb-ab24-4a35-b7ae-d49611a374a3	\N	\N	DAILY	{"insight": {"missing": "[目标行动缺失] —— 未提及与视频制作年度目标相关的任何行动，休息日之后缺乏具体的追赶计划", "pattern": "视频粗剪收尾未推进（剩余2个小片段，持续悬置第5天——05-21→05-25，本次仍未提及）—— [反复障碍第4次]", "unaware": "你把5/24设为纯粹的休息日为男友送行，这个安排本身合理且执行得很好；但你没意识到的是，视频粗剪的最后2个小片段已经悬置了5天（05-21→05-25），而这次复盘你完全没有提及——可能是在用'今天本来就是休息日'来合理化回避面对剪辑决策卡点。"}, "energyRate": 82, "signalScore": 8, "suggestions": [{"type": "critical", "message": "视频粗剪已悬置5天，男友赴印尼出差是难得的独处窗口，建议今天设定'完成至少1个小片段粗剪'的具体目标"}, {"type": "critical", "message": "降低剪辑决策门槛——不要追求完美，先完成再优化。设定'15分钟只剪1个片段'的微任务来突破启动阻力"}, {"type": "warning", "message": "休息日安排合理，但需在复盘中明确标注'计划休息日'，以区分有意安排与无意拖延，避免用休息合理化回避"}, {"type": "warning", "message": "男友出差期（5/25起）独处时间增多，建议提前规划本周剩余3天的视频赶工节奏，防止窗口期被消耗型活动填充"}, {"type": "positive", "message": "休息日执行质量高：健身练背、家庭大扫除、陪伴男友、22点早睡全部完成，展现了良好的自我调节能力"}, {"type": "positive", "message": "作息管理明显进步，22点早睡为身体充分恢复提供了保障，有助于接下来窗口期的高效产出"}], "foggDiagnosis": {"detail": "粗剪最后2个小片段的核心障碍是能力/方法不足——如何剪好、如何做剪辑决策，而非不想做。休息日选择合理，但未设置恢复后的具体追赶计划使悬置持续。补偿机制检查：上次（05-22）未承诺具体哪天补，本次仍无追赶计划，补偿失败次数+1", "missing": "A"}, "detectedBiases": [{"type": "事后合理化", "evidence": "将全天定性为'主要休息'，用休息日的合理性回避了视频卡点未被触及的事实，把被动悬置包装成主动选择", "triggerPhrase": "昨天主要就是休息了"}, {"type": "现状偏差", "evidence": "明知视频粗剪有2个小片段待完成，但在复盘中有意无意地完全回避提及，倾向于保持'不提就不用面对'的舒适现状", "triggerPhrase": "（全文未提及视频进度）"}], "postureTraining": {"note": "", "completed": false}, "capabilityDeltas": [{"score": 7, "evidence": "主动安排休息日调节身心状态，22点早睡显示良好的压力管理——较历史基线6进步", "dimension": "psychological"}, {"score": 5, "evidence": "休息日节奏清晰（健身→打扫→陪伴→早睡），但对视频卡点无追赶计划——维持历史基线5", "dimension": "time_management"}, {"score": 6, "evidence": "能识别需要休息并执行了完整的恢复日，但对视频卡点的回避缺乏觉察——较历史基线7退步", "dimension": "self_awareness"}, {"score": 4, "evidence": "休息日事项执行度高（健身/打扫/早睡全部完成），但核心目标（视频粗剪）持续悬置——维持历史基线4", "dimension": "execution"}], "detectedPatterns": [{"pattern": "视频粗剪收尾未推进（剩余2个小片段，持续悬置）", "dimension": "execution", "frequency": 4}, {"pattern": "事后合理化：用'休息日'合理性回避悬置问题", "dimension": "self_awareness", "frequency": 3}], "completionSummary": {"completed": ["10点起床健身练背", "家庭大扫除", "陪伴男友看视频", "22点早睡"], "notCompleted": ["视频粗剪未推进（但当日定位为休息日）"], "completionRate": "90%（按休息日定位，休息类事项全部完成；核心目标视频持续悬置）"}, "deviationAnalysis": {"behind": ["视频制作进度——粗剪最后2个小片段，自05-21起悬置第5天未推进"], "onTrack": ["身体管理（健身练背）", "作息管理（22点早睡）"], "riskLevel": "中"}, "executionDiagnosis": {"issues": ["视频粗剪收尾未推进（剩余2个小片段，持续悬置第5天——05-21→05-25，本次复盘仍未提及）", "休息日本身合理，但未附带恢复后的追赶计划"], "pattern": "创意收尾阶段的剪辑决策困难（能力不足）而非不愿做（动机不足）", "rootCause": "视频剪辑进入创意收尾阶段（能力不足/决策困难），叠加休息日的合理性使回避行为被持续合理化"}, "externalPerspective": {"risks": ["窗口期未被利用的风险：独处时间也可能被消耗型活动（刷视频/无所事事）填充，需提前设好计划"], "trendInsights": ["男友赴印尼出差意味着未来数天独处时间显著增多，这是追赶视频进度的黄金窗口期"], "directionCheck": "视频制作是年度核心目标之一，休息日本身合理但需确保窗口期被有效利用，否则悬置时间过长将导致项目动力持续衰减", "newOpportunities": ["利用男友出差期间（5/25起）集中精力推进视频制作，独处=低干扰=高产出环境"]}, "adjustmentSuggestions": {"planChanges": ["今日（5/25）男友赴印尼出差，独处时间增多，建议安排专门时段攻克视频粗剪", "设定本周目标：5/25-5/27 完成所有粗剪片段"], "executionOptimization": ["降低剪辑门槛：设定'15分钟只剪1个小片段'的微任务，完成后即可休息", "明确截止：今天内完成至少1个小片段粗剪，不必追求完美", "采用番茄钟：25分钟剪辑 + 5分钟休息，降低启动阻力"]}}	\N	2026-05-25 14:10:03.413
f79591ed-3749-4bea-9112-f5a264aa92c0	8f5f506a-c70f-4e8d-88ea-0ec20b3384ed	\N	\N	DAILY	{"insight": {"missing": "[目标行动缺失] 未提及任何与年度目标对齐的行动，也未设定明日计划来应对外部依赖的不确定性", "pattern": "视频粗剪长期悬置后取得突破（片段一完成），[反复障碍第6天→突破]；但产生新依赖模式——进度受制于外部协作方，且未主动管理前置条件", "unaware": "你说『视频片段一剪辑完了』但未提质量感受——完成了量的目标，但可能对成片质量存疑才避而不谈。转向小红书的逻辑通顺，但你没问自己：在等待男友前置工作的间隙，有没有不需要依赖他人的视频工作可以并行推进？"}, "energyNote": "经前疲劳期影响下午精力，但早起高效，全天完成4项任务，综合推断", "energyRate": 62, "signalScore": 8, "suggestions": [{"type": "critical", "message": "视频外部依赖亟需建立同步机制——和男友确认前置工作的预期完成时间，同时规划自身在等待期的备选任务（如封面设计、文案脚本、分镜草图）"}, {"type": "critical", "message": "经前疲劳期即将到来（精力诊断Q2），建议提前规划2-3天低能耗模式：降低任务量至核心2项（早起+体态训练），其余任务只做『最低可行版本』"}, {"type": "warning", "message": "视频片段一完成后建议获取外部反馈（男友或朋友看一眼），避免陷入『做完就算好』的完成主义——尤其是之前卡了好几天的作品"}, {"type": "warning", "message": "小红书情侣号发布后缺少效果复盘节点，建议设定24h数据检视点，让每次发布都形成优化闭环"}, {"type": "warning", "message": "未制定明日计划——外部依赖的不确定性恰恰需要计划来兜底，建议每晚用3分钟设定次日『必做1件事+备选1件事』"}, {"type": "positive", "message": "早起6:30 + 体态训练双习惯保持稳定，是很好的基石行为，为全天产出提供了结构锚点"}, {"type": "positive", "message": "视频片段一完成打破了多日悬置（05-21→05-26），证明你具备突破执行障碍的能力，值得给自己一个肯定"}, {"type": "positive", "message": "工作日兼顾主业交付 + 个人创作，精力分配成熟，多任务管理能力进步明显"}], "foggDiagnosis": {"detail": "视频其他片段的阻塞并非动机（M）或能力（A）问题，而是缺乏协作提示机制（P）——未与男友确认前置工作的预期完成时间，也未设置定期 check-in 节点来主动管理外部依赖", "missing": "P"}, "detectedBiases": [{"type": "事后合理化", "evidence": "用『所以』建立单向因果链，将转向小红书包装为唯一合理选择，但未审视在等待期是否存在不依赖他人的视频相关工作可做", "triggerPhrase": "剩余的内容依赖男友前置工作，所以就继续输出小红书视频了"}], "postureTraining": {"note": "", "completed": true}, "capabilityDeltas": [{"score": 7, "evidence": "单日完成视频剪辑、工作交付、小红书发布、体态训练4项任务，产出量显著高于近期均值（进步，vs 基线4）", "dimension": "execution"}, {"score": 7, "evidence": "6:30起全天有序切换视频/工作/小红书，碎片时间利用效率高（进步，vs 基线5）", "dimension": "time_management"}, {"score": 7, "evidence": "如实报告经前疲劳状态，对精力变化有清晰感知（进步，vs 基线6）", "dimension": "self_awareness"}, {"score": 7, "evidence": "面对外部依赖保持灵活，未产生抱怨或焦虑情绪（维持，vs 基线7）", "dimension": "psychological"}], "detectedPatterns": [{"pattern": "早起习惯维持（6:30），清晨高效时段用于视频制作", "dimension": "time_management", "frequency": 2}, {"pattern": "视频制作从『自身能力卡顿』（粗剪决策困难，悬置05-21→05-25）转为『外部协作依赖』，障碍类型迁移但进度仍受制约", "dimension": "execution", "frequency": 1}, {"pattern": "经前疲劳期影响下午精力，但未提前规划低能耗应对方案", "dimension": "psychological", "frequency": 1}], "completionSummary": {"completed": ["早起 6:30", "体态训练", "视频片段一剪辑完成", "鹏管家需求交付完成", "小红书情侣号发布 1 篇"], "notCompleted": ["视频其他片段（依赖男友前置工作）"], "completionRate": "约 85%"}, "deviationAnalysis": {"behind": ["视频整体进度仍受外部协作方制约，不可控节点未设管理机制"], "onTrack": ["早起 + 体态训练双习惯保持稳定", "视频制作有实质推进（片段一完成，打破多日悬置）", "工作交付正常"], "riskLevel": "中"}, "executionDiagnosis": {"issues": ["视频其他片段依赖男友前置工作，自身进度被动等待（外部依赖，非内部执行力问题）", "经前疲劳期即将到来，但未规划低能耗日的应对方案"], "pattern": "个人可控部分执行力强（早起、剪辑、工作、小红书），但遇到协作依赖时倾向被动等待而非主动管理前置条件", "rootCause": "内容创作链路中存在不可控协作节点，且缺乏双向同步机制（确认交付时间 + 设置 check-in）"}, "externalPerspective": {"risks": ["协作依赖单一节点（仅男友），前置工作一旦延迟，整个视频线停滞", "经前疲劳 + 外部依赖双重不确定叠加，本周后半段产出可能明显下降"], "trendInsights": ["个人创作者越来越多依赖协作链路（摄影/剪辑外包），管理协作方是内容生产者的核心能力之一", "多平台运营（视频 + 小红书）是趋势，但需注意精力分配避免主要赛道被次要赛道挤占"], "directionCheck": "小红书情侣号作为视频内容的预热/引流渠道，方向合理；但需警惕成为视频制作卡顿时的『舒适区转移』——用小红书的高反馈替代视频的低反馈", "newOpportunities": ["情侣号内容可与视频主题联动（如拍摄花絮、创作幕后），形成跨平台内容矩阵"]}, "adjustmentSuggestions": {"planChanges": ["与男友明确前置工作交付时间（如：周三前完成），并约定一个 check-in 时间点", "规划等待期的备选任务清单——不依赖他人的视频工作（如脚本、文案、封面设计）"], "executionOptimization": ["经前疲劳期降低任务颗粒度：保留早起和体态训练核心习惯，其他任务减量不减质", "小红书发布后设置效果复盘节点（24h 后看数据），避免只管发不管优化"]}}	\N	2026-05-27 13:05:06.021
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
-- Data for Name: AnalysisSession; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AnalysisSession" (id, "userId", "dailyReviewId", "weeklyReviewId", "monthlyReviewId", status, "currentStep", result, "startedAt", "completedAt") FROM stdin;
\.


--
-- Data for Name: BehaviorPattern; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BehaviorPattern" (id, "userId", pattern, dimension, keywords, "firstDetected", "lastDetected", frequency, active, "createdAt", "updatedAt") FROM stdin;
88eddaf3-7ef8-4e6b-8ddb-c26d11803c1b	1e285969-0593-48fe-a438-dd213f99e7e0	视频粗剪最后2个小片段未完成（持续悬置第5天，05-21→05-25）	execution	\N	2026-05-25 13:00:34.962	2026-05-25 13:00:34.962	1	t	2026-05-25 13:00:34.963	2026-05-25 13:00:34.963
ac9bd004-b3a3-457b-9c78-0e25de982fd9	1e285969-0593-48fe-a438-dd213f99e7e0	休息日主动选择暂停，但缺乏恢复后的追赶计划	execution	\N	2026-05-25 12:52:17.845	2026-05-25 13:00:34.97	2	t	2026-05-25 12:52:17.845	2026-05-25 13:00:34.971
b9c18026-c522-4a63-8b38-7c1d3410ea9b	1e285969-0593-48fe-a438-dd213f99e7e0	创意收尾阶段的剪辑决策困难（能力不足）而非不愿做（动机不足）	execution	\N	2026-05-25 13:00:34.977	2026-05-25 13:00:34.977	1	t	2026-05-25 13:00:34.977	2026-05-25 13:00:34.977
1f2e66e8-d077-4073-8e57-108707ae29ee	1e285969-0593-48fe-a438-dd213f99e7e0	粗剪最后2个小片段属于创意收尾阶段，可能涉及剪辑决策困难（能力不足），而非不愿做（动机不足）。降低门槛策略（如先粗剪1个片段休息）可能比催促更有效。	execution	\N	2026-05-25 12:52:17.851	2026-05-25 13:00:34.988	2	t	2026-05-25 12:52:17.852	2026-05-25 13:00:34.989
853f9faa-27bb-4ef9-9005-cf83a6d6fda1	1e285969-0593-48fe-a438-dd213f99e7e0	复盘	self_awareness	{}	2026-05-22 15:19:26.289	2026-05-25 14:10:03.441	2	t	2026-05-22 15:19:26.291	2026-05-25 14:10:03.442
4ad28462-5740-40d9-aced-0a94999b5e77	1e285969-0593-48fe-a438-dd213f99e7e0	休息日本身合理，但未附带恢复后的追赶计划	execution	\N	2026-05-25 14:10:03.452	2026-05-25 14:10:03.452	1	t	2026-05-25 14:10:03.454	2026-05-25 14:10:03.454
8f008356-3b8f-49d9-8576-137786e6b89a	1e285969-0593-48fe-a438-dd213f99e7e0	运动	health	{}	2026-05-22 15:19:26.285	2026-05-22 15:19:26.285	1	t	2026-05-22 15:19:26.286	2026-05-22 15:19:26.286
1f838698-c7be-4daa-ba3f-3dccff0594b2	1e285969-0593-48fe-a438-dd213f99e7e0	早起	health	{}	2026-05-22 15:19:26.294	2026-05-22 15:19:26.294	1	t	2026-05-22 15:19:26.295	2026-05-22 15:19:26.295
a9211276-869a-460e-a5b8-9d76aac081e4	1e285969-0593-48fe-a438-dd213f99e7e0	工作推进	execution	{}	2026-05-22 15:19:26.301	2026-05-22 15:19:26.301	1	t	2026-05-22 15:19:26.302	2026-05-22 15:19:26.302
b8028deb-59a8-41ca-9c84-43bfc4fbf8e6	1e285969-0593-48fe-a438-dd213f99e7e0	睡眠	health	{}	2026-05-22 15:19:26.306	2026-05-22 15:19:26.306	1	t	2026-05-22 15:19:26.307	2026-05-22 15:19:26.307
f6de1e65-4721-4827-94aa-d5fc42fdb15e	1e285969-0593-48fe-a438-dd213f99e7e0	视频剪辑进入创意收尾阶段（能力不足/决策困难），叠加休息日的合理性使回避行为被持续合理化	execution	\N	2026-05-25 14:10:03.459	2026-05-25 14:10:03.459	1	t	2026-05-25 14:10:03.461	2026-05-25 14:10:03.461
02811450-a37c-4a24-b38c-56d13600b897	1e285969-0593-48fe-a438-dd213f99e7e0	休息日本身合理，但视频卡点被悬置未处理	execution	\N	2026-05-25 04:34:51.923	2026-05-25 04:34:51.923	1	t	2026-05-25 04:34:51.924	2026-05-25 04:34:51.924
0e877b4f-3ed3-4f45-b91c-f37ece47fcff	1e285969-0593-48fe-a438-dd213f99e7e0	视频制作	execution	{}	2026-05-22 15:19:26.276	2026-05-25 04:34:51.934	3	t	2026-05-22 15:19:26.277	2026-05-25 04:34:51.936
73eb43eb-d282-4e08-bafb-5dcc2fa7e92d	1e285969-0593-48fe-a438-dd213f99e7e0	视频粗剪收尾未推进（剩余2个小片段，持续悬置——05-21至今）	execution	\N	2026-05-25 12:52:17.837	2026-05-25 12:52:17.837	1	t	2026-05-25 12:52:17.838	2026-05-25 12:52:17.838
00a8dfec-1000-4b32-8fe0-6625d10b84b7	1e285969-0593-48fe-a438-dd213f99e7e0	粗剪最后2个小片段的核心障碍是能力/方法不足——如何剪好、如何做剪辑决策，而非不想做。休息日选择合理，但未设置恢复后的具体追赶计划使悬置持续。补偿机制检查：上次（05-22）未承诺具体哪天补，本次仍无追赶计划，补偿失败次数+1	execution	\N	2026-05-25 14:10:03.465	2026-05-25 14:10:03.465	1	t	2026-05-25 14:10:03.466	2026-05-25 14:10:03.466
65801ccb-5724-4baa-b515-8302d5cd62bd	1e285969-0593-48fe-a438-dd213f99e7e0	视频其他片段依赖男友前置工作，自身进度被动等待（外部依赖，非内部执行力问题）	execution	\N	2026-05-27 13:05:06.061	2026-05-27 13:05:06.061	1	t	2026-05-27 13:05:06.062	2026-05-27 13:05:06.062
f83cb29f-9c65-473b-ad0f-3b4a30634d37	1e285969-0593-48fe-a438-dd213f99e7e0	经前疲劳期即将到来，但未规划低能耗日的应对方案	execution	\N	2026-05-27 13:05:06.073	2026-05-27 13:05:06.073	1	t	2026-05-27 13:05:06.075	2026-05-27 13:05:06.075
b91f3fa2-3494-44c8-b25b-17f3c5040a34	1e285969-0593-48fe-a438-dd213f99e7e0	内容创作链路中存在不可控协作节点，且缺乏双向同步机制（确认交付时间 + 设置 check-in）	execution	\N	2026-05-27 13:05:06.083	2026-05-27 13:05:06.083	1	t	2026-05-27 13:05:06.085	2026-05-27 13:05:06.085
f0b4b616-5915-45e5-acab-ef18794082af	1e285969-0593-48fe-a438-dd213f99e7e0	视频其他片段的阻塞并非动机（M）或能力（A）问题，而是缺乏协作提示机制（P）——未与男友确认前置工作的预期完成时间，也未设置定期 check-in 节点来主动管理外部依赖	execution	\N	2026-05-27 13:05:06.089	2026-05-27 13:05:06.089	1	t	2026-05-27 13:05:06.09	2026-05-27 13:05:06.09
\.


--
-- Data for Name: CapabilityScore; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CapabilityScore" (id, "userId", dimension, score, evidence, source, "createdAt") FROM stdin;
dc80954d-e2c6-4334-8cef-c36942d20308	1e285969-0593-48fe-a438-dd213f99e7e0	execution	6.5	今天按计划完成任务，效率不错	daily_review	2026-05-22 15:06:17.612
a877bd5f-ea9a-4d92-86af-39a53efcab3c	1e285969-0593-48fe-a438-dd213f99e7e0	execution	6.5	休息日完成了健身和大扫除，维护型执行力正常；但主线项目停滞。对比基线6.5，维持。	daily_review	2026-05-25 04:34:51.899
9a871e6f-0c82-4db9-a143-25d807db59f0	1e285969-0593-48fe-a438-dd213f99e7e0	self_awareness	8	主动安排休息日并在22点早睡，知晓自己需要恢复节奏。进步。	daily_review	2026-05-25 04:34:51.909
fed6d360-d227-4883-9d50-6efee77bb3ff	1e285969-0593-48fe-a438-dd213f99e7e0	time_management	6	10点起床保证了12小时睡眠，但占用了上午高效时段。运动→大扫除→休息的排列合理。维持。	daily_review	2026-05-25 04:34:51.924
01198eaf-5239-47dc-b3ed-6026bb70552c	1e285969-0593-48fe-a438-dd213f99e7e0	time_management	6	休息日安排有节奏（健身→大扫除→陪伴→早睡），时间分配合理。但视频进度停滞无追赶计划，维持6分。	daily_review	2026-05-25 12:52:17.835
7a5fe600-379e-4c0c-ac03-a04685bdce79	1e285969-0593-48fe-a438-dd213f99e7e0	self_awareness	8	清楚感知到需要休息，并主动安排了恢复日，维持8分。	daily_review	2026-05-25 12:52:17.843
c047ea1d-6b0f-437c-894b-7f035976006d	1e285969-0593-48fe-a438-dd213f99e7e0	execution	6	休息日本身的执行完成度很高，但视频目标持续无推进，从6.5略降至6。	daily_review	2026-05-25 12:52:17.85
b3f33a84-6ee4-4ffb-936e-84597cf02612	1e285969-0593-48fe-a438-dd213f99e7e0	execution	5	视频粗剪卡点自05-21悬置至今4天未推进（退步，基线6）	daily_review	2026-05-25 13:00:34.96
adcd572d-3cd6-4699-81f6-bd64c5799987	1e285969-0593-48fe-a438-dd213f99e7e0	self_awareness	8	清楚识别自己需要休息日，选择早睡为次日男友出差储备精力（维持，基线8）	daily_review	2026-05-25 13:00:34.969
fcc690d3-8c23-4b1b-beae-9c2b9daf00a4	1e285969-0593-48fe-a438-dd213f99e7e0	time_management	5	休息日未前置规划恢复后的追赶安排，视频卡点悬置未排时间（退步，基线6）	daily_review	2026-05-25 13:00:34.974
7b42a245-46ac-43dd-abdd-b0a6aff400f4	1e285969-0593-48fe-a438-dd213f99e7e0	execution	4	视频粗剪收尾持续未推进（第4天），比基线5下降。运动执行良好但核心项目停滞	daily_review	2026-05-25 13:52:18.695
c595529b-834a-4021-8b68-d97389df64bc	1e285969-0593-48fe-a438-dd213f99e7e0	self_awareness	7	能识别休息日的必要性并主动休息，但复盘时未提及视频项目的悬置状态，比基线8略降	daily_review	2026-05-25 13:52:18.704
b74b9cd7-d0a2-434c-9874-90b3debd2158	1e285969-0593-48fe-a438-dd213f99e7e0	time_management	5	休息日安排合理（健身→打扫→陪伴→早睡），但与基线5持平，视频项目管理维度表现不足	daily_review	2026-05-25 13:52:18.714
9015b315-4679-41b6-b3a9-3fa23ca87d41	1e285969-0593-48fe-a438-dd213f99e7e0	psychological	6	能主动选择休息恢复精力，但存在对创意决策的回避倾向，需要建立更低门槛的执行策略	daily_review	2026-05-25 13:52:18.724
28917566-da7d-4f4e-a292-10146bebc976	1e285969-0593-48fe-a438-dd213f99e7e0	psychological	7	主动安排休息日调节身心状态，22点早睡显示良好的压力管理——较历史基线6进步	daily_review	2026-05-25 14:10:03.44
8028fe5a-3a97-4c76-bc40-cc63ff3ca141	1e285969-0593-48fe-a438-dd213f99e7e0	time_management	5	休息日节奏清晰（健身→打扫→陪伴→早睡），但对视频卡点无追赶计划——维持历史基线5	daily_review	2026-05-25 14:10:03.456
714ee4c7-1c84-4045-b503-f9fe4314095e	1e285969-0593-48fe-a438-dd213f99e7e0	self_awareness	6	能识别需要休息并执行了完整的恢复日，但对视频卡点的回避缺乏觉察——较历史基线7退步	daily_review	2026-05-25 14:10:03.463
e3144f2a-867a-40ca-ae54-fb79c71daa85	1e285969-0593-48fe-a438-dd213f99e7e0	execution	4	休息日事项执行度高（健身/打扫/早睡全部完成），但核心目标（视频粗剪）持续悬置——维持历史基线4	daily_review	2026-05-25 14:10:03.469
37d1393e-dd1d-4876-b350-1e2950ef2b84	1e285969-0593-48fe-a438-dd213f99e7e0	execution	7	单日完成视频剪辑、工作交付、小红书发布、体态训练4项任务，产出量显著高于近期均值（进步，vs 基线4）	daily_review	2026-05-27 13:05:06.061
ea8fbbe2-21fa-48f2-a615-044c5e503af9	1e285969-0593-48fe-a438-dd213f99e7e0	time_management	7	6:30起全天有序切换视频/工作/小红书，碎片时间利用效率高（进步，vs 基线5）	daily_review	2026-05-27 13:05:06.075
950a111e-eed3-4d8f-84f8-0efaf45d1bb7	1e285969-0593-48fe-a438-dd213f99e7e0	self_awareness	7	如实报告经前疲劳状态，对精力变化有清晰感知（进步，vs 基线6）	daily_review	2026-05-27 13:05:06.082
36e603e3-0ab9-4e7d-acf9-0e9abda17cb1	1e285969-0593-48fe-a438-dd213f99e7e0	psychological	7	面对外部依赖保持灵活，未产生抱怨或焦虑情绪（维持，vs 基线7）	daily_review	2026-05-27 13:05:06.087
\.


--
-- Data for Name: CognitiveBiasLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CognitiveBiasLog" (id, "userId", "dailyReviewId", "weeklyReviewId", "monthlyReviewId", "biasType", "triggerPhrase", evidence, "createdAt") FROM stdin;
69e380ee-47fd-4b57-87dc-d553bcfe377d	1e285969-0593-48fe-a438-dd213f99e7e0	\N	\N	\N	事后合理化	昨天主要就是休息了	将陪男友出国前的陪伴时间主要归因为'休息'，回避了情感陪伴的真实优先级	2026-05-25 04:34:51.897
b4c1cf76-4a16-4bb8-8919-15cc72f0ea29	1e285969-0593-48fe-a438-dd213f99e7e0	\N	\N	\N	事后合理化	昨天主要就是休息了	用'主要就是休息了'概括全天，回避了视频卡点被悬置未处理的事实，为没有推进找合理理由。	2026-05-25 12:52:17.834
83d26513-69bf-4b9b-a0b5-6c55d80a27a8	1e285969-0593-48fe-a438-dd213f99e7e0	\N	\N	\N	事后合理化	昨天主要就是休息了	实际上昨天有健身+大扫除+追剧+早睡，并非完全的'休息'——用户用这句话概括全天，回避了对视频卡点悬置未处理的自我评价	2026-05-25 13:00:34.957
789e2a51-4004-4e58-a408-60d516b03a06	1e285969-0593-48fe-a438-dd213f99e7e0	\N	\N	\N	现状偏差	（未提及视频进度）	视频粗剪剩余2个小片段自05-21持续悬置至今4天，本次复盘完全未提及进度或新安排，明知该推进却保持现状未处理	2026-05-25 13:00:34.963
0aae8ee6-a6b5-417b-beeb-917c08dec9e0	1e285969-0593-48fe-a438-dd213f99e7e0	\N	\N	\N	事后合理化	昨天主要就是休息了	使用'主要就是休息'定性全天活动，但未提及已持续4天的视频项目悬置，用'休息日'的合理性回避了未完成工作的存在	2026-05-25 13:52:18.69
52b997ea-d013-47d1-b5b1-682b96f982ce	1e285969-0593-48fe-a438-dd213f99e7e0	\N	\N	\N	现状偏差	（未提及视频进度）	在复盘中对已持续4天的视频粗剪收尾卡顿完全沉默，倾向于接受'视频搁置'的现状而非主动在复盘时暴露问题	2026-05-25 13:52:18.699
e9e7cc20-a9ce-427c-864b-40a46bbfe82a	1e285969-0593-48fe-a438-dd213f99e7e0	cc9f1fcb-ab24-4a35-b7ae-d49611a374a3	\N	\N	事后合理化	昨天主要就是休息了	将全天定性为'主要休息'，用休息日的合理性回避了视频卡点未被触及的事实，把被动悬置包装成主动选择	2026-05-25 14:10:03.438
399915fd-f2d3-4710-8164-1ed040ed1d94	1e285969-0593-48fe-a438-dd213f99e7e0	cc9f1fcb-ab24-4a35-b7ae-d49611a374a3	\N	\N	现状偏差	（全文未提及视频进度）	明知视频粗剪有2个小片段待完成，但在复盘中有意无意地完全回避提及，倾向于保持'不提就不用面对'的舒适现状	2026-05-25 14:10:03.445
2b74f86d-1947-472c-801a-1ed06f8ed93d	1e285969-0593-48fe-a438-dd213f99e7e0	8f5f506a-c70f-4e8d-88ea-0ec20b3384ed	\N	\N	事后合理化	剩余的内容依赖男友前置工作，所以就继续输出小红书视频了	用『所以』建立单向因果链，将转向小红书包装为唯一合理选择，但未审视在等待期是否存在不依赖他人的视频相关工作可做	2026-05-27 13:05:06.058
\.


--
-- Data for Name: DailyPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DailyPlan" (id, "userId", "monthlyPlanId", title, description, date, "metricType", "targetValue", "currentValue", status, "createdAt", "updatedAt") FROM stdin;
39244080-6506-4bc3-b744-745c90f28e82	1e285969-0593-48fe-a438-dd213f99e7e0	8926d69d-defb-4be8-b876-643a33a76002	李鸿章视频粗剪	早上6:30-8:40做视频粗剪	2026-06-01 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.753	2026-05-31 09:54:32.753
0e697e56-7d16-4128-aca4-de77021031eb	1e285969-0593-48fe-a438-dd213f99e7e0	55b8a353-08d5-404d-b25e-21070d38222e	美容院门牌设计	晚上做门牌设计	2026-06-01 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.76	2026-05-31 09:54:32.76
b4b81fad-008e-439b-921d-f9efd8e78cf7	1e285969-0593-48fe-a438-dd213f99e7e0	8926d69d-defb-4be8-b876-643a33a76002	李鸿章视频粗剪	早上6:30-8:40做视频粗剪	2026-06-02 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.767	2026-05-31 09:54:32.767
ac161e96-a742-40e5-83d9-5d7051d57d7e	1e285969-0593-48fe-a438-dd213f99e7e0	b77eae97-c744-401a-b2a2-1d393cf8c4f7	小红书笔记 发布#1	晚上发布一篇情侣号笔记	2026-06-02 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.774	2026-05-31 09:54:32.774
f1fe79a9-79ab-45ec-9451-67c893a3a4fc	1e285969-0593-48fe-a438-dd213f99e7e0	8926d69d-defb-4be8-b876-643a33a76002	李鸿章视频粗剪	早上6:30-8:40做视频粗剪	2026-06-03 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.781	2026-05-31 09:54:32.781
5300673a-7d3a-46d5-ad29-6f5f9f7b8848	1e285969-0593-48fe-a438-dd213f99e7e0	55b8a353-08d5-404d-b25e-21070d38222e	美容院门牌设计	晚上做门牌设计	2026-06-03 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.787	2026-05-31 09:54:32.787
1027382b-9041-4ab2-9736-33c063d2fa69	1e285969-0593-48fe-a438-dd213f99e7e0	0e28d427-3752-4922-a87e-42c3ddbaff62	体态训练	晚上健身1小时	2026-06-03 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.793	2026-05-31 09:54:32.793
2d3dd27a-dd5f-4980-8719-3548ac54764e	1e285969-0593-48fe-a438-dd213f99e7e0	8926d69d-defb-4be8-b876-643a33a76002	李鸿章视频粗剪	早上6:30-8:40做视频粗剪	2026-06-04 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.799	2026-05-31 09:54:32.799
0b249959-3b5d-4a20-9f3d-4e918cc3e43b	1e285969-0593-48fe-a438-dd213f99e7e0	b77eae97-c744-401a-b2a2-1d393cf8c4f7	小红书笔记 发布#2	晚上发布一篇情侣号笔记	2026-06-04 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.805	2026-05-31 09:54:32.805
8706c055-8670-4856-bc5e-682ecf52d84f	1e285969-0593-48fe-a438-dd213f99e7e0	0e28d427-3752-4922-a87e-42c3ddbaff62	体态训练	晚上健身1小时	2026-06-04 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.812	2026-05-31 09:54:32.812
14616699-92e3-4cf3-b0b7-01f262bb7dd2	1e285969-0593-48fe-a438-dd213f99e7e0	8926d69d-defb-4be8-b876-643a33a76002	李鸿章视频粗剪	早上6:30-8:40做视频粗剪	2026-06-05 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.821	2026-05-31 09:54:32.821
d6afefbb-1a5a-4082-8d3f-63a668f002df	1e285969-0593-48fe-a438-dd213f99e7e0	55b8a353-08d5-404d-b25e-21070d38222e	美容院门牌设计	晚上做门牌设计	2026-06-05 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.826	2026-05-31 09:54:32.826
0da0ec10-1e61-4721-9809-518459fa5d3d	1e285969-0593-48fe-a438-dd213f99e7e0	ea49279b-3844-4e1b-a178-5db5fc2637d6	优化复盘app	根据男友反馈优化复盘app	2026-06-06 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.832	2026-05-31 09:54:32.832
ce3614b9-d1ff-4235-951c-8b93fe7cd806	1e285969-0593-48fe-a438-dd213f99e7e0	0e28d427-3752-4922-a87e-42c3ddbaff62	体态训练	健身1小时	2026-06-06 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.838	2026-05-31 09:54:32.838
9545b829-1972-4797-82b7-fee40fa993b2	1e285969-0593-48fe-a438-dd213f99e7e0	ea49279b-3844-4e1b-a178-5db5fc2637d6	优化复盘app 收尾	复盘app优化收尾，规划下周	2026-06-07 00:00:00	NUMERIC	1	\N	PENDING	2026-05-31 09:54:32.857	2026-05-31 09:54:32.857
\.


--
-- Data for Name: DailyReview; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DailyReview" (id, "userId", date, "rawInput", completed, "notCompleted", obstacles, "emotionState", "mindsetNote", "followUpLog", status, "createdAt", "updatedAt", "energyRate") FROM stdin;
5d72f90e-d05c-4095-9471-f6155bde30b7	1e285969-0593-48fe-a438-dd213f99e7e0	2026-05-21 00:00:00	今早6:30起床，做了李鸿章视频；目前定了完成到第3章结束，输出一个视频，目前第三章粗剪还差2个小片段；上班很多琐事，今天比较好的一点是一件件都做了，干完一件干一件，把琐事完成了，明天再搞大需求；晚上回来继续开发这个反思复盘软件；不过这周都还没有运动呢；情绪挺开心的；最近中午都是睡一会，还挺精神的	6:30起床、做了李鸿章视频、琐事一件件处理完、晚上开发复盘软件	第三章粗剪还差2个小片段、本周还没运动	上班琐事多	开心	\N	null	ANALYZING	2026-05-21 12:56:18.246	2026-05-21 12:58:48.927	\N
d0a7b1e8-a12d-48ea-ad49-7354da6fcf03	1e285969-0593-48fe-a438-dd213f99e7e0	2026-05-22 00:00:00	今天6:30起来的；今天出的视频不顺利，计划6月底能完成视频第一期的视频剪辑；白天工作主要是处理知识库这个需求的一些产品方案；晚上回家做了运动；然后和男友看了会视频，现在继续把这个复盘小工具搞完，今天要是周六可以晚点睡觉	6:30起床、处理知识库产品方案、运动、和男友看视频	视频第一期剪辑未完成	视频剪辑不顺利	开心，周五不下雨天气晴朗	周六可以晚点睡，轻松	[{"answer": "没有很按照流程走，视频生成比较难。已和男友反馈，下次一定都按流程来。", "question": "视频剪辑具体哪里不顺利？遇到什么问题了？"}]	ANALYZING	2026-05-22 14:19:55.32	2026-05-22 15:19:26.34	\N
cc9f1fcb-ab24-4a35-b7ae-d49611a374a3	1e285969-0593-48fe-a438-dd213f99e7e0	2026-05-24 00:00:00	复盘一下5.24昨日，早上10点起床去健身练了背；然后把家里大扫除了下；昨天主要就是休息了，和男友看了视频，早上22点早早睡觉了，因为25号男友要一早去印尼出差	\N	\N	\N	\N	\N	\N	ANALYZING	2026-05-25 14:08:49.932	2026-05-25 14:08:49.932	\N
60c0af98-a25c-4281-913b-30f619cdc0cd	1e285969-0593-48fe-a438-dd213f99e7e0	2026-05-27 00:00:00	充沛率为什么没有呢	\N	\N	\N	\N	\N	\N	ANALYZING	2026-05-27 13:07:04.639	2026-05-27 13:07:04.639	\N
8f5f506a-c70f-4e8d-88ea-0ec20b3384ed	1e285969-0593-48fe-a438-dd213f99e7e0	2026-05-26 00:00:00	复盘5.26的，早上6:30起床的把视频片段一剪辑完了；剩余的内容依赖男友前置工作，所以就继续输出小红书视频了，白天工作将鹏管家的需求搞完了；晚上回家搞了小红书，发布了一篇情侣号	\N	\N	\N	\N	\N	\N	ANALYZING	2026-05-27 12:53:54.69	2026-05-27 13:15:14.875	62
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
b77eae97-c744-401a-b2a2-1d393cf8c4f7	1e285969-0593-48fe-a438-dd213f99e7e0	83952657-fe93-4e89-854f-4590b978610a	小红书粉丝达到100	每周生成2篇小红书情侣笔记	6	2026	NUMERIC	100	\N	59	ACTIVE	\N	2026-05-22 16:02:52.537	2026-05-22 16:02:52.537
8926d69d-defb-4be8-b876-643a33a76002	1e285969-0593-48fe-a438-dd213f99e7e0	1bd105f0-6658-4439-bef4-6bca8a11c244	李鸿章视频第一期制作并发布	完成视频第一期剪辑并发布，作为副业收入的核心执行	6	2026	NUMERIC	1	\N	0	ACTIVE	\N	2026-05-22 16:02:52.561	2026-05-22 16:02:52.561
ea49279b-3844-4e1b-a178-5db5fc2637d6	1e285969-0593-48fe-a438-dd213f99e7e0	1bd105f0-6658-4439-bef4-6bca8a11c244	AI 赚钱方向探索	探索AI做软件卖钱的可行性，输出至少1个可行的产品方向	6	2026	NUMERIC	1	\N	0	ACTIVE	\N	2026-05-22 16:02:52.571	2026-05-22 16:02:52.571
fb3ac299-6ef5-4e7a-8b11-bd97c10cc01b	1e285969-0593-48fe-a438-dd213f99e7e0	4a9546d9-caa5-4f57-97c8-caa7c246bfbc	家庭存款按计划推进	按每月定额存款计划执行	6	2026	NUMERIC	1	\N	0	ACTIVE	\N	2026-05-22 16:02:52.591	2026-05-22 16:02:52.591
aebe2ad0-ae99-4c1e-b5c2-d5bb6f31b873	1e285969-0593-48fe-a438-dd213f99e7e0	50c0532e-26c6-439b-a7d2-2144ad972e16	充沛率大于40	月均充沛率保持40%以上	6	2026	PERCENTAGE	40%	\N	40%	ACTIVE	\N	2026-05-22 16:03:17.873	2026-05-22 16:03:17.873
55b8a353-08d5-404d-b25e-21070d38222e	1e285969-0593-48fe-a438-dd213f99e7e0	1bd105f0-6658-4439-bef4-6bca8a11c244	美容院装修完成	完成美容院装修并准备开业	6	2026	NUMERIC	1	\N	0	ACTIVE	\N	2026-05-22 16:05:06.521	2026-05-22 16:05:06.521
0e28d427-3752-4922-a87e-42c3ddbaff62	1e285969-0593-48fe-a438-dd213f99e7e0	171414ee-8aa5-4833-af89-69d3eb53e297	体态训练达标12天	每周3天健身	6	2026	NUMERIC	12	\N	0	ACTIVE	\N	2026-05-22 16:02:52.58	2026-05-31 09:56:55.895
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
0368f43a-86a0-4cc8-8f60-e8424ec2860b	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	家庭存款达到300w	从当前10w积累到300w	2028	NUMERIC	3000000 元	2200000 元	2200000 元	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-21 13:45:20.103
039fb435-5dcc-4da5-9eca-d278fc4db1c6	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	练成薄肌挺拔身材（体脂率16%）	不驼背、肩背挺直的薄肌身材，体脂率从22%降到16%	2028	NUMERIC	16 %	18 %	18 %	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-21 13:45:20.094
c5f5bc79-5793-44c0-83f4-d3bb5b84ca98	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	自媒体账号达到5000粉丝	持续运营更新一个自媒体账号，积累5000粉丝	2028	NUMERIC	5000 粉丝	2500 粉丝	2500 粉丝	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-21 13:45:20.085
cfe13c61-f9c6-4b80-b3df-f743671d1ff7	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	家庭年收入达到110w	从当前72w提升到110w，3年内实现	2028	NUMERIC	1100000 元	900000 元	900000 元	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-21 13:45:20.066
2f7cc77c-5e0d-46a2-bc68-b4c440afa940	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	6h睡眠保持高精力（充沛率≥85%）	每天复盘时自评：①闹钟响起直接起？②下午不犯困？≥1个✅=当日充沛。月充沛率≥85%	2028	PERCENTAGE	85 %	65 %	65 %	ACTIVE	\N	2026-05-19 13:50:38.753	2026-05-21 13:45:20.076
83952657-fe93-4e89-854f-4590b978610a	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	自媒体粉丝达到500	2026里程碑：从0积累到800粉丝，建立运营节奏	2026	NUMERIC	500 粉丝	59 粉丝	0 粉丝	ACTIVE	\N	2026-05-19 14:53:58.941	2026-05-21 14:00:13.239
1bd105f0-6658-4439-bef4-6bca8a11c244	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	年收入达到78w	2026里程碑：从72w提升到78w	2026	NUMERIC	780000 元	720000 元	720000 元	ACTIVE	\N	2026-05-19 14:53:58.941	2026-05-21 13:45:19.942
171414ee-8aa5-4833-af89-69d3eb53e297	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	体脂率降到20%（薄肌身材）	2026里程碑：从22%降到20%，建立规律训练习惯	2026	NUMERIC	20 %	22 %	22 %	ACTIVE	\N	2026-05-19 14:53:58.941	2026-05-21 13:45:19.955
50c0532e-26c6-439b-a7d2-2144ad972e16	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	充沛率≥50%（6h睡眠高精力）	2026里程碑：晨起精力充沛率从40%提升到50%	2026	PERCENTAGE	50 %	40 %	30 %	ACTIVE	\N	2026-05-19 14:53:58.941	2026-05-21 13:45:19.967
4a9546d9-caa5-4f57-97c8-caa7c246bfbc	1e285969-0593-48fe-a438-dd213f99e7e0	496ae741-04f2-4791-9b8c-8139f658771a	家庭存款达到150w	2026里程碑：从10w积累到40w	2026	NUMERIC	1500000 元	1000000 元	1000000 元	ACTIVE	\N	2026-05-19 14:53:58.941	2026-05-21 13:45:20
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
-- Name: AnalysisSession AnalysisSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnalysisSession"
    ADD CONSTRAINT "AnalysisSession_pkey" PRIMARY KEY (id);


--
-- Name: BehaviorPattern BehaviorPattern_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BehaviorPattern"
    ADD CONSTRAINT "BehaviorPattern_pkey" PRIMARY KEY (id);


--
-- Name: CapabilityScore CapabilityScore_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CapabilityScore"
    ADD CONSTRAINT "CapabilityScore_pkey" PRIMARY KEY (id);


--
-- Name: CognitiveBiasLog CognitiveBiasLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CognitiveBiasLog"
    ADD CONSTRAINT "CognitiveBiasLog_pkey" PRIMARY KEY (id);


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
-- Name: AnalysisSession AnalysisSession_dailyReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnalysisSession"
    ADD CONSTRAINT "AnalysisSession_dailyReviewId_fkey" FOREIGN KEY ("dailyReviewId") REFERENCES public."DailyReview"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AnalysisSession AnalysisSession_monthlyReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnalysisSession"
    ADD CONSTRAINT "AnalysisSession_monthlyReviewId_fkey" FOREIGN KEY ("monthlyReviewId") REFERENCES public."MonthlyReview"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AnalysisSession AnalysisSession_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnalysisSession"
    ADD CONSTRAINT "AnalysisSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AnalysisSession AnalysisSession_weeklyReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AnalysisSession"
    ADD CONSTRAINT "AnalysisSession_weeklyReviewId_fkey" FOREIGN KEY ("weeklyReviewId") REFERENCES public."WeeklyReview"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: BehaviorPattern BehaviorPattern_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BehaviorPattern"
    ADD CONSTRAINT "BehaviorPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CapabilityScore CapabilityScore_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CapabilityScore"
    ADD CONSTRAINT "CapabilityScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CognitiveBiasLog CognitiveBiasLog_dailyReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CognitiveBiasLog"
    ADD CONSTRAINT "CognitiveBiasLog_dailyReviewId_fkey" FOREIGN KEY ("dailyReviewId") REFERENCES public."DailyReview"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CognitiveBiasLog CognitiveBiasLog_monthlyReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CognitiveBiasLog"
    ADD CONSTRAINT "CognitiveBiasLog_monthlyReviewId_fkey" FOREIGN KEY ("monthlyReviewId") REFERENCES public."MonthlyReview"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CognitiveBiasLog CognitiveBiasLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CognitiveBiasLog"
    ADD CONSTRAINT "CognitiveBiasLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CognitiveBiasLog CognitiveBiasLog_weeklyReviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CognitiveBiasLog"
    ADD CONSTRAINT "CognitiveBiasLog_weeklyReviewId_fkey" FOREIGN KEY ("weeklyReviewId") REFERENCES public."WeeklyReview"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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

\unrestrict ehacYIOAoXAQ4S1RzbCoKZ62WfCjn0efGaOsFxrWnpsfOTLkkwkgiT8n0hXi8G2

