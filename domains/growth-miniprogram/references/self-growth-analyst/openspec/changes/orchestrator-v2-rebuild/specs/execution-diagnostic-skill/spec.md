## ADDED Requirements

### Requirement: 执行力诊断脚本结构
skills_library/execution/ 从probes改为完整诊断脚本，包含trigger/diagnosis/intervention/verification四阶段。

#### Scenario: 标准诊断启动
- **WHEN** 用户描述一个反复计划但未完成的行为
- **THEN** 脚本按trigger→diagnosis→intervention→verification流程执行

#### Scenario: 执行力话题直接触发
- **WHEN** 用户明确说"执行力"、"做不到"、"拖延"
- **THEN** 直接进入trigger阶段

### Requirement: Trigger阶段
识别并确认执行卡点的具体表现。

#### Scenario: 卡点确认
- **WHEN** 用户说"我想减肥但总是失败"
- **THEN** 追问确认卡点："你说的失败具体是什么情况？是没开始，还是开始了但没坚持？"

### Requirement: Diagnosis阶段
使用福格模型诊断M/A/P缺失环节。

#### Scenario: M诊断
- **WHEN** Trigger确认后
- **THEN** 评估动机："减肥对你为什么重要？如果现在就能瘦，你会最想要什么？"

#### Scenario: A诊断
- **WHEN** M评估后
- **THEN** 评估能力："你尝试减肥时，通常在哪一步卡住？是不知道怎么做，还是知道但做不到？"

#### Scenario: P诊断
- **WHEN** A评估后
- **THEN** 评估提示："你打算什么时候运动？有没有固定的触发事件？"

### Requirement: Intervention阶段
根据诊断结果，生成个性化干预方案。

#### Scenario: M缺失干预
- **WHEN** 诊断发现动机不足
- **THEN** 探索深层渴望，对话目标从"减肥"转向更重要的内在渴望

#### Scenario: A缺失干预
- **WHEN** 诊断发现能力不足
- **THEN** 缩小目标（如"从每天5分钟开始"），建立微小成功体验

#### Scenario: P缺失干预
- **WHEN** 诊断发现提示不足
- **THEN** 绑定现有习惯："你每天早上刷牙后，可以顺便做2个俯卧撑吗？"

### Requirement: Verification阶段
约定验证时间和方式，跟踪执行情况。

#### Scenario: 约定验证
- **WHEN** 干预完成后
- **THEN** 询问"你打算什么时候开始尝试？我们约个时间我来看看进展"

#### Scenario: 记录待办
- **WHEN** 验证时间确定
- **THEN** 将承诺写入pending_actions.json，包含验证关键词