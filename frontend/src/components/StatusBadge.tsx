const colors: Record<string, string> = {
  ACTIVE: '#22c55e', COMPLETED: '#3b82f6', ABANDONED: '#ef4444',
  ARCHIVED: '#9ca3af', SUSPENDED: '#eab308',
  PENDING: '#9ca3af', IN_PROGRESS: '#22c55e',
  PARTIAL: '#eab308', FAILED: '#ef4444', CANCELLED: '#9ca3af',
  INPUTTING: '#eab308', ANALYZING: '#a855f7', SKIPPED: '#9ca3af',
};
const labels: Record<string, string> = {
  ACTIVE: '进行中', COMPLETED: '已完成', ABANDONED: '已放弃',
  ARCHIVED: '已归档', SUSPENDED: '已暂停',
  PENDING: '待开始', IN_PROGRESS: '进行中',
  PARTIAL: '部分完成', FAILED: '失败', CANCELLED: '已取消',
  INPUTTING: '输入中', ANALYZING: '分析中', SKIPPED: '已跳过',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 12, fontSize: 12,
      background: colors[status] || '#9ca3af',
      color: '#fff', fontWeight: 500,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', opacity: 0.7 }} />
      {labels[status] || status}
    </span>
  );
}
